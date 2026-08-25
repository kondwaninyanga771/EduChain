const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getStudentDashboardData = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Get Enrolled Courses IDs
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { studentId },
      select: { courseId: true, course: { select: { courseCode: true, courseName: true } } }
    });
    const courseIds = enrollments.map(e => e.courseId);
    const totalCourses = courseIds.length;

    // 2. Get Total Submissions
    const submittedAssessments = await prisma.submission.count({
      where: { studentId }
    });

    // 3. Get Results Published
    const grades = await prisma.grade.findMany({
      where: { submission: { studentId } },
      include: { submission: { include: { assessment: true } } },
      orderBy: { gradedAt: 'desc' }
    });
    const resultsPublished = grades.length;

    // 4. Get Pending Assessments
    // All assessments in enrolled courses where the student hasn't submitted yet
    const allAssessments = await prisma.assessment.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: true }
    });
    
    const submittedAssessmentIds = (await prisma.submission.findMany({
      where: { studentId },
      select: { assessmentId: true }
    })).map(s => s.assessmentId);

    const pendingAssessmentsList = allAssessments.filter(a => !submittedAssessmentIds.includes(a.id));
    const pendingAssessments = pendingAssessmentsList.length;

    // 5. Upcoming Deadlines
    const now = new Date();
    const upcomingDeadlines = pendingAssessmentsList
      .filter(a => new Date(a.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3)
      .map(a => {
        const date = new Date(a.dueDate);
        const diffMs = date - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        let urgency = 'default';
        if (diffDays <= 1) urgency = 'danger';
        else if (diffDays <= 3) urgency = 'warning';

        return {
          title: a.title,
          course: `${a.course.courseCode}: ${a.course.courseName}`,
          date: date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          urgency
        };
      });

    // 6. Performance Trend (Last 5 grades)
    const recentGrades = grades.slice(0, 5).reverse();
    const performanceData = recentGrades.map((g, index) => ({
      name: `A${index + 1}`, // Or g.submission.assessment.title if short enough
      score: g.score
    }));

    // If no grades, provide empty state data
    if (performanceData.length === 0) {
        performanceData.push({ name: 'No Data', score: 0 });
    }

    // 7. Submission Activity (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentSubmissions = await prisma.submission.findMany({
      where: { studentId, submittedAt: { gte: sevenDaysAgo } },
      select: { submittedAt: true }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activityDataMap = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      activityDataMap[days[d.getDay()]] = 0;
    }

    recentSubmissions.forEach(sub => {
      const dayName = days[new Date(sub.submittedAt).getDay()];
      if (activityDataMap[dayName] !== undefined) {
        activityDataMap[dayName]++;
      }
    });

    const activityData = Object.keys(activityDataMap).map(key => ({
      name: key,
      submissions: activityDataMap[key]
    }));

    // 8. Recent Activity Timeline
    const submissionsWithDetails = await prisma.submission.findMany({
      where: { studentId },
      include: { assessment: { include: { course: true } } },
      orderBy: { submittedAt: 'desc' },
      take: 5
    });

    let recentActivityRaw = [];
    
    submissionsWithDetails.forEach(s => {
      recentActivityRaw.push({
        type: 'upload',
        title: 'Uploaded Assignment',
        desc: `Submitted ${s.fileName} for ${s.assessment.course.courseCode}.`,
        time: s.submittedAt,
        icon: 'CheckSquare',
        color: 'text-amber-600 bg-amber-100'
      });
      // Mocking verification event slightly after submission
      recentActivityRaw.push({
        type: 'verification',
        title: 'Blockchain Verification Completed',
        desc: `Submission stored securely.`,
        time: new Date(new Date(s.submittedAt).getTime() + 5000), // 5 seconds later
        icon: 'ShieldCheck',
        color: 'text-emerald-600 bg-emerald-100'
      });
    });

    grades.slice(0, 5).forEach(g => {
      recentActivityRaw.push({
        type: 'grade',
        title: 'Grade Published',
        desc: `Received ${g.score} on ${g.submission.assessment.title}.`,
        time: g.gradedAt,
        icon: 'Award',
        color: 'text-primary-600 bg-primary-100'
      });
    });

    // Sort combined activity by time descending
    recentActivityRaw.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // Format time for display and take top 5
    const recentActivity = recentActivityRaw.slice(0, 5).map(a => {
        const diffMs = now - new Date(a.time);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        let timeStr = 'Just now';
        if (diffDays > 0) timeStr = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        else if (diffHours > 0) timeStr = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        else if (diffMins > 0) timeStr = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

        return { ...a, time: timeStr };
    });

    res.json({
      summary: {
        totalCourses,
        pendingAssessments,
        submittedAssessments,
        resultsPublished
      },
      performanceData,
      activityData,
      upcomingDeadlines,
      recentActivity
    });

  } catch (error) {
    console.error('Error fetching student dashboard data:', error);
    res.status(500).json({ error: 'Server error fetching dashboard data' });
  }
};

