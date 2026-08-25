const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { publishGradeToBlockchain } = require('../services/web3Service');

// Grade a Submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId, score, feedback } = req.body;
    
    // Ensure submission exists and isn't already graded
    const submission = await prisma.submission.findUnique({ 
      where: { id: submissionId },
      include: { grade: true, assessment: true } 
    });

    if (!submission) {
      return res.status(404).json({ status: 'ERROR', message: 'Submission not found' });
    }

    if (submission.grade) {
      return res.status(400).json({ status: 'ERROR', message: 'Submission already graded' });
    }

    // 1. Publish to Ethereum Blockchain
    const txHash = await publishGradeToBlockchain(
      submission.id,
      submission.studentId,
      submission.ipfsHash,
      score
    );

    // 2. Save locally in DB
    const grade = await prisma.grade.create({
      data: {
        submissionId: submission.id,
        gradedByLecturerId: req.user.id,
        score: parseFloat(score),
        feedback,
        blockchainTxHash: txHash
      }
    });

    // Update submission status
    await prisma.submission.update({
      where: { id: submission.id },
      data: { status: 'GRADED' }
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: req.user.id,
        actionType: 'GRADE_PUBLISHED',
        description: `Published grade for submission ${submission.id}. TxHash: ${txHash}`
      }
    });

    res.status(201).json({ status: 'SUCCESS', message: 'Grade published immutably', grade });
  } catch (error) {
    console.error('Grading Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error while grading' });
  }
};
