/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-ethers");
require("dotenv").config()

API_URL_KEY = process.env.API_URL_KEY
PRIVATE_KEY = process.env.PRIVATE_KEY

module.exports = {
  solidity: {version: "0.8.20", settings: { optimizer: { enabled: true, runs: 100 }, "viaIR" : true }},
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: API_URL_KEY,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
};
