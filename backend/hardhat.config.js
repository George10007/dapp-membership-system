require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

module.exports = {
  solidity: "0.8.26",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,  // 使用 Infura 連接到 Sepolia
      accounts: [`0x${process.env.PRIVATE_KEY}`]  // 使用你的私鑰來部署合約
    }
  }
};
