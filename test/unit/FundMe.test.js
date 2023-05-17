const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          // before each test we have to deploy our contract
          // we are deploying fund me inside before each, but we want that contract globally throught the scope of this test
          let fundMe, deployer, mockV3Aggregator;
          const sendValue = ethers.utils.parseEther("1"); //it converts 1 to 1e18
          beforeEach(async function () {
              //we are going to deploy FundMe contract using hardhat deploy
              // fixture allows to run the deploy folder with many tags as we want
              // when we say ["all"] it will run through all deploy scripts and deploy
              deployer = (await getNamedAccounts()).deployer; // using getNamedAccounts() we can pull out the deployer
              await deployments.fixture(["all"]); //this line of code will deploy all our contracts
              fundMe = await ethers.getContract("FundMe", deployer);
              //ethers work with hardhat, using getContract it will provide the latest one.
              // the reson we are adding deployer is, whenver we call that fundMe it will be from that deployer account
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              ); // we are getting the deployed mock contract
              // since we are running locally, we are testing with mock contract
          });

          // these test will be just for the constructor
          describe("constructor", function () {
              it("sets the owner and aggregator addresses correctly", async function () {
                  const owner = await fundMe.getOwner();
                  const response = await fundMe.getPriceFeed();
                  //checking whether deployer of that contract becomes owner
                  assert.equal(owner, deployer);
                  // we are testing wether this getPriceFeed is same as mockv3aggregator
                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          //test for the fund()
          describe("fund", function () {
              it("fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  );
                  // since we are not sending any funds,this fund() will fail
              });
              it("updates the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  );
                  assert.equal(response.toString(), sendValue.toString());
              });
              it("add funder to the array of funders", async function () {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.getFunder(0);
                  assert.equal(funder, deployer);
              });
          });

          //test the withdraw()
          describe("withdraw", function () {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });

              it("withdraw ETH from a single founder", async function () {
                  // Arrange
                  // let's get starting balance of the contract and deployer;
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
                  // when we call the withdraw fn certain amount of gas is spent from deployer
              });

              it("allows to withdraw from multiple getFunder", async () => {
                  //let's simulate sending money from different accounts
                  const accounts = await ethers.getSigners();

                  // let's loop through these accounts and each account will call the fund fn
                  for (let i = 1; i < 6; i++) {
                      //since 0th index is deployer, we are starting from 1
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                      // by default deployer will be connected to the fundMe contract,
                      // now we are connecting with other accounts as well
                  }

                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  // Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
                  // when we call the withdraw fn certain amount of gas is spent from deployer

                  //make sure that the getFunder are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });

              it("only allows owner to withdraw", async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
              });
          });
      });

// we are using hardhat deploy to automatically set up our test, as if both of our deploy functions has been run
