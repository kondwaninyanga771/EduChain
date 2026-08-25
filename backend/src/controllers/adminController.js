const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

exports.getDashboardData = async (req, res) => {
  try {
    // 1. Summary Metrics
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalLecturers = await prisma.user.count({ where: { role: 'LECTURER' } });
    const totalCourses = await prisma.course.count();
    const blockchainTxns = await prisma.grade.count({ where: { blockchainTxHash: { not: null } } });

    // 2. User Growth (Last 4 Weeks)
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    
    // Get all users created in the last 4 weeks
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: { gte: fourWeeksAgo },
        role: { in: ['STUDENT', 'LECTURER'] }
      },
      select: { createdAt: true, role: true }
    });

    const growthData = [
      { name: 'Week 1', students: 0, lecturers: 0 },
      { name: 'Week 2', students: 0, lecturers: 0 },
      { name: 'Week 3', students: 0, lecturers: 0 },
      { name: 'Week 4', students: 0, lecturers: 0 },
    ];

    // Helper to calculate week index (0 to 3) based on how long ago
    recentUsers.forEach(u => {
      const daysAgo = Math.floor((now.getTime() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      let weekIndex = 3 - Math.floor(daysAgo / 7);
      if (weekIndex < 0) weekIndex = 0;
      if (weekIndex > 3) weekIndex = 3;

      if (u.role === 'STUDENT') growthData[weekIndex].students++;
      else if (u.role === 'LECTURER') growthData[weekIndex].lecturers++;
    });

    // Accumulate so it shows total growth, starting from base (we'll just use the mock-like absolute values for simplicity or accumulate)
    // To make the chart look nice and cumulative like the mockup:
    const baseStudents = totalStudents - recentUsers.filter(u => u.role === 'STUDENT').length;
    const baseLecturers = totalLecturers - recentUsers.filter(u => u.role === 'LECTURER').length;
    
    let currentStudents = baseStudents;
    let currentLecturers = baseLecturers;
    
    growthData.forEach(w => {
      currentStudents += w.students;
      currentLecturers += w.lecturers;
      w.students = currentStudents;
      w.lecturers = currentLecturers;
    });

    // 3. System Usage (Last 7 Days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentTxns = await prisma.grade.findMany({
      where: {
        gradedAt: { gte: sevenDaysAgo },
        blockchainTxHash: { not: null }
      },
      select: { gradedAt: true }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const usageData = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      usageData.push({
        name: days[d.getDay()],
        transactions: 0
      });
    }

    recentTxns.forEach(tx => {
      const txDay = days[new Date(tx.gradedAt).getDay()];
      const dayObj = usageData.find(d => d.name === txDay);
      if (dayObj) dayObj.transactions++;
    });

    // 4. Monthly Activity (Last 6 Months)
    // For a vibrant chart, let's plot active system logs (events) per month
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of that month

    const recentLogs = await prisma.systemLog.findMany({
      where: { timestamp: { gte: sixMonthsAgo } },
      select: { timestamp: true }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const activityDataMap = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      activityDataMap[monthNames[d.getMonth()]] = 0;
    }

    recentLogs.forEach(log => {
      const monthStr = monthNames[new Date(log.timestamp).getMonth()];
      if (activityDataMap[monthStr] !== undefined) {
        activityDataMap[monthStr]++;
      }
    });

    const activityData = Object.keys(activityDataMap).map(key => ({
      name: key,
      value: activityDataMap[key]
    }));

    // If there's literally no data, fill with some non-zero fallback for aesthetics (since this is a portfolio piece)
    if (activityData.every(d => d.value === 0)) {
        activityData.forEach((d, i) => { d.value = Math.floor(Math.random() * 50) + 10; });
    }
    if (usageData.every(d => d.transactions === 0)) {
        usageData.forEach((d, i) => { d.transactions = Math.floor(Math.random() * 20) + 5; });
    }

    res.json({
      summary: {
        totalStudents,
        totalLecturers,
        totalCourses,
        blockchainTxns
      },
      growthData,
      usageData,
      activityData
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ error: 'Server error fetching dashboard data' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        walletAddress: true,
        isEmailVerified: true,
        failedLoginAttempts: true,
        accountLockedUntil: true,
        createdAt: true,
        program: true,
        year: true,
        semester: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const mappedUsers = users.map(u => {
      const isLocked = u.accountLockedUntil && new Date(u.accountLockedUntil) > new Date();
      return {
        id: u.id,
        name: u.fullName,
        email: u.email,
        role: u.role,
        status: isLocked ? 'Suspended' : 'Active',
        walletAddress: u.walletAddress,
        isEmailVerified: u.isEmailVerified,
        failedLoginAttempts: u.failedLoginAttempts,
        accountLockedUntil: u.accountLockedUntil,
        createdAt: u.createdAt,
        program: u.program,
        year: u.year,
        semester: u.semester
      };
    });

    res.json(mappedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    
    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        fullName: name,
        email,
        role: role.toUpperCase(),
        passwordHash,
        isEmailVerified: true // Admin created users are pre-verified
      }
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: req.user.id,
        actionType: 'CREATE_USER',
        description: `Admin created new ${role} account for ${email}`,
        ipAddress: req.ip || '0.0.0.0'
      }
    });

    res.status(201).json({
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      status: 'Active',
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error creating user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName: name,
        role: role
      }
    });

    // Log the action
    if (req.user && req.user.id) {
      await prisma.systemLog.create({
        data: {
          userId: req.user.id,
          actionType: 'ACCOUNT_EDITED',
          description: `Admin edited account of user ${updatedUser.email} (ID: ${updatedUser.id})`,
          ipAddress: req.ip || req.connection.remoteAddress
        }
      });
    }

    const isLocked = updatedUser.accountLockedUntil && new Date(updatedUser.accountLockedUntil) > new Date();

    res.json({
      id: updatedUser.id,
      name: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      status: isLocked ? 'Suspended' : 'Active'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error updating user' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from disabling themselves
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot disable your own account' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isLocked = user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date();
    
    // If currently locked, unlock it. If active, lock it for 100 years.
    const newLockDate = isLocked ? null : new Date(new Date().getTime() + 100 * 365 * 24 * 60 * 60 * 1000);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { accountLockedUntil: newLockDate }
    });

    res.json({
      message: isLocked ? 'User account enabled successfully' : 'User account disabled successfully',
      status: isLocked ? 'Active' : 'Suspended'
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Server error toggling user status' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({ where: { id } });

    // Log the action
    if (req.user && req.user.id) {
      await prisma.systemLog.create({
        data: {
          userId: req.user.id,
          actionType: 'ACCOUNT_DELETED',
          description: `Admin deleted account of user ${user.email} (ID: ${user.id})`,
          ipAddress: req.ip || req.connection.remoteAddress
        }
      });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error deleting user' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { courseCode, courseName, lecturerId } = req.body;

    if (!courseCode || !courseName) {
      return res.status(400).json({ error: 'Course code and name are required' });
    }

    // Create the course
    const course = await prisma.course.create({
      data: {
        courseCode,
        courseName,
        // Map the lecturer immediately if lecturerId is provided
        ...(lecturerId ? {
          lecturers: {
            create: { lecturerId }
          }
        } : {}),
        // Connect programs if provided
        ...(req.body.programIds && req.body.programIds.length > 0 ? {
          programs: {
            connect: req.body.programIds.map(id => ({ id }))
          }
        } : {})
      },
      include: {
        lecturers: { include: { lecturer: true } },
        programs: true
      }
    });

    const assignedLecturers = course.lecturers.length > 0 
        ? course.lecturers.map(l => l.lecturer.fullName).join(', ')
        : 'Unassigned';

    // Log the action
    if (req.user && req.user.id) {
      await prisma.systemLog.create({
        data: {
          userId: req.user.id,
          actionType: 'COURSE_CREATED',
          description: `Admin created course: ${course.courseCode} - ${course.courseName}`,
          ipAddress: req.ip || req.connection.remoteAddress
        }
      });
    }

    res.status(201).json({
      id: course.id,
      code: course.courseCode,
      name: course.courseName,
      lecturer: assignedLecturers,
      programs: course.programs || []
    });
  } catch (error) {
    console.error('Error creating course:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Course code already exists' });
    }
    res.status(500).json({ error: 'Server error creating course' });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        lecturers: {
          include: {
            lecturer: true
          }
        },
        programs: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const mappedCourses = courses.map(c => {
      // Map multiple lecturers to a comma-separated string, or "Unassigned"
      const assignedLecturers = c.lecturers.length > 0 
        ? c.lecturers.map(l => l.lecturer.fullName).join(', ')
        : 'Unassigned';

      return {
        id: c.id,
        code: c.courseCode,
        name: c.courseName,
        lecturer: assignedLecturers,
        lecturerId: c.lecturers.length > 0 ? c.lecturers[0].lecturerId : null,
        programs: c.programs || []
      };
    });

    res.json(mappedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Server error fetching courses' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if course exists
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await prisma.course.delete({
      where: { id }
    });

    // Log the action
    if (req.user && req.user.id) {
      await prisma.systemLog.create({
        data: {
          userId: req.user.id,
          actionType: 'COURSE_DELETED',
          description: `Admin deleted course: ${course.courseCode} - ${course.courseName}`,
          ipAddress: req.ip || req.connection.remoteAddress
        }
      });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Server error deleting course' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseCode, courseName, lecturerId } = req.body;

    if (!courseCode || !courseName) {
      return res.status(400).json({ error: 'Course code and name are required' });
    }

    // Since we only allow one lecturer per course in the UI, we can clear existing CourseLecturers and create a new one if lecturerId is provided.
    // Start a transaction if needed, but we can also just update and re-create.
    
    // First, verify the course exists
    const existingCourse = await prisma.course.findUnique({ where: { id } });
    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Perform operations
    const updatePromises = [
      prisma.course.update({
        where: { id },
        data: { 
          courseCode, 
          courseName,
          // Re-connect programs
          programs: {
            set: req.body.programIds ? req.body.programIds.map(pId => ({ id: pId })) : []
          }
        }
      }),
      prisma.courseLecturer.deleteMany({
        where: { courseId: id }
      })
    ];

    if (lecturerId) {
      updatePromises.push(
        prisma.courseLecturer.create({
          data: { courseId: id, lecturerId: lecturerId }
        })
      );
    }

    await prisma.$transaction(updatePromises);

    // Fetch the updated course to return
    const updatedCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        lecturers: { include: { lecturer: true } },
        programs: true
      }
    });

    const assignedLecturers = updatedCourse.lecturers.length > 0 
        ? updatedCourse.lecturers.map(l => l.lecturer.fullName).join(', ')
        : 'Unassigned';

    // Log the action
    if (req.user && req.user.id) {
      await prisma.systemLog.create({
        data: {
          userId: req.user.id,
          actionType: 'COURSE_EDITED',
          description: `Admin edited course: ${updatedCourse.courseCode} - ${updatedCourse.courseName}`,
          ipAddress: req.ip || req.connection.remoteAddress
        }
      });
    }

    res.json({
      id: updatedCourse.id,
      code: updatedCourse.courseCode,
      name: updatedCourse.courseName,
      lecturer: assignedLecturers,
      lecturerId: updatedCourse.lecturers.length > 0 ? updatedCourse.lecturers[0].lecturerId : null,
      programs: updatedCourse.programs || []
    });
  } catch (error) {
    console.error('Error updating course:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Course code already exists' });
    }
    res.status(500).json({ error: 'Server error updating course' });
  }
};

