export const mockData = {
  users: [
    { id: 1, name: 'Alice Smith', email: 'alice@student.edu', role: 'student', walletAddress: '0x123...abc' },
    { id: 2, name: 'Dr. Bob Jones', email: 'bob@lecturer.edu', role: 'lecturer', walletAddress: '0x456...def' },
    { id: 3, name: 'Admin User', email: 'admin@uni.edu', role: 'admin', walletAddress: '0x789...ghi' },
  ],
  courses: [
    { id: 'CS101', title: 'Introduction to Blockchain', lecturerId: 2, studentsEnrolled: 45 },
    { id: 'CS202', title: 'Smart Contract Development', lecturerId: 2, studentsEnrolled: 30 },
  ],
  assessments: [
    { id: 'A1', courseId: 'CS101', title: 'Blockchain Basics Essay', deadline: '2023-11-15T23:59:00Z', status: 'Active' },
    { id: 'A2', courseId: 'CS202', title: 'ERC20 Token Implementation', deadline: '2023-12-01T23:59:00Z', status: 'Upcoming' },
  ],
  submissions: [
    { id: 'S1', assessmentId: 'A1', studentId: 1, date: '2023-11-14T10:30:00Z', status: 'Graded', ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco', txHash: '0xabc...123' }
  ],
  results: [
    { id: 'R1', submissionId: 'S1', score: 95, grade: 'A', dateReleased: '2023-11-20T09:00:00Z' }
  ],
  transactions: [
    { id: 'TX1', user: 'Alice Smith', action: 'Submit Assignment', timestamp: '2023-11-14T10:30:00Z', status: 'Success', hash: '0xabc...123' },
    { id: 'TX2', user: 'Dr. Bob Jones', action: 'Publish Grade', timestamp: '2023-11-20T09:00:00Z', status: 'Success', hash: '0xdef...456' },
  ]
};
