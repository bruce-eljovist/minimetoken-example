const toBN = require("./utils/toBN.js");
const strToBN = require("./utils/strToBN.js");
const eq = require("./utils/eq.js");
const assertThrow = require("./utils/assertThrow.js");

const MMT = artifacts.require("MMT");
const MMTController = artifacts.require("MMTController");

const one = toBN(1);
const zero = toBN(0);

contract('MMTController', (accounts) => {
    const eoaController = accounts[0];
    const owner = accounts[1];
    const tokenInitialOwner =  accounts[2];
    const user1 =  accounts[3];
    const user2 =  accounts[4];

    var mmt;
    var controller;

    const MINT_AMOUNT = toBN((10**3), 18);

    before(async () => {
        mmt = await MMT.deployed();
        controller = await MMTController.deployed();
    });

    beforeEach(async () => {

    });

    afterEach(async () => {

    });

    it("burnTokens: owner can burn tokens", async () => {
        let totalSupply = await mmt.totalSupply();

        await mmt.transfer(controller.address, toBN(100), {from: tokenInitialOwner});
        let controllerBalance = await mmt.balanceOf(controller.address);

        await controller.burnTokens(one, {from: owner});

        assert(eq(await mmt.balanceOf(controller.address), controllerBalance.sub(one)));
        assert(eq(await mmt.totalSupply(), totalSupply.sub(one)));
    });

    it("generateTokens: not supported", async () => {
        await assertThrow(controller.generateTokens(tokenInitialOwner, one, {from: owner}));
    });

    it("destroyTokens: not supported", async () => {
        await assertThrow(controller.destroyTokens(tokenInitialOwner, one, {from: owner}));
    });
});





