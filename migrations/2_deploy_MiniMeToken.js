const MiniMeToken = artifacts.require("MiniMeToken");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");
const MiniMeTokenController = artifacts.require("MiniMeTokenController");

const zeroAddress = "0x0000000000000000000000000000000000000000";

module.exports = async (deployer, network, accounts) => {
    const eoaController = accounts[0];
    const owner = accounts[1];
    const tokenInitialOwner =  accounts[2];

    await deployer.deploy(MiniMeTokenFactory, {from: eoaController});
    const tokenFactory = await MiniMeTokenFactory.deployed();

    await deployer.deploy(
        MiniMeToken, 
        tokenFactory.address, 
        zeroAddress, // no parent token
        0,   // new token
        "MiniMeToken", // Token name
        18, // Decimals
        "MiniMe", // Symbol
        true, // Enable transfers
        {from: eoaController});
};




