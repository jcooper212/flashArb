require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const dev_mnemonic = process.env.ETH_WALLET_MNEMONIC || ""
const infura_endpoint = process.env.ETH_INFURA_RINKEBY || ""
const acct = process.env.ETH_W3 || ""
const acct_pk = process.env.ETH_P3 || ""
const mumbai_endpoint = process.env.ETH_MUMBAI || ""
const matic_endpoint = process.env.ETH_MATIC || ""
const goerli_endpoint = process.env.ETH_GOERLI || ""
const ethmainnet_endpoint = process.env.ETH_MAINNET || ""


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      { version: "0.5.5" },
      { version: "0.6.6" },
      { version: "0.8.8" },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: ethmainnet_endpoint,
      },
    },
    testnet: {
      url: goerli_endpoint,
      chainId: 5,
      accounts: [
        acct_pk,

      ],
    },
    // mainnet: {
    //   url: ethmainnet_endpoint,
    //   chainId: 137,
    //   accounts: [
    //     acct,
    //   ],
    // },
  },
};
