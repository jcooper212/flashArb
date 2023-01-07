// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const ethers = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('balance is ',(await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory('PancakeFlashSwap');
  const token = await Token.deploy();
  console.log('token address ', token.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