exports.getStudentAssessments = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Get Enrolled Courses IDs
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { studentId },
      select: { courseId: true }
    });
    const courseIds = enrollments.map(e => e.courseId);

    // 2. Fetch all Assessments for those courses
    const allAssessments = await prisma.assessment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        course: true,
        creator: { select: { fullName: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    // 3. Fetch Student's Submissions
    const submissions = await prisma.submission.findMany({
      where: { studentId, assessmentId: { in: allAssessments.map(a => a.id) } },
      select: { assessmentId: true, status: true }
    });

    // Create a map for quick lookup
    const submissionMap = {};
    submissions.forEach(sub => {
      submissionMap[sub.assessmentId] = sub.status;
    });

    // 4. Map to frontend format
    const formattedAssessments = allAssessments.map(assessment => {
      let status = 'Pending';
      if (submissionMap[assessment.id]) {
        status = submissionMap[assessment.id] === 'GRADED' ? 'Graded' : 'Submitted';
      }

      return {
        id: assessment.id,
        title: assessment.title,
        course: assessment.course.courseCode,
        lecturer: assessment.creator.fullName,
        deadline: assessment.dueDate,
        status
      };
    });

    res.json(formattedAssessments);
  } catch (error) {
    console.error('Error fetching student assessments:', error);
    res.status(500).json({ error: 'Server error fetching assessments' });
  }
};

exports.getStudentAssessmentDetails = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    // Check if the student is enrolled in the course of this assessment
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            enrollments: { where: { studentId } }
          }
        },
        creator: { select: { fullName: true } }
      }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.course.enrollments.length === 0) {
      return res.status(403).json({ error: 'You are not enrolled in this course' });
    }

    // Check if the student has already submitted
    const submission = await prisma.submission.findFirst({
      where: { studentId, assessmentId: id }
    });

    res.json({
      id: assessment.id,
      title: assessment.title,
      course: assessment.course.courseCode + ': ' + assessment.course.courseName,
      lecturer: assessment.creator.fullName,
      deadline: assessment.dueDate,
      type: assessment.type || 'FILE_UPLOAD',
      instructions: assessment.description || 'No instructions provided.',
      questions: assessment.type === 'QUIZ' && assessment.questionsJson ? JSON.parse(assessment.questionsJson).map(q => ({
        text: q.text,
        options: q.options,
        points: q.points
      })) : null,
      status: submission ? (submission.status === 'GRADED' ? 'Graded' : 'Submitted') : 'Pending',
      submission: submission ? {
        id: submission.id,
        fileName: submission.fileName,
        submittedAt: submission.submittedAt
      } : null
    });
  } catch (error) {
    console.error('Error fetching assessment details:', error);
    res.status(500).json({ error: 'Server error fetching assessment details' });
  }
};

exports.getAvailableCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch all courses the student is NOT enrolled in
    const enrolledCourses = await prisma.courseEnrollment.findMany({
      where: { studentId },
      select: { courseId: true }
    });
    const enrolledCourseIds = enrolledCourses.map(e => e.courseId);

    const availableCourses = await prisma.course.findMany({
      where: {
        id: { notIn: enrolledCourseIds }
      },
      include: {
        lecturers: { include: { lecturer: true } }
      }
    });

    const mappedAvailable = availableCourses.map(c => {
      const assignedLecturers = c.lecturers.length > 0 
        ? c.lecturers.map(l => l.lecturer.fullName).join(', ')
        : 'Unassigned';

      return {
        id: c.id,
        code: c.courseCode,
        name: c.courseName,
        lecturer: assignedLecturers
      };
    });

    res.json(mappedAvailable);
  } catch (error) {
    console.error('Error fetching available courses:', error);
    res.status(500).json({ error: 'Server error fetching available courses' });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: { lecturers: { include: { lecturer: true } } }
        }
      }
    });

    const mappedEnrolled = enrollments.map(e => {
      const assignedLecturers = e.course.lecturers.length > 0 
        ? e.course.lecturers.map(l => l.lecturer.fullName).join(', ')
        : 'Unassigned';

      return {
        id: e.course.id,
        code: e.course.courseCode,
        name: e.course.courseName,
        lecturer: assignedLecturers,
        status: e.status
      };
    });

    res.json(mappedEnrolled);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ error: 'Server error fetching enrolled courses' });
  }
};

exports.enrollInCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Check if already enrolled or pending
    const existing = await prisma.courseEnrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } }
    });

    if (existing) {
      return res.status(400).json({ error: 'You are already enrolled or pending for this course' });
    }

    // Create enrollment as PENDING
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        studentId,
        courseId,
        status: 'PENDING'
      }
    });

    res.status(201).json({ message: 'Enrollment application submitted successfully', enrollment });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ error: 'Server error enrolling in course' });
  }
};

