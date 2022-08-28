const { getUnnamedAccounts, ethers } = require("hardhat")

async function main(params) {
    const { deployer } = await getUnnamedAccounts()
    const fundme = await ethers.getContract("FundMe", deployer)
    console.log("Funding...")
    const transactionResponse = await fundme.withdraw()
    await transactionResponse.wait(1)
    console.log("got it back!")
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error)
        process.exit(1)
    })