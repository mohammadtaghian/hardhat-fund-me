const { assert, expect } = require("chai")
const { deployments, getNamedAccounts, ethers } = require("hardhat")
const { developmentChain } = require("../../heper-hardhat-config")

!developmentChain.includes(network.name) ?
    describe.skip :
    describe("FundMe", async function() {
        let fundme
        let deployer
        let mockV3Aggregator
        const sendValue = ethers.utils.parseEther("1") //"1000000000000000000" // 1 ETH
        beforeEach(async() => {
            // deploy our fundme contract
            // using hardhat-deploy

            // const accounts = await ethers.getSigners()
            // const accountZero = accounts[0]

            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            fundme = await ethers.getContract("FundMe", deployer)
            mockV3Aggregator = await ethers.getContract(
                "MockV3Aggregator",
                deployer
            )
        })

        describe("constructor", async() => {
            it("sets the aggregator addresses correctly", async() => {
                const response = await fundme.getPriceFeed()
                assert.equal(response, mockV3Aggregator.address)
            })
        })

        describe("fund", async function() {
            it("Fails if you dont send enough ETH", async function() {
                await expect(fundme.fund()).to.be.revertedWithCustomError(
                    fundme,
                    "you need spend more ETH!"
                )
            })

            it("updated the amount funded data structure", async() => {
                await fundme.fund({ value: sendValue })
                const response = await fundme.getAddressToAmountFounded(
                    deployer
                )
                assert.equal(response.toString(), sendValue.toString())
            })

            it("adds getFinder to array of getFinder", async() => {
                await fundme.fund({ value: sendValue })
                const funder = await fundme.getFinder(0)
                assert.equal(funder, deployer)
            })
        })

        describe("withdraw", async() => {
            beforeEach(async() => {
                await fundme.fund({ value: sendValue })
            })

            it("can withdraw ETH from a single founder", async() => {
                // arrange
                const startinfFundMeBalance = await fundme.provider.getBalance(
                    fundme.address
                )
                const startingDeployerBalance = await fundme.provider.getBalance(
                    deployer
                )

                // act
                const transactionResponse = await fundme.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundme.provider.getBalance(
                    fundme.address
                )

                const endingDeployerBalance = await fundme.provider.getBalance(
                    deployer
                )

                //gasCost

                // assert
                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    startinfFundMeBalance.add(startingDeployerBalance),
                    endingDeployerBalance.add(gasCost).toString()
                )
            })

            it("allows us to withdrae with multiple getFinder", async() => {
                //arrange
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await fundme.connect(
                        accounts[i]
                    )
                    await fundMeConnectedContract.fund({ value: sendValue })
                }
                const startinfFundMeBalance = await fundme.provider.getBalance(
                    fundme.address
                )
                const startingDeployerBalance = await fundme.provider.getBalance(
                    deployer
                )

                // Act
                const transactionResponse = await fundme.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundme.provider.getBalance(
                    fundme.address
                )

                const endingDeployerBalance = await fundme.provider.getBalance(
                    deployer
                )

                // assert
                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    startinfFundMeBalance.add(startingDeployerBalance),
                    endingDeployerBalance.add(gasCost).toString()
                )

                // make sure getFinder reset properly
                await expect(fundme.getFinder(0)).to.be.reverted

                for (i = 1; i < 6; i++) {
                    assert.equal(
                        await fundme.getAddressToAmountFounded(
                            accounts[i].address
                        ),
                        0
                    )
                }
            })

            it("only allows the owner to whithdraw", async() => {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]
                const attackerConnectedContract = await fundme.connect(
                    attacker
                )
                await expect(attackerConnectedContract.withdraw()).to.be
                    .reverted
            })
        })
    })