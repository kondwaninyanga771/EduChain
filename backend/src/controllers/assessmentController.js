const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { pinFileToIPFS } = require('../services/ipfsService');
const fs = require('fs');
const web3Service = require('../services/web3Service');

// Create Assessment
exports.createAssessment = async (req, res) => {
  try {
    const { courseId, title, description, dueDate, type, questions } = req.body;
    const file = req.file;

    // Data Validation
    if (!title || title.trim().length < 5 || title.trim().length > 100) {
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ status: 'ERROR', message: 'Title must be between 5 and 100 characters.' });
    }
    
    if (!description || description.trim().length < 20) {
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ status: 'ERROR', message: 'Description must be at least 20 characters long.' });
    }

    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime()) || parsedDueDate < new Date()) {
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ status: 'ERROR', message: 'Due date must be a valid future date.' });
    }

    
    // Ensure course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(404).json({ status: 'ERROR', message: 'Course not found' });
    }

    let parsedQuestions = questions;
    if (typeof questions === 'string') {
      try {
        parsedQuestions = JSON.parse(questions);
      } catch(e) {}
    }

    let questionsJson = null;
    if (type === 'QUIZ') {
      if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return res.status(400).json({ status: 'ERROR', message: 'Quizzes must have at least one question.' });
      }

      for (let i = 0; i < parsedQuestions.length; i++) {
        const q = parsedQuestions[i];
        if (!q.text || q.text.trim().length < 5) {
          if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
          return res.status(400).json({ status: 'ERROR', message: `Question ${i + 1} text must be at least 5 characters.` });
        }
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
          return res.status(400).json({ status: 'ERROR', message: `Question ${i + 1} must have exactly 4 options.` });
        }
        if (q.options.some(opt => !opt || opt.trim().length === 0)) {
          if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
          return res.status(400).json({ status: 'ERROR', message: `Question ${i + 1} options cannot be empty.` });
        }
        if (typeof q.correctOptionIndex !== 'number' || q.correctOptionIndex < 0 || q.correctOptionIndex > 3) {
          if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
          return res.status(400).json({ status: 'ERROR', message: `Question ${i + 1} must have a valid correct option.` });
        }
      }

      questionsJson = JSON.stringify(parsedQuestions);
    }

    let ipfsHash = null;
    let fileName = null;
    if (file) {
      ipfsHash = await pinFileToIPFS(file.path, file.originalname);
      fileName = file.originalname;
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    // Publish assessment creation to blockchain
    const assessmentTxHash = await web3Service.publishAssessmentToBlockchain(
      'NEW_ASSESSMENT',
      req.user.id,
      ipfsHash || "QUIZ_NO_FILE"
    );

    const assessment = await prisma.assessment.create({
      data: {
        courseId,
        createdByLecturerId: req.user.id,
        title,
        description,
        type: type || 'FILE_UPLOAD',
        ipfsHash,
        fileName,
        questionsJson,
        dueDate: new Date(dueDate),
        blockchainTxHash: assessmentTxHash
      }
    });

    // Log the action
    if (req.user && req.user.id) {
      await prisma.systemLog.create({
        data: {
          userId: req.user.id,
          actionType: 'ASSESSMENT_CREATED',
          description: `Lecturer created assessment: ${title} (${type || 'FILE_UPLOAD'})`,
          ipAddress: req.ip || req.connection.remoteAddress
        }
      });
    }

    res.status(201).json({ status: 'SUCCESS', message: 'Assessment created', assessment });
  } catch (error) {
    console.error('Create Assessment Error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
};

// Get Assessments by Course
exports.getAssessmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const assessments = await prisma.assessment.findMany({
      where: { courseId }
    });
    res.status(200).json({ status: 'SUCCESS', assessments });
  } catch (error) {
    console.error('Get Assessments Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
};

// Edit Assessment
exports.updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, questions } = req.body;
    
    let questionsJson = undefined;
    if (questions) {
      if (typeof questions === 'string') {
        questionsJson = questions;
      } else {
        questionsJson = JSON.stringify(questions);
      }
    }

    const assessment = await prisma.assessment.update({
      where: { id },
      data: { 
        title, 
        description, 
        dueDate: new Date(dueDate),
        ...(questionsJson !== undefined && { questionsJson })
      }
    });

    res.status(200).json({ status: 'SUCCESS', message: 'Assessment updated', assessment });
  } catch (error) {
    console.error('Update Assessment Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
};

// Delete Assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.assessment.delete({ where: { id } });

    res.status(200).json({ status: 'SUCCESS', message: 'Assessment deleted' });
  } catch (error) {
    console.error('Delete Assessment Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
};
