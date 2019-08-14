function eq(bn1, bn2) {
    if (bn1.eq(bn2)) {
        return true;
    } else {
        console.error(bn1, "is not equail to", bn2);
        return false;
    }
}

module.exports = eq;