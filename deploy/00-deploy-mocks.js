// we are deploying our own mock pricefeed contract
// this contract will be used in deploy-fund while testing on hardhat
// we want to deploy this contract, so we are creating a test folder in contract and creating a new contract

const { network } = require("hardhat");

const DECIMALS = 8;
const INTIAL_PRICE = 200000000000;

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts(); // we are getting the namedAccounts from hardhat.config
    const chainId = network.config.chainId;

    // contract has been created in test/MockV3Aggregator.sol
    // Now we have deploy this contract
    // But this contract should be deployed only while working with hardhat
    if (chainId === 31337) {
        log("Local network detected! Deploying mocks!!");
        await deploy("MockV3Aggregator", {
            from: deployer,
            args: [DECIMALS, INTIAL_PRICE],
            log: true,
        });
        log("Mocks deployed!");
        log("-----------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
