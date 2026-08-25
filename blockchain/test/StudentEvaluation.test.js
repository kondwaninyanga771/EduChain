import { expect } from "chai";
import hre from "hardhat";

describe("StudentEvaluation", function () {
  let StudentEvaluation;
  let studentEvaluation;
  let admin;
  let lecturer;
  let student;
  
  const LECTURER_ROLE = hre.ethers.id("LECTURER_ROLE");

  beforeEach(async function () {
    [admin, lecturer, student] = await hre.ethers.getSigners();
    
    StudentEvaluation = await hre.ethers.getContractFactory("StudentEvaluation");
    studentEvaluation = await StudentEvaluation.deploy();
  });

  it("Should grant DEFAULT_ADMIN_ROLE to deployer", async function () {
    const defaultAdminRole = await studentEvaluation.DEFAULT_ADMIN_ROLE();
    expect(await studentEvaluation.hasRole(defaultAdminRole, admin.address)).to.be.true;
  });

  it("Should allow admin to grant LECTURER_ROLE", async function () {
    await studentEvaluation.grantRole(LECTURER_ROLE, lecturer.address);
    expect(await studentEvaluation.hasRole(LECTURER_ROLE, lecturer.address)).to.be.true;
  });

  it("Should allow lecturer to publish a grade", async function () {
    // Admin grants role
    await studentEvaluation.grantRole(LECTURER_ROLE, lecturer.address);
    
    const submissionId = "sub-123";
    const studentId = "stud-456";
    const ipfsHash = "QmTestHash123";
    const score = 95;

    // Lecturer publishes grade
    await expect(studentEvaluation.connect(lecturer).publishGrade(submissionId, studentId, ipfsHash, score))
      .to.emit(studentEvaluation, "GradePublished")
      .withArgs(submissionId, studentId, ipfsHash, score, lecturer.address, (val) => val > 0);

    // Verify record
    const record = await studentEvaluation.getEvaluation(submissionId);
    expect(record.submissionId).to.equal(submissionId);
    expect(record.studentId).to.equal(studentId);
    expect(record.score).to.equal(score);
    expect(record.gradedBy).to.equal(lecturer.address);
  });

  it("Should prevent non-lecturer from publishing a grade", async function () {
    const submissionId = "sub-123";
    
    await expect(studentEvaluation.connect(student).publishGrade(submissionId, "stud", "hash", 90))
      .to.be.revertedWithCustomError(studentEvaluation, "AccessControlUnauthorizedAccount")
      .withArgs(student.address, LECTURER_ROLE);
  });
});
