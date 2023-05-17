const { network } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
require("dotenv").config();

// getNameAccounts and deployments are destructured from hre, hre is hardhat runtime environment
module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts(); // we are getting the namedAccounts from hardhat.config
    const chainId = network.config.chainId;

    // when going for localhost or hardhat network, we cannot use the AggregatorV3Interface,
    // the reason is whenver we deploy a contract to hardhat, as we run differnt command that blockchain gets destroyed.
    // so this AggregatorV3Interface contract will not stay on our blockchain for future use.
    // so let's use mock while using hardhat or local
    // Another important thing is AggregatorV3Interface priceFeed is hot coded only for sepolia,
    // if we want to use other network, it is not adaptable, so let's make the priceFeed address dynamic.

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    let ethUsdPriceFeedAddress;
    //if the contract dosen't exist, we deploy a minimal version for our local testing //00-deploy-mocks.js
    // while we run deploy script out MockV3Aggregator contract will also get deployed, if it is a hardhat network
    if (chainId === 31337) {
        const ethUsdAggregator = await get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address; // this will give the address where MockV3Aggregator is deployed.
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    log("---------------------");

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress]);
    }
};

module.exports.tags = ["all", "fundme"];
