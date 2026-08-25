const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { pinFileToIPFS } = require('../services/ipfsService');
const web3Service = require('../services/web3Service');
const fs = require('fs');

// Submit or Edit an Assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assessmentId, answersJson } = req.body;
    const file = req.file;

    // Ensure assessment exists
    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
    if (!assessment) {
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path); // clean up
      return res.status(404).json({ status: 'ERROR', message: 'Assessment not found' });
    }

    if (assessment.type === 'FILE_UPLOAD' && !file) {
      return res.status(400).json({ status: 'ERROR', message: 'No file uploaded' });
    }
    if (assessment.type === 'QUIZ' && !answersJson) {
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ status: 'ERROR', message: 'No answers provided for quiz' });
    }

    // Due date check removed to allow late submissions. 
    // They will be flagged as late on the frontend.

    let ipfsHash = null;
    let fileName = null;

    if (file) {
      // Upload to IPFS
      ipfsHash = await pinFileToIPFS(file.path, file.originalname);
      fileName = file.originalname;
      // Clean up local file
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    // Auto-grading logic for QUIZ
    let autoScore = null;
    let isGraded = false;
    
    if (assessment.type === 'QUIZ') {
      const studentAnswers = JSON.parse(answersJson);
      const questions = JSON.parse(assessment.questionsJson || '[]');
      
      let totalPoints = 0;
      let earnedPoints = 0;
      
      questions.forEach((q, index) => {
        totalPoints += q.points || 1;
        const sAns = studentAnswers.find(sa => sa.questionIndex === index);
        if (sAns && sAns.selectedOptionIndex === q.correctOptionIndex) {
          earnedPoints += q.points || 1;
        }
      });
      
      autoScore = Math.round((earnedPoints / (totalPoints || 1)) * 100);
      isGraded = true;
    }

    // Check if submission already exists
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assessmentId,
        studentId: req.user.id
      }
    });

    // Publish submission to blockchain
    const submissionTxHash = await web3Service.publishSubmissionToBlockchain(
      existingSubmission ? existingSubmission.id : 'NEW_SUBMISSION',
      req.user.id,
      ipfsHash || "QUIZ_NO_FILE"
    );

    let submission;
    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          ipfsHash: ipfsHash || existingSubmission.ipfsHash,
          fileName: fileName || existingSubmission.fileName,
          answersJson: answersJson || null,
          submittedAt: new Date(),
          status: isGraded ? 'GRADED' : 'PENDING',
          blockchainTxHash: submissionTxHash
        }
      });
    } else {
      // Save to Database
      submission = await prisma.submission.create({
        data: {
          assessmentId,
          studentId: req.user.id,
          ipfsHash,
          fileName,
          answersJson: answersJson || null,
          status: isGraded ? 'GRADED' : 'PENDING',
          blockchainTxHash: submissionTxHash
        }
      });
    }

    // If auto-graded, create grade and publish to blockchain
    if (isGraded) {
      const existingGrade = await prisma.grade.findUnique({ where: { submissionId: submission.id } });
      
      const txHash = await web3Service.publishGradeToBlockchain(
        submission.id,
        submission.studentId,
        ipfsHash || "QUIZ_NO_FILE",
        autoScore
      );

      if (existingGrade) {
        await prisma.grade.update({
          where: { id: existingGrade.id },
          data: {
            score: autoScore,
            blockchainTxHash: txHash,
            gradedAt: new Date()
          }
        });
      } else {
        await prisma.grade.create({
          data: {
            submissionId: submission.id,
            gradedByLecturerId: assessment.createdByLecturerId, // Auto-graded by the creator
            score: autoScore,
            feedback: "Auto-graded multiple choice quiz",
            blockchainTxHash: txHash
          }
        });
      }
    }

    res.status(201).json({ status: 'SUCCESS', message: 'Assignment submitted successfully', submission, score: autoScore });
  } catch (error) {
    console.error('Submission Error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ status: 'ERROR', message: 'Internal server error during submission' });
  }
};

// Get Submissions for an Assessment
exports.getSubmissionsByAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const submissions = await prisma.submission.findMany({
      where: { assessmentId },
      include: {
        student: { select: { fullName: true, email: true } },
        grade: true
      }
    });
    res.status(200).json({ status: 'SUCCESS', submissions });
  } catch (error) {
    console.error('Get Submissions Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
};
