const MMT = artifacts.require("MMT");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");
const MMTController = artifacts.require("MMTController");

module.exports = async (deployer, network, accounts) => {
    const eoaController = accounts[0];
    const owner = accounts[1];
    const tokenInitialOwner =  accounts[2];

    await deployer.deploy(MiniMeTokenFactory, {from: eoaController});
    const tokenFactory = await MiniMeTokenFactory.deployed();

    await deployer.deploy(MMT, tokenFactory.address, tokenInitialOwner, {from: eoaController});
    const token = await MMT.deployed();

    await deployer.deploy(MMTController, token.address, {from: owner});
    const controller = await MMTController.deployed();

    await token.changeController(controller.address, {from: eoaController});
};