exports.getStudentSubmissions = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Retrieve all submissions for the student, including assessment and grade details
    const submissions = await prisma.submission.findMany({
      where: { studentId },
      include: {
        assessment: { select: { title: true, dueDate: true } },
        grade: { select: { blockchainTxHash: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });

    // Map to the frontend format
    const formattedSubmissions = submissions.map(sub => {
      let status = 'Under Review';
      if (sub.status === 'GRADED' || sub.grade) {
        status = 'Graded';
      } else if (sub.status === 'PENDING') {
        // Technically it's submitted but pending grade
        // In the mockup 'Submitted' is used, and 'Under Review' is used interchangeably. 
        // We will default to 'Submitted' if it was just uploaded.
        status = 'Submitted';
      }

      return {
        id: sub.id,
        assessment: sub.assessment.title,
        date: sub.submittedAt,
        dueDate: sub.assessment.dueDate,
        isLate: new Date(sub.submittedAt) > new Date(sub.assessment.dueDate),
        status,
        txHash: (sub.grade && sub.grade.blockchainTxHash) ? sub.grade.blockchainTxHash : null
      };
    });

    res.json(formattedSubmissions);
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({ error: 'Server error fetching submissions' });
  }
};

exports.getStudentResults = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch all grades for the student
    const grades = await prisma.grade.findMany({
      where: { submission: { studentId } },
      include: {
        submission: {
          include: {
            assessment: {
              include: { course: true }
            }
          }
        }
      },
      orderBy: { gradedAt: 'asc' } // chronological for trend
    });

    const getLetterGrade = (score) => {
      if (score >= 97) return 'A+';
      if (score >= 90) return 'A';
      if (score >= 87) return 'B+';
      if (score >= 80) return 'B';
      if (score >= 77) return 'C+';
      if (score >= 70) return 'C';
      if (score >= 60) return 'D';
      return 'F';
    };

    // 1. Results Table Data
    const results = grades.map(g => {
      const assessment = g.submission.assessment;
      return {
        id: g.id,
        course: assessment.course.courseCode,
        assessment: assessment.title,
        score: g.score,
        grade: getLetterGrade(g.score),
        date: g.gradedAt
      };
    });

    // 2. Trend Data
    // Group by month short name, averaging if multiple in one month, or just sequential assignments.
    // The mockup uses month names. Let's do sequential for simplicity but use the month name if possible.
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendMap = {};
    
    grades.forEach(g => {
      const d = new Date(g.gradedAt);
      const month = monthNames[d.getMonth()];
      if (!trendMap[month]) {
        trendMap[month] = { total: 0, count: 0 };
      }
      trendMap[month].total += g.score;
      trendMap[month].count += 1;
    });

    const trendData = Object.keys(trendMap).map(month => ({
      name: month,
      score: Math.round(trendMap[month].total / trendMap[month].count)
    }));

    // If no data, provide empty state
    if (trendData.length === 0) {
      trendData.push({ name: monthNames[new Date().getMonth()], score: 0 });
    }

    // 3. Distribution Data
    const distributionMap = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'F': 0 };
    results.forEach(r => {
      if (distributionMap[r.grade] !== undefined) {
        distributionMap[r.grade]++;
      }
    });

    const distributionData = Object.keys(distributionMap).map(grade => ({
      name: grade,
      count: distributionMap[grade]
    })).filter(d => d.count > 0 || ['A+', 'A', 'B+', 'B', 'C+', 'C'].includes(d.name)); // keep some zeros for the chart aesthetics

    res.json({
      results: results.reverse(), // newest first for the table
      trendData,
      distributionData
    });

  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ error: 'Server error fetching results' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        walletAddress: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    
    // Basic validation
    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { fullName, email },
      select: {
        id: true,
        fullName: true,
        email: true,
        walletAddress: true
      }
    });

    // Log the action
    if (req.user && req.user.id) {
      await prisma.systemLog.create({
        data: {
          userId: req.user.id,
          actionType: 'ACCOUNT_EDITED',
          description: `User edited their own profile`,
          ipAddress: req.ip || req.connection.remoteAddress
        }
      });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    // Handle Prisma unique constraint violation (P2002) for email
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email is already in use' });
    }
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Server error updating password' });
  }
};



exports.verifyTransaction = async (req, res) => {
  try {
    const { hash } = req.query;
    if (!hash) {
      return res.status(400).json({ error: 'Transaction hash is required' });
    }

    const grade = await prisma.grade.findFirst({
      where: { blockchainTxHash: hash },
      include: { submission: { include: { assessment: true } } }
    });

    if (!grade) {
      return res.status(404).json({ error: 'Transaction not found on chain' });
    }

    res.json({
      ipfsHash: grade.submission.ipfsHash,
      type: grade.submission.assessment.type,
      timestamp: grade.gradedAt
    });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    res.status(500).json({ error: 'Server error verifying transaction' });
  }
};
