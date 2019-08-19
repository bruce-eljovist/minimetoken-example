const toBN = require("./utils/toBN.js");
const strToBN = require("./utils/strToBN.js");
const eq = require("./utils/eq.js");
const assertThrow = require("./utils/assertThrow.js");

const MiniMeToken = artifacts.require("MiniMeToken");
const WhiteListController = artifacts.require("WhiteListController");

const one = toBN(1);
const zero = toBN(0);

contract('WhiteListController', (accounts) => {
    const eoaController = accounts[0];
    const owner =  accounts[1];
    const wUser1 =  accounts[2];
    const wUser2 =  accounts[3];
    const user3 =  accounts[4];

    var token;
    var controller;

    var ownerBalance;
    var wUser1Balance;
    var wUser2Balance;
    var user3Balance;

    var totalSupply;

    before(async () => {
        token = await MiniMeToken.deployed();

        controller = await WhiteListController.new(token.address, {from: owner});
        await token.changeController(controller.address);

        // console.log(await controller.whiteList.call(wUser1));
        assert(! await controller.whiteList.call(wUser1));
        assert(! await controller.whiteList.call(wUser2));
        assert(! await controller.whiteList.call(user3));

        await controller.addToWhiteList(wUser1, {from: owner});
        await controller.addToWhiteList(wUser2, {from: owner});
        await controller.addToWhiteList(user3, {from: owner});

        let mintAmount = toBN((10**3), 18);
        await controller.generateTokens(wUser1, mintAmount, {from: owner});
        await controller.generateTokens(wUser2, mintAmount, {from: owner});
        await controller.generateTokens(user3, mintAmount, {from: owner});

        assert(await controller.whiteList.call(wUser1));
        assert(await controller.whiteList.call(wUser2));
        assert(await controller.whiteList.call(user3));

        await controller.removeFromWhiteList(user3, {from: owner});

        assert(await controller.whiteList.call(wUser1));
        assert(await controller.whiteList.call(wUser2));
        assert(! await controller.whiteList.call(user3));
    });

    beforeEach(async () => {
        [ownerBalance, wUser1Balance, wUser2Balance, user3Balance, totalSupply] =
            await Promise.all([
                token.balanceOf(owner),
                token.balanceOf(wUser1),
                token.balanceOf(wUser2),
                token.balanceOf(user3),
                token.totalSupply()
            ]);
    });

    afterEach(async () => {
        assert(eq(await token.totalSupply(), totalSupply));
    });

    it("Authority: addToWhiteList & removeFromWhiteList can only be called by owner", async () => {
        await assertThrow(controller.addToWhiteList(wUser1, {from: user3}));
        await assertThrow(controller.removeFromWhiteList(wUser1, {from: user3}));
    });

    it("generateTokens: generateTokens to unwhitelisted user should fail", async () => {
        await assertThrow(controller.generateTokens(user3, one, {from: owner}));         
    });

    it("generateTokens: generateTokens to whitelisted user should success", async () => {
        await controller.generateTokens(wUser1, one, {from: owner});

        assert(eq(await token.balanceOf(wUser1), wUser1Balance.add(one)));
        assert(eq(await token.totalSupply(), totalSupply.add(one)));
        totalSupply = totalSupply.add(one);
    });

    it("destroyTokens: destroyTokens from unwhitelisted user should fail", async () => {
        await assertThrow(controller.destroyTokens(user3, one, {from: owner}));
    });

    it("destroyTokens: destroyTokens from whitelisted user should success", async () => {
        await controller.destroyTokens(wUser1, one, {from: owner});

        assert(eq(await token.balanceOf(wUser1), wUser1Balance.sub(one)));
        assert(eq(await token.totalSupply(), totalSupply.sub(one)));
        totalSupply = totalSupply.sub(one);
    });

    it("transfer: transfer between whitelisted user should success", async () => {
        await token.transfer(wUser2, one, {from: wUser1});

        assert(eq(await token.balanceOf(wUser1), wUser1Balance.sub(one)));
        assert(eq(await token.balanceOf(wUser2), wUser2Balance.add(one)));
    });

    it("transfer: transfer should fail when sender is unwhitelisted user", async () => {
        await assertThrow(token.transfer(wUser2, one, {from: user3}));

        assert(eq(await token.balanceOf(wUser2), wUser2Balance));
        assert(eq(await token.balanceOf(user3), user3Balance));
    });

    it("transfer: transfer should fail when receiver is unwhitelisted user", async () => {
        await assertThrow(token.transfer(user3, one, {from: wUser1}));

        assert(eq(await token.balanceOf(wUser1), wUser1Balance));
        assert(eq(await token.balanceOf(user3), user3Balance));
    });


    it("transferFrom: approved user can transfer from sender's token when both are whitelisted", async () =>{
        let sender = wUser1;
        let senderBalance = wUser1Balance;

        let approvedUser = user3;
        let approvedUserBalance = user3Balance;

        let receiver = wUser2;
        let receiverBalance = wUser2Balance;

        await token.approve(approvedUser, one, {from: sender});
        assert(eq(await token.allowance(sender, approvedUser), one));

        await token.transferFrom(sender, receiver, one, {from: approvedUser});
        assert(eq(await token.allowance(sender, approvedUser), zero));

        assert(eq(await token.balanceOf(approvedUser), approvedUserBalance));
        assert(eq(await token.balanceOf(sender), senderBalance.sub(one)));
        assert(eq(await token.balanceOf(receiver), receiverBalance.add(one)));
    });


    it("transferFrom: approved user can NOT transfer from sender's token when sender is unwhitelisted", async () =>{
        let sender = user3;
        let senderBalance = user3Balance;

        let approvedUser = wUser1;
        let approvedUserBalance = wUser1Balance;

        let receiver = wUser2;
        let receiverBalance = wUser2Balance;

        await token.approve(approvedUser, one, {from: sender});
        assert(eq(await token.allowance(sender, approvedUser), one));

        await assertThrow(token.transferFrom(sender, receiver, one, {from: approvedUser}));
        assert(eq(await token.allowance(sender, approvedUser), one));

        assert(eq(await token.balanceOf(approvedUser), approvedUserBalance));
        assert(eq(await token.balanceOf(sender), senderBalance));
        assert(eq(await token.balanceOf(receiver), receiverBalance));
    });

    it("transferFrom: approved user can NOT transfer from sender's token when receiver is unwhitelisted", async () =>{
        let sender = wUser2;
        let senderBalance = wUser2Balance;

        let approvedUser = wUser1;
        let approvedUserBalance = wUser1Balance;

        let receiver = user3;
        let receiverBalance = user3Balance;

        await token.approve(approvedUser, one, {from: sender});
        assert(eq(await token.allowance(sender, approvedUser), one));

        await assertThrow(token.transferFrom(sender, receiver, one, {from: approvedUser}));
        assert(eq(await token.allowance(sender, approvedUser), one));

        assert(eq(await token.balanceOf(approvedUser), approvedUserBalance));
        assert(eq(await token.balanceOf(sender), senderBalance));
        assert(eq(await token.balanceOf(receiver), receiverBalance));
    });
});





