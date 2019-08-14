const toBN = require("./utils/toBN.js");
const strToBN = require("./utils/strToBN.js");
const eq = require("./utils/eq.js");
const assertThrow = require("./utils/assertThrow.js");

const one = toBN(1);
const zero = toBN(0);

const MINT_AMOUNT = toBN((10**3), 18);

const MMT = artifacts.require("MMT");

contract('MMT', (accounts) => {
    const eoaController = accounts[0];
    const owner = accounts[1];
    const tokenInitialOwner =  accounts[2];
    const user1 =  accounts[3];
    const user2 =  accounts[4];

    var mmt;
    before(async () => {
        mmt = await MMT.deployed();
    });

    it('tokenInitialOwner get all tokens at initial', async () => {
        let balance = await mmt.balanceOf(tokenInitialOwner);
        assert(eq(balance, MINT_AMOUNT));
        assert(eq(await mmt.totalSupply(), MINT_AMOUNT));
    });

    it('burnTokens: should NOT be called by unauthorized user', async () =>  {
        await assertThrow(mmt.burnTokens(one, {from: eoaController}));
        await assertThrow(mmt.burnTokens(one, {from: owner}));
        await assertThrow(mmt.burnTokens(one, {from: tokenInitialOwner}));
        assert(eq(await mmt.totalSupply(), MINT_AMOUNT));
    });

    it('disabled functions: generateTokens and destroyTokens are not supported in MMT', async () => {
        await assertThrow(mmt.generateTokens(user1, one, {from: eoaController}));
        await assertThrow(mmt.destroyTokens(user1, one, {from: eoaController}));
    });
});


