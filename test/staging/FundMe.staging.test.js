const { assert } = require("chai")
const { ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChain } = require("../../heper-hardhat-config")

developmentChain.includes(network.name) ?
    describe.skip :
    describe("FundMe", async() => {
        let fundme
        let deployer
        const sendValue = ethers.utils.parseEther("0.01")
        beforeEach(async() => {
            deployer = (await getNamedAccounts()).deployer
            fundme = await ethers.getContract("FundMe", deployer)
        })

        it("allows peaple to fund and withdraw", async() => {
            await fundme.fund({ value: sendValue })
            await fundme.withdraw()
            const endingBalance = await fundme.provider.getBalance(
                fundme.address
            )
            assert.equal(endingBalance.toString(), "0")
        })
    })