
const strToBN = require("./strToBN.js");

function toBN(n, unit=0) {
    if (n == 0) {
        unit = 0;
    }

    return strToBN(n.toString() + "0".repeat(unit));
}

module.exports = toBN;
