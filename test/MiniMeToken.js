const toBN = require("./utils/toBN.js");
const strToBN = require("./utils/strToBN.js");
const eq = require("./utils/eq.js");
const assertThrow = require("./utils/assertThrow.js");

const MiniMeToken = artifacts.require("MiniMeToken");

const one = toBN(1);
const two = toBN(2);
const zero = toBN(0);

contract('MiniMeToken', (accounts) => {
    const eoaController = accounts[0];
    const owner = accounts[1];
    const tokenInitialOwner =  accounts[2];
    const user1 =  accounts[3];
    const user2 =  accounts[4];

    var firstControllerBalance;
    var ownerBalance;
    var tokenInitialOwnerBalance;
    var user1Balance;
    var user2Balance;

    var totalSupply;

    var token;
    before(async () => {
        token = await MiniMeToken.deployed();
    });

    beforeEach(async () => {
        [firstControllerBalance, ownerBalance, tokenInitialOwnerBalance, user1Balance, user2Balance, totalSupply] =
            await Promise.all([
                token.balanceOf(eoaController),
                token.balanceOf(owner),
                token.balanceOf(tokenInitialOwner),
                token.balanceOf(user1),
                token.balanceOf(user2),
                token.totalSupply()
            ]);
    });

    afterEach(async () => {
        assert(eq(await token.totalSupply(), totalSupply));
    })

    it("generateTokens: eoaController can give tokens to tokenInitialOwner", async () => {
        let mintAmount = toBN((10**3), 18);
        assert(eq(tokenInitialOwnerBalance, zero));
        await token.generateTokens(tokenInitialOwner, mintAmount, {from: eoaController});
        assert(eq(await token.balanceOf(tokenInitialOwner), mintAmount));
        totalSupply = await token.totalSupply();
    });

    it("generateTokens: unauthorized user can NOT call generateTokens", async () => {
        await assertThrow(token.generateTokens(tokenInitialOwner, one, {from: user1}));
        assert(eq(await token.balanceOf(tokenInitialOwner), tokenInitialOwnerBalance));
    });

    it("destroyTokens: eoaController user can destroy tokens ", async () => {
        await token.destroyTokens(tokenInitialOwner, one, {from: eoaController});
        assert(eq(await token.balanceOf(tokenInitialOwner), tokenInitialOwnerBalance.sub(one)));
        totalSupply = await token.totalSupply();
    });

    it("destroyTokens: unauthorized user can NOT call destroyTokens", async () => {
        await assertThrow(token.destroyTokens(tokenInitialOwner, one, {from: user1}));
        assert(eq(await token.balanceOf(tokenInitialOwner), tokenInitialOwnerBalance));
    });

    it("transfer: tokenInitialOwner transfer token to user1", async () => {
        await token.transfer(user1, one, {from: tokenInitialOwner});

        assert(eq(await token.balanceOf(tokenInitialOwner), tokenInitialOwnerBalance.sub(one)));
        assert(eq(await token.balanceOf(user1), user1Balance.add(one)));
    });

    it("transfer: user1 can transfer token to myself", async () => {
        await token.transfer(user1, one, {from: user1});
        assert(eq(await token.balanceOf(user1), user1Balance));
    });

    it("tranfer: user1 can NOT tranfer more than he has", async () => {
        await token.transfer(user2, user1Balance.add(one), {from: user1});
        
        assert(eq(await token.balanceOf(user1), user1Balance));
        assert(eq(await token.balanceOf(user2), user2Balance));
    });

    it("transferFrom: approved user can transfer from other's token", async () =>{
        let other = tokenInitialOwner;
        let otherBalance = tokenInitialOwnerBalance;

        await token.approve(user1, one, {from: other});

        assert(eq(await token.allowance(other, user1), one));

        await token.transferFrom(other, user2, one, {from: user1});
        assert(eq(await token.allowance(other, user1), zero));

        assert(eq(await token.balanceOf(user1), user1Balance));
        assert(eq(await token.balanceOf(other), otherBalance.sub(one)));
        assert(eq(await token.balanceOf(user2), user2Balance.add(one)));
    });


    it("transferFrom: approved user can NOT transfer from other's token more than allowances", async () =>{
        let other = tokenInitialOwner;
        let otherBalance = tokenInitialOwnerBalance;

        await token.approve(user1, one, {from: other});
        assert(eq(await token.allowance(other, user1), one));

        await token.transferFrom(other, user2, two, {from: user1});
        assert(eq(await token.allowance(other, user1), one));

        assert(eq(await token.balanceOf(other), otherBalance));
        assert(eq(await token.balanceOf(user1), user1Balance));
        assert(eq(await token.balanceOf(user2), user2Balance));
    });


    it("enableTransfers: calling transfer function is reverted after disable it", async () => {
        token.enableTransfers(false, {from: eoaController});

        await assertThrow(token.transfer(user1, one, {from: tokenInitialOwner}));

        token.enableTransfers(true, {from: eoaController});        
    });

    it("enableTransfers: unauthorized user can NOT change token's enable policy", async () => {
        await assertThrow(token.enableTransfers(false, {from: user1}));
    });

    it("fallback: cannot send ether to token contract when controller is EOA", async () => {
        await assertThrow(
            web3.eth.sendTransaction({from: user1, to: token.address, value: web3.utils.toWei('10', 'ether')})
        );
    });

});



