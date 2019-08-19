const toBN = require("./utils/toBN.js");
const strToBN = require("./utils/strToBN.js");
const eq = require("./utils/eq.js");
const assertThrow = require("./utils/assertThrow.js");

const MiniMeToken = artifacts.require("MiniMeToken");
const MiniMeTokenController = artifacts.require("MiniMeTokenController");

const one = toBN(1);
const zero = toBN(0);

contract('MiniMeTokenController', (accounts) => {
    const eoaController = accounts[0];
    const owner = accounts[1];
    const tokenInitialOwner =  accounts[2];
    const user1 =  accounts[3];
    const user2 =  accounts[4];

    var token;
    var controller;

    async function getWeiBalance(addr) {
        return toBN(await web3.eth.getBalance(addr));
    }

    before(async () => {
        token = await MiniMeToken.deployed();

        const mintAmount = toBN((10**3), 18);
        await token.generateTokens(tokenInitialOwner, mintAmount, {from: eoaController});

        controller = await MiniMeTokenController.new(token.address, {from: owner});
        await token.changeController(controller.address, {from: eoaController});
    });

    beforeEach(async () => {
    });

    afterEach(async () => {
    });

    it("changeController: eoaController can NOT change controller anymore", async () => {
        await assertThrow(token.changeController(controller.address, {from: eoaController}));
    });

    it("changeController: only owner can change controller", async () => {
        await assertThrow(controller.changeController(eoaController, {from: eoaController}));
        
        await controller.changeController(eoaController, {from: owner});

        await token.changeController(controller.address, {from: eoaController});
    });

    it("onlyOwner: unauthorized user can NOT call onlyOwner functions", async () => {

        function getUnauthorizedUser() {
            let unauthorizedUserArray = [eoaController, tokenInitialOwner, user1, user2];
            return unauthorizedUserArray[Math.floor(Math.random()*unauthorizedUserArray.length)];
        }

        await assertThrow(controller.changeController(eoaController, {from: getUnauthorizedUser()}));
        await assertThrow(controller.enableTransfers(false, {from: getUnauthorizedUser()}));
        await assertThrow(controller.generateTokens(user1, one, {from: getUnauthorizedUser()}));
        await assertThrow(controller.destroyTokens(tokenInitialOwner, one, {from: getUnauthorizedUser()}));
        await assertThrow(controller.claimTokens(token.address, user1, {from: getUnauthorizedUser()}));
    });

    it("claimTokens: claim ethereum which was sent to token contract", async () => {
        
        let tokenWeiBalance = await getWeiBalance(token.address);
        let controllerWeiBalance = await getWeiBalance(controller.address);

        await web3.eth.sendTransaction({from: user1, to: token.address, value: '1'});
        assert(eq(await getWeiBalance(token.address), tokenWeiBalance));
        assert(eq(await getWeiBalance(controller.address), controllerWeiBalance.add(one)));        

        controllerWeiBalance = controllerWeiBalance.add(one);
        let user2WeiBalance = await getWeiBalance(user2);

        const zeroAddress = "0x0000000000000000000000000000000000000000";
        await controller.claimTokens(zeroAddress, user2, {from: owner});

        assert(eq(await getWeiBalance(controller.address), controllerWeiBalance.sub(one)));
        assert(eq(await getWeiBalance(user2), user2WeiBalance.add(one)));
    });

    it("claimTokens: claim MiniMeToken which was sent to controller contract", async () => {
        let controllerBalance = await token.balanceOf(controller.address);

        await token.transfer(controller.address, one, {from: tokenInitialOwner});
        assert(eq(await token.balanceOf(controller.address), controllerBalance.add(one)));

        controllerBalance = controllerBalance.add(one);
        let user2Balance = await token.balanceOf(user2);

        await controller.claimTokens(token.address, user2, {from: owner});

        assert(eq(await token.balanceOf(controller.address), controllerBalance.sub(one)));
        assert(eq(await token.balanceOf(user2), user2Balance.add(one)));
    });

    it("enableTransfer: owner can enable or disable transfer through controller", async () => {
        await controller.enableTransfers(false, {from: owner});

        let user1Balance = await token.balanceOf(user1);
        await assertThrow(token.transfer(user1, one, {from: tokenInitialOwner}));

        await controller.enableTransfers(true, {from: owner});
        await token.transfer(user1, one, {from: tokenInitialOwner});

        assert(eq(await token.balanceOf(user1), user1Balance.add(one)))
    });

    it("generateTokens: owner can generate tokens through controller", async () => {
        let user1Balance = await token.balanceOf(user1);
        let totalSupply =  await token.totalSupply();
        await controller.generateTokens(user1, one, {from: owner});

        assert(eq(await token.balanceOf(user1), user1Balance.add(one)));
        assert(eq(await token.totalSupply(), totalSupply.add(one)));
    });

    it("destroyTokens: owner can destroy tokens through controller", async () => {
        let user1Balance = await token.balanceOf(user1);
        let totalSupply =  await token.totalSupply();
        await controller.destroyTokens(user1, one, {from: owner});

        assert(eq(await token.balanceOf(user1), user1Balance.sub(one)));
        assert(eq(await token.totalSupply(), totalSupply.sub(one)));
    });

    it("changePolicy: disable proxyPayment", async () => {
        await controller.changePolicy(false, true, true, {from: owner});

        await assertThrow(web3.eth.sendTransaction({from: user1, to: token.address, value: '1'}));

        await controller.changePolicy(true, true, true, {from: owner});
        await web3.eth.sendTransaction({from: user1, to: token.address, value: '1'});
    });

    it("changePolicy: disable onTransfer", async () => {
        await controller.changePolicy(true, false, true, {from: owner});

        await assertThrow(token.transfer(user1, one, {from: tokenInitialOwner}));

        await controller.changePolicy(true, true, true, {from: owner});
        await token.transfer(user1, one, {from: tokenInitialOwner});
    });

    it("changePolicy: disable onApprove", async () => {
        await controller.changePolicy(true, true, false, {from: owner});

        await assertThrow(token.approve(user1, one, {from: tokenInitialOwner}));

        await controller.changePolicy(true, true, true, {from: owner});
        await token.approve(user1, one, {from: tokenInitialOwner});
    });
});





