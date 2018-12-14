
function skillHandlerLookUp(event) {
    if (Reflect.has(event, 'directive')) {
        return null;
    }
    return null;
}

module.exports = {'handlerLookUp': skillHandlerLookUp};