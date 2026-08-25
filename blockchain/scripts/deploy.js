import hardhat from "hardhat";

async function main() {
  const [deployer] = await hardhat.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get the ContractFactory and Signers here.
  const StudentEvaluation = await hardhat.ethers.getContractFactory("StudentEvaluation");
  
  // Deploy the contract
  const studentEvaluation = await StudentEvaluation.deploy();
  
  // Wait for it to be deployed
  await studentEvaluation.waitForDeployment();
  
  // Get the deployed address
  const address = await studentEvaluation.getAddress();

  console.log("---------------------------------------------------------");
  console.log("Success! Your CONTRACT_ADDRESS is:", address);
  console.log("---------------------------------------------------------");
  console.log("Copy the address above and paste it into your backend/.env file");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
