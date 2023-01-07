require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {version: "0.5.5"},
      {version: "0.6.6"},
      {version: "0.8.8"}
    ]
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://bsc-dataseed.binance.org"
      }
    },
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: ["4b16f33ca0b4bc7aa6aae1c3faf93c364ac18f02c838d388ead2859691569a80"]
    },
    mainnet: {
      url: "https://bsc-dataseed.binance.org",
      chainId: 56
    }
  }

};
