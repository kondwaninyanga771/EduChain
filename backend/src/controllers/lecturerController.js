const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const web3Service = require('../services/web3Service');

exports.getLecturerDashboardData = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    // 1. Courses Managed
    const coursesManagedCount = await prisma.courseLecturer.count({
      where: { lecturerId }
    });

    // 2. Assessments Created
    const assessmentsCreatedCount = await prisma.assessment.count({
      where: { createdByLecturerId: lecturerId }
    });

    // 3. Pending Grading
    const pendingGradingCount = await prisma.submission.count({
      where: {
        status: 'PENDING',
        assessment: {
          createdByLecturerId: lecturerId
        }
      }
    });

    // 4. Published Results
    const publishedResultsCount = await prisma.grade.count({
      where: { gradedByLecturerId: lecturerId }
    });

    // 5. Student Performance Analytics (Average score per course)
    const courses = await prisma.courseLecturer.findMany({
      where: { lecturerId },
      include: { course: true }
    });

    const performanceData = [];
    for (const cl of courses) {
      // Find all grades for assessments in this course created by this lecturer
      const grades = await prisma.grade.findMany({
        where: {
          submission: {
            assessment: {
              courseId: cl.courseId,
              createdByLecturerId: lecturerId
            }
          }
        }
      });
      
      let average = 0;
      let highest = 0;
      let lowest = 0;
      
      if (grades.length > 0) {
        let sum = 0;
        lowest = 100; // start max
        grades.forEach(g => {
          sum += g.score;
          if (g.score > highest) highest = g.score;
          if (g.score < lowest) lowest = g.score;
        });
        average = Math.round(sum / grades.length);
      }
      
      performanceData.push({
        name: cl.course.courseCode,
        average,
        highest,
        lowest: grades.length > 0 ? lowest : 0
      });
    }

    if (performanceData.length === 0) {
      performanceData.push({ name: 'No Data', average: 0, highest: 0, lowest: 0 });
    }

    // 6. Submission Statistics (Completion rates for recent assessments)
    const recentAssessments = await prisma.assessment.findMany({
      where: { createdByLecturerId: lecturerId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const submissionData = [];
    for (const assessment of recentAssessments) {
      // Find total students enrolled in the course for this assessment
      const enrollments = await prisma.courseEnrollment.count({
        where: { courseId: assessment.courseId }
      });

      // Find total submitted
      const submitted = await prisma.submission.count({
        where: { assessmentId: assessment.id }
      });

      // Pending = total enrolled - submitted (who haven't submitted yet)
      let pending = enrollments - submitted;
      if (pending < 0) pending = 0; // sanity check
      
      // Alternatively, "pending" could mean "submitted but pending grading", but the mockup 
      // shows "Submitted" vs "Pending" (meaning hasn't submitted yet).
      // Let's go with "students who haven't submitted yet".

      // Shrink title for chart
      let shortName = assessment.title;
      if (shortName.length > 15) shortName = shortName.substring(0, 12) + '...';

      submissionData.push({
        name: shortName,
        submitted: submitted,
        pending: pending
      });
    }

    res.json({
      summary: {
        coursesManaged: coursesManagedCount,
        assessmentsCreated: assessmentsCreatedCount,
        pendingGrading: pendingGradingCount,
        publishedResults: publishedResultsCount
      },
      performanceData,
      submissionData: submissionData.reverse() // show oldest to newest from recent 5
    });

  } catch (error) {
    console.error('Error fetching lecturer dashboard data:', error);
    res.status(500).json({ error: 'Server error fetching dashboard data' });
  }
};

exports.getLecturerCourses = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    const assignedCourses = await prisma.courseLecturer.findMany({
      where: { lecturerId },
      include: { course: true }
    });

    const coursesData = [];
    for (const assignment of assignedCourses) {
      const studentCount = await prisma.courseEnrollment.count({
        where: { courseId: assignment.courseId }
      });

      coursesData.push({
        id: assignment.course.id,
        code: assignment.course.courseCode,
        title: assignment.course.courseName,
        students: studentCount
      });
    }

    res.json(coursesData);
  } catch (error) {
    console.error('Error fetching lecturer courses:', error);
    res.status(500).json({ error: 'Server error fetching courses' });
  }
};

exports.getLecturerAssessments = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    const assessments = await prisma.assessment.findMany({
      where: { createdByLecturerId: lecturerId },
      include: { course: true },
      orderBy: { dueDate: 'asc' }
    });

    const assessmentsData = [];
    for (const assessment of assessments) {
      const submissionsCount = await prisma.submission.count({
        where: { assessmentId: assessment.id }
      });

      assessmentsData.push({
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        type: assessment.type,
        questionsJson: assessment.questionsJson,
        course: assessment.course.courseCode,
        deadline: assessment.dueDate,
        submissions: submissionsCount
      });
    }

    res.json(assessmentsData);
  } catch (error) {
    console.error('Error fetching lecturer assessments:', error);
    res.status(500).json({ error: 'Server error fetching assessments' });
  }
};

exports.getLecturerSubmissions = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    const submissions = await prisma.submission.findMany({
      where: {
        assessment: {
          createdByLecturerId: lecturerId
        }
      },
      include: {
        student: true,
        assessment: true
      },
      orderBy: { submittedAt: 'desc' }
    });

    const submissionsData = submissions.map(sub => {
      // Map PENDING/GRADED to frontend friendly labels
      let statusLabel = 'Needs Grading';
      if (sub.status === 'GRADED') {
        statusLabel = 'Graded';
      }

      return {
        id: sub.id,
        studentName: sub.student.fullName,
        // Using substring to mock a student ID style from the UUID for the frontend table
        studentId: `STU-${sub.student.id.substring(0, 8).toUpperCase()}`,
        assessment: sub.assessment.title,
        date: sub.submittedAt,
        status: statusLabel,
        ipfsHash: sub.ipfsHash,
        fileName: sub.fileName,
        dueDate: sub.assessment.dueDate,
        isLate: new Date(sub.submittedAt) > new Date(sub.assessment.dueDate)
      };
    });

    res.json(submissionsData);
  } catch (error) {
    console.error('Error fetching lecturer submissions:', error);
    res.status(500).json({ error: 'Server error fetching submissions' });
  }
};