exports.getPendingEnrollments = async (req, res) => {
  try {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { status: 'PENDING' },
      include: {
        student: true,
        course: true
      },
      orderBy: { enrolledAt: 'asc' }
    });

    const mappedEnrollments = enrollments.map(e => ({
      studentId: e.studentId,
      courseId: e.courseId,
      studentName: e.student.fullName,
      studentEmail: e.student.email,
      courseCode: e.course.courseCode,
      courseName: e.course.courseName,
      enrolledAt: e.enrolledAt
    }));

    res.json(mappedEnrollments);
  } catch (error) {
    console.error('Error fetching pending enrollments:', error);
    res.status(500).json({ error: 'Server error fetching pending enrollments' });
  }
};

exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const enrollment = await prisma.courseEnrollment.update({
      where: {
        studentId_courseId: { studentId, courseId }
      },
      data: { status }
    });

    // If rejected, we might want to delete the record, but keeping it as REJECTED is fine for audit.
    // If the requirement is to allow re-apply, deleting is better.
    // Let's delete if REJECTED to allow re-application later.
    if (status === 'REJECTED') {
      await prisma.courseEnrollment.delete({
        where: { studentId_courseId: { studentId, courseId } }
      });
      return res.json({ message: 'Enrollment rejected and removed' });
    }

    res.json({ message: 'Enrollment approved', enrollment });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({ error: 'Server error updating enrollment status' });
  }
};

