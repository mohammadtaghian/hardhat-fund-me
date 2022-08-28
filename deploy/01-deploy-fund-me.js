// imports
// mian function
// calling of main function

//const { networks } = require("../hardhat.config")
const { networkConfig, developmentChain } = require("../heper-hardhat-config")
const { network, deployments, getNamedAccounts } = require("hardhat")
const { verify } = require("../utils/verify")

/* function deployFunc() {
    console.log("Hi")
}

module.exports.default = deployFunc */

//   const {getNamedAccounts, deployments} = hre
module.exports = async({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if chainId is X use address Y
    // if chainId is Z use address A
    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // if the contract doesnt exist, we deploy a minimal version of it to use locally

    // well what happen when we want to change chains
    // when going for localhost or hardhat network we want to use a mock
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [
            ethUsdPriceFeedAddress
            /* address */
        ], // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    if (!developmentChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, ethUsdPriceFeedAddress)
    }
    log("-------------------------------------")
}

module.exports.tags = ["all", "fundme"]