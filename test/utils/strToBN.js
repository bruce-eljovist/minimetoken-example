function strToBN(n) {
    return new web3.utils.BN(n.toString());
}

module.exports = strToBN;