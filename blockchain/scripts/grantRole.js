import hardhat from "hardhat";

async function main() {
  const [deployer] = await hardhat.ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Address of the deployed contract
  const contractAddress = "0x57471d0909030DaeaCc5A73ce6dF923B6F85c3bC";

  const StudentEvaluation = await hardhat.ethers.getContractFactory("StudentEvaluation");
  const contract = StudentEvaluation.attach(contractAddress);

  const LECTURER_ROLE = hardhat.ethers.keccak256(hardhat.ethers.toUtf8Bytes("LECTURER_ROLE"));
  
  console.log("Granting LECTURER_ROLE to", deployer.address);
  const tx = await contract.grantRole(LECTURER_ROLE, deployer.address);
  
  console.log("Waiting for transaction to be mined...");
  await tx.wait();
  
  console.log("Successfully granted LECTURER_ROLE!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
