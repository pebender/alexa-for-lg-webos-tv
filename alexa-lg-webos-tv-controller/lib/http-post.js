const https = require('https');

/*
 *  @param postOptions = { hostname, path, username, password }
 *  @param postBody = { ... }
 *  @param callback(error, body)
 *  @return null
 */
function HTTPPost(postOptions, postBody, callback) {
    const authorization = Buffer.from(`${postOptions.username}:${postOptions.password}`).toString('base64');
    const content = JSON.stringify(postBody);
    const options = {
        'hostname': postOptions.hostname,
        'port': 25392,
        'path': postOptions.path,
        'method': 'POST',
        'headers': {
            'Authorization': `Basic ${authorization}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(content)
        },
        'rejectUnauthorized':
            Reflect.has(postOptions, 'rejectUnauthorized')
                ? postOptions.rejectUnauthorized
                : true
    };
    const request = https.request(options);
    request.write(content);
    request.once('response', (response) => {
        let body = {};
        let data = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            if (response.statusCode !== 200) {
                const outputSpeech = 'Something appears to be wrong with your L.G. web O.S. T.V. gateway.' +
                    ` It returned the web server status ${response.statusCode}.`;
                if (callback && typeof callback === 'function') {
                    return callback(new Error(outputSpeech), null);
                }
            } else if (!(/^application\/json/).test(response.headers['content-type'])) {
                const outputSpeech = 'Something appears to be wrong with your L.G. web O.S. T.V. gateway.' +
                    ' It returned the wrong content type.';
                if (callback && typeof callback === 'function') {
                    return callback(new Error(outputSpeech), null);
                }
            } else {
                try {
                    body = JSON.parse(data);
                } catch (error) {
                    const outputSpeech = 'Something appears to be wrong with your L.G. web O.S. T.V. gateway.' +
                        'It returned a poorly formatted response.';
                    if (callback && typeof callback === 'function') {
                        return callback(new Error(outputSpeech), null);
                    }
                }
                if (callback && typeof callback === 'function') {
                    return callback(null, body);
                }
            }
            return null;
        });
        response.on('error', (error) => {
            const outputSpeech = 'Something whent wrong while talking with your L.G. web O.S. T.V. gateway.' +
                ' Here is the error message' +
                ` ${error.message}`;
            if (callback && typeof callback === 'function') {
                return callback(new Error(outputSpeech), null);
            }
            return null;
        });
    });
    request.on('error', (error) => {
        const outputSpeech = 'Something whent wrong while talking with your L.G. web O.S. T.V. gateway.' +
            ' Here is the error message' +
            ` ${error.message}`;
        if (callback && typeof callback === 'function') {
            return callback(new Error(outputSpeech), null);
        }
        return null;
    });
}

module.exports = {'post': HTTPPost};