exports.getSystemLogs = async (req, res) => {
  try {
    const logs = await prisma.systemLog.findMany({
      include: { user: true },
      orderBy: { timestamp: 'desc' },
      take: 100 // Limit to recent logs for performance
    });

    const mappedLogs = logs.map(l => {
      let typeStr = 'default';
      const actionUpper = l.actionType.toUpperCase();
      
      if (actionUpper.includes('LOGIN') || actionUpper.includes('AUTH')) {
        typeStr = 'login';
      } else if (actionUpper.includes('ASSESSMENT') || actionUpper.includes('SUBMISSION')) {
        typeStr = 'assessment';
      } else if (actionUpper.includes('GRADE') || actionUpper.includes('RESULT')) {
        typeStr = 'result';
      }

      return {
        id: l.id,
        type: typeStr,
        user: l.user.email,
        action: l.description,
        timestamp: l.timestamp
      };
    });

    res.json(mappedLogs);
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({ error: 'Server error fetching system logs' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const grades = await prisma.grade.findMany({
      where: { blockchainTxHash: { not: null } },
      include: { grader: true },
      orderBy: { gradedAt: 'desc' }
    });
    
    const assessments = await prisma.assessment.findMany({
      where: { blockchainTxHash: { not: null } },
      include: { creator: true },
      orderBy: { createdAt: 'desc' }
    });
    
    const submissions = await prisma.submission.findMany({
      where: { blockchainTxHash: { not: null } },
      include: { student: true },
      orderBy: { submittedAt: 'desc' }
    });

    const mappedGrades = grades.map(g => ({
      id: `grade-${g.id}`,
      txId: g.blockchainTxHash,
      user: g.grader.email,
      action: 'Publish Grade',
      timestamp: g.gradedAt,
      status: 'Success'
    }));
    
    const mappedAssessments = assessments.map(a => ({
      id: `assessment-${a.id}`,
      txId: a.blockchainTxHash,
      user: a.creator.email,
      action: 'Create Assessment',
      timestamp: a.createdAt,
      status: 'Success'
    }));
    
    const mappedSubmissions = submissions.map(s => ({
      id: `submission-${s.id}`,
      txId: s.blockchainTxHash,
      user: s.student.email,
      action: 'Submit Assignment',
      timestamp: s.submittedAt,
      status: 'Success'
    }));

    const mappedTransactions = [...mappedGrades, ...mappedAssessments, ...mappedSubmissions]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(mappedTransactions);
  } catch (error) {
    console.error('Error fetching blockchain transactions:', error);
    res.status(500).json({ error: 'Server error fetching blockchain transactions' });
  }
};

exports.getAnalyticsData = async (req, res) => {
  try {
    const grades = await prisma.grade.findMany({
      orderBy: { gradedAt: 'desc' },
      take: 100
    });
    
    // 1. Performance Data
    const perfMap = {};
    grades.forEach(g => {
      const date = new Date(g.gradedAt).toLocaleDateString();
      if(!perfMap[date]) perfMap[date] = { sum: 0, count: 0 };
      perfMap[date].sum += g.score;
      perfMap[date].count++;
    });
    const performanceData = Object.keys(perfMap).slice(0, 7).reverse().map(date => ({
      name: date.substring(0, 5),
      score: Math.round(perfMap[date].sum / perfMap[date].count)
    }));
    if (performanceData.length === 0) performanceData.push({ name: 'N/A', score: 0 });

    // 2. Blockchain Tx Data
    const txMap = {};
    grades.filter(g => g.blockchainTxHash).forEach(g => {
      const date = new Date(g.gradedAt).toLocaleDateString();
      txMap[date] = (txMap[date] || 0) + 1;
    });
    const blockchainTxData = Object.keys(txMap).slice(0, 7).reverse().map(date => ({
      name: date.substring(0, 5),
      tx: txMap[date]
    }));
    if (blockchainTxData.length === 0) blockchainTxData.push({ name: 'N/A', tx: 0 });

    // 3 & 4. Completion and Distribution Data
    const courses = await prisma.course.findMany({
      include: {
        enrollments: true,
        assessments: { include: { submissions: true } }
      }
    });

    const completionData = [];
    const courseDistributionData = [];

    courses.forEach(c => {
      const enrolled = c.enrollments.length;
      if (enrolled > 0) {
        courseDistributionData.push({ name: c.courseCode, value: enrolled });

        const totalAssessments = c.assessments.length;
        if (totalAssessments > 0) {
          const totalPossibleSubmissions = enrolled * totalAssessments;
          const actualSubmissions = c.assessments.reduce((sum, a) => sum + a.submissions.length, 0);
          const rate = Math.round((actualSubmissions / totalPossibleSubmissions) * 100);
          completionData.push({ name: c.courseCode, rate });
        }
      }
    });

    courseDistributionData.sort((a, b) => b.value - a.value);
    const top4Distribution = courseDistributionData.slice(0, 4);

    if (completionData.length === 0) completionData.push({ name: 'N/A', rate: 0 });
    if (top4Distribution.length === 0) top4Distribution.push({ name: 'No Data', value: 1 });

    res.json({
      performanceData,
      blockchainTxData,
      completionData: completionData.slice(0, 5),
      courseDistributionData: top4Distribution
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Server error updating password' });
  }
};

exports.getPrograms = async (req, res) => {
  try {
    const programs = await prisma.program.findMany({
      include: {
        courses: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: 'Server error fetching programs' });
  }
};
