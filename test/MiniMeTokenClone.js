const toBN = require("./utils/toBN.js");
const strToBN = require("./utils/strToBN.js");
const eq = require("./utils/eq.js");
const assertThrow = require("./utils/assertThrow.js");
const sleep = require("./utils/sleep.js");

const MINT_AMOUNT = toBN((10**3), 18);

const MiniMeToken = artifacts.require("MiniMeToken");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");

const one = toBN(1);
const zero = toBN(0);

function getLogResults(tx, eventName) {
    if (tx != null) {
        for(let i=0; i < tx.logs.length; i++) {
            let log = tx.logs[i];
            if (log.event == eventName) {
                return log.args;
            }
        }
    }
}

const fs = require('fs');

function getMiniMeContract(addr) {
    let rawdata = fs.readFileSync('./test/MiniMeToken.json');
    let data = JSON.parse(rawdata);
    let abi = data.abi;

    return new web3.eth.Contract(abi, addr);
}

contract("MiniMeToken: MiniMeToken Clone should work correctly", (accounts) => {
    const eoaController = accounts[0];
    const owner = accounts[1];
    const tokenInitialOwner =  accounts[2];
    const user1 =  accounts[3];
    const user2 =  accounts[4];

    var parentsToken;
    var clone;

    var pUser1Balance;
    var pUser2Balance;
    var pTotalSupply;

    var cUser1Balance;
    var cUser2Balance;
    var cTotalSupply;

    before(async () => {
        let user1Balance = toBN(100);
        let user2Balance = toBN(200);

        parentsToken = await MiniMeToken.deployed();
        let balance = await parentsToken.balanceOf(tokenInitialOwner);

        await parentsToken.generateTokens(tokenInitialOwner, MINT_AMOUNT);
        balance = await parentsToken.balanceOf(tokenInitialOwner);

        await parentsToken.transfer(user1, user1Balance, {from: tokenInitialOwner});
        await parentsToken.transfer(user2, user2Balance, {from: tokenInitialOwner});

        let blockNumber = await web3.eth.getBlockNumber();

        let factory = await MiniMeTokenFactory.deployed();
        let tx = await parentsToken.createCloneToken(
            "CloneToken1",
            await parentsToken.decimals(),
            "CT1",
            blockNumber,
            true
        );

        let addr = getLogResults(tx, 'NewCloneToken')['0'];

        clone = getMiniMeContract(addr);
    });

    async function cloneBalanceOf(u) {
        return toBN(await clone.methods.balanceOf(u).call());
    }

    beforeEach(async () => {
        [pUser1Balance, pUser2Balance, pTotalSupply, cUser1Balance, cUser2Balance, cTotalSupply] =
            await Promise.all([
                parentsToken.balanceOf(user1),
                parentsToken.balanceOf(user2),
                parentsToken.totalSupply(),
                cloneBalanceOf(user1),
                cloneBalanceOf(user2),
                clone.methods.totalSupply().call().then(x => { return toBN(x) })
            ]);
    });

    afterEach(async () => {
        assert(eq(await parentsToken.totalSupply(), pTotalSupply));
        assert(eq(toBN(await clone.methods.totalSupply().call()), cTotalSupply));
    });

    it("clone should have same balance to parentsToken", async () => {
        assert(eq(await cloneBalanceOf(user1), pUser1Balance));
        assert(eq(await cloneBalanceOf(user2), pUser2Balance));
    });

    it("transfer in parentsToken does NOT affect to clone", async () => {
        await parentsToken.transfer(user1, one, {from: tokenInitialOwner});
        assert(eq(await parentsToken.balanceOf(user1), pUser1Balance.add(one)));
        assert(eq(await cloneBalanceOf(user1), cUser1Balance));
    });

    it("transfer in clone does NOT affect to parentsToken balance", async () => {
        let tx = await clone.methods.transfer(user1, one.toString('hex')).send({ from: tokenInitialOwner, gas: 150000 });

        assert(eq(await cloneBalanceOf(user1), cUser1Balance.add(one)));
        assert(eq(await parentsToken.balanceOf(user1), pUser1Balance));
    });

});