exports.getLecturerPublishedResults = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    // Fetch all grades given by this lecturer
    const grades = await prisma.grade.findMany({
      where: { gradedByLecturerId: lecturerId },
      include: {
        submission: {
          include: {
            assessment: {
              include: { course: true }
            },
            student: true
          }
        }
      },
      orderBy: { gradedAt: 'desc' }
    });

    // Compute Summary Stats
    const uniqueStudents = new Set();
    const uniqueAssessments = new Set();
    let totalScoreSum = 0;

    grades.forEach(g => {
      uniqueStudents.add(g.submission.studentId);
      uniqueAssessments.add(g.submission.assessmentId);
      totalScoreSum += g.score;
    });

    const summary = {
      totalAssessmentsGraded: uniqueAssessments.size,
      studentsGraded: uniqueStudents.size,
      overallAverageScore: grades.length > 0 ? (totalScoreSum / grades.length).toFixed(1) : 0
    };

    // Group grades by Assessment for the table
    const assessmentMap = {}; // assessmentId -> data

    grades.forEach(g => {
      const assessment = g.submission.assessment;
      if (!assessmentMap[assessment.id]) {
        assessmentMap[assessment.id] = {
          id: assessment.id,
          assessment: assessment.title,
          course: assessment.course.courseCode,
          students: 0,
          scoreSum: 0,
          latestDate: g.gradedAt // Due to desc ordering, first encountered is often latest, but let's compare just in case
        };
      }
      
      const aData = assessmentMap[assessment.id];
      aData.students += 1;
      aData.scoreSum += g.score;
      if (new Date(g.gradedAt) > new Date(aData.latestDate)) {
        aData.latestDate = g.gradedAt;
      }
    });

    const results = Object.values(assessmentMap).map(a => ({
      id: a.id,
      assessment: a.assessment,
      course: a.course,
      students: a.students,
      averageScore: Math.round(a.scoreSum / a.students),
      date: a.latestDate
    }));

    // Sort results by latest date descending
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ summary, results });
  } catch (error) {
    console.error('Error fetching lecturer results:', error);
    res.status(500).json({ error: 'Server error fetching published results' });
  }
};

exports.getLecturerRecords = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    const grades = await prisma.grade.findMany({
      where: {
        gradedByLecturerId: lecturerId,
        blockchainTxHash: { not: null }
      },
      include: {
        submission: {
          include: { student: true }
        }
      },
      orderBy: { gradedAt: 'desc' }
    });

    const records = grades.map(g => ({
      id: g.id,
      hash: g.blockchainTxHash,
      action: 'Grade Published',
      student: `STU-${g.submission.student.id.substring(0, 8).toUpperCase()}`,
      timestamp: g.gradedAt,
      status: 'Confirmed'
    }));

    res.json(records);
  } catch (error) {
    console.error('Error fetching lecturer blockchain records:', error);
    res.status(500).json({ error: 'Server error fetching records' });
  }
};

exports.getSubmissionDetails = async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        student: true,
        assessment: true
      }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Ensure the lecturer is the creator of the assessment
    if (submission.assessment.createdByLecturerId !== lecturerId) {
      return res.status(403).json({ error: 'Unauthorized to view this submission' });
    }

    let statusLabel = 'Needs Grading';
    if (submission.status === 'GRADED') {
      statusLabel = 'Graded';
    }

    res.json({
      id: submission.id,
      studentName: submission.student.fullName,
      studentId: `STU-${submission.student.id.substring(0, 8).toUpperCase()}`,
      assessment: submission.assessment.title,
      date: submission.submittedAt,
      fileName: submission.fileName,
      ipfsHash: submission.ipfsHash,
      status: statusLabel,
      dueDate: submission.assessment.dueDate,
      isLate: new Date(submission.submittedAt) > new Date(submission.assessment.dueDate)
    });
  } catch (error) {
    console.error('Error fetching submission details:', error);
    res.status(500).json({ error: 'Server error fetching submission details' });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const { id } = req.params;
    const { score, feedback } = req.body;

    if (score === undefined || score < 0 || score > 100) {
      return res.status(400).json({ error: 'Valid score (0-100) is required' });
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { assessment: true }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.assessment.createdByLecturerId !== lecturerId) {
      return res.status(403).json({ error: 'Unauthorized to grade this submission' });
    }

    if (submission.status === 'GRADED') {
      return res.status(400).json({ error: 'Submission is already graded' });
    }

    // Publish to blockchain
    const txHash = await web3Service.publishGradeToBlockchain(
      submission.id,
      submission.studentId,
      submission.ipfsHash,
      score
    );

    // Save grade to database and update submission status transactionally
    await prisma.$transaction([
      prisma.grade.create({
        data: {
          submissionId: submission.id,
          gradedByLecturerId: lecturerId,
          score: parseInt(score, 10),
          feedback: feedback || null,
          blockchainTxHash: txHash
        }
      }),
      prisma.submission.update({
        where: { id: submission.id },
        data: { status: 'GRADED' }
      })
    ]);

    res.json({ success: true, message: 'Grade published successfully', txHash });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ error: error.message || 'Server error grading submission' });
  }
};
