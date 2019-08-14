// const MMT = artifacts.require("MMT");
// const MMTController = artifacts.require("MMTController");


/*
toBN(99, 1)  => 990
toBN(99, 0)  => 99
toBN(0, 0)   => 0
toBN(99, 18) => 99000000000000000000
*/

const toBN = require("./utils/toBN.js");
const strToBN = require("./utils/strToBN.js");
const eq = require("./utils/eq.js");

contract('Utils', (accounts) => {
    it('utils total test', () => {
        assert(eq(toBN(99, 1), strToBN("990")));
        assert(eq(toBN(99, 0), strToBN("99")));
        assert(eq(toBN(0, 0), strToBN("0")));
        assert(eq(toBN(0, 1), strToBN("0")));
        assert(eq(toBN(99, 18), strToBN("99000000000000000000")));

        assert.throws(() => toBN(99,-1));
    });    
});


