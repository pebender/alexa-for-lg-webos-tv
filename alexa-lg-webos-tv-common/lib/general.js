function callbackToPromise(resolve, reject, error, response) {
    if (error) {
        reject(error);
        return;
    }
    resolve(response);
}

module.exports = {
    "callbackToPromise": callbackToPromise
};