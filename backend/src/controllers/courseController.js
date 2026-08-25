const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Course (Admin only)
exports.createCourse = async (req, res) => {
  try {
    const { courseCode, courseName, description } = req.body;
    
    // Check if course code exists
    const existing = await prisma.course.findUnique({ where: { courseCode } });
    if (existing) {
      return res.status(400).json({ status: 'ERROR', message: 'Course Code already exists.' });
    }

    const course = await prisma.course.create({
      data: { courseCode, courseName, description }
    });

    res.status(201).json({ status: 'SUCCESS', message: 'Course created', course });
  } catch (error) {
    console.error('Create Course Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
};

// List Courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany();
    res.status(200).json({ status: 'SUCCESS', courses });
  } catch (error) {
    console.error('Get Courses Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
};

// Enroll Student
exports.enrollStudent = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { studentId } = req.body;

    const enrollment = await prisma.courseEnrollment.create({
      data: { courseId, studentId }
    });

    res.status(201).json({ status: 'SUCCESS', message: 'Student enrolled', enrollment });
  } catch (error) {
    console.error('Enroll Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Could not enroll student. They might already be enrolled.' });
  }
};

// Assign Lecturer
exports.assignLecturer = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { lecturerId } = req.body;

    const assignment = await prisma.courseLecturer.create({
      data: { courseId, lecturerId }
    });

    res.status(201).json({ status: 'SUCCESS', message: 'Lecturer assigned', assignment });
  } catch (error) {
    console.error('Assign Lecturer Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Could not assign lecturer.' });
  }
};
