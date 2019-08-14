async function assertThrow(promise, message) {
    let errorOccured = false;

    try {
        await promise;
    } catch(e) {
        errorOccured = true;
    }

    if (errorOccured)
        return;
    else
        assert(false, message);
}

module.exports = assertThrow;