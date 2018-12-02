'use strict';

////////////////////////////////////////////////////////////////////////////////
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.

const express = require('express');
const basicAuth = require('express-basic-auth');
const fs = require('fs-extra');
const Datastore = require('nedb');
const ppath = require('persist-path');
const constants = require('alexa-lg-webos-tv-core').constants;
const HTTPAuthorization = require('./http-authorization.js');
const LGTVControl = require('./lgtv-control.js');
const LGTVSearch = require('./lgtv-search.js');

// I keep long term information needed to connect to each TV in a database.
// The long term information is the TV's unique device name (udn), friendly name
// (name), Internet Protocol address (ip), media access control address (mac)
// and client key (key).
const configurationDir = ppath('LGwebOSTVBridge');
try {
    fs.mkdirSync(configurationDir);
} catch (error) {
    if (error.code != 'EEXIST') {
        throw error;
    }
}
const httpDb = new Datastore({'filename': `${configurationDir}/http.nedb`});
httpDb.loadDatabase((error) => { if (error) { throw error; } });
httpDb.ensureIndex({'fieldName': 'username', 'unique': true});

const lgtvDb = new Datastore({'filename': `${configurationDir}/lgtv.nedb`});
lgtvDb.loadDatabase((error) => { if (error) { throw error; } });
lgtvDb.ensureIndex({'fieldName': 'udn', 'unique': true});

let httpAuthorization = new HTTPAuthorization(httpDb, (error) => { if (error) { throw error; } });

// I keep the list of all LG webOS TV 
const lgtvControl = new LGTVControl(lgtvDb, (error) => { if (error) { throw error; } });
lgtvControl.on('error', (error, udn) => {
    console.error(error);
});
lgtvControl.dbLoad();

const lgtvSearch = new LGTVSearch();
lgtvSearch.on('error', (error) => {
    console.error(error);
});
lgtvSearch.on('found', (tv) => {
    lgtvControl.tvUpsert(tv);
});
lgtvSearch.now();

const internal = express();
internal.use('/HTTP/form', express.urlencoded(
    {
        'extended': false
    }
));
internal.get('/HTTP/form', (request, response) => {
    httpAuthorization.hostname = request.query.hostname;
    if (('passwordDelete' in request.query) && (/^on$/i).test(request.query.passwordDelete)) {
        httpAuthorization.password = null;
    }
    const page = responseHTMLGet(httpAuthorization.password, httpAuthorization.hostname);
    response.type('html').status(200).send(page).end();

    function responseHTMLGet(password, hostname) {
        let hostnameHTML = '<p>The LG webOS TV bridge has no hostname.</p>';
        if (hostname !== null) {
            hostnameHTML = `<p>The LG webOS TV bridge hostname is ${hostname}.`;
        }
        let passwordHTML = '<p>The LG webOS TV bridge has no password.</p>';
        if (password !== null) {
            passwordHTML = '<p>The LG webOS TV bridge has a password.</p>';
        }
        const page = `<!DOCTYPE html>
            <html>
                <head>
                    <title>
                        LG webOS TV bridge
                    </title>
                </head>
                <body>
                    <H1>LG webOS TV bridge</H1>
                    ${hostnameHTML}
                    ${passwordHTML}
                </body>
            </html>`;
        return page;       
    }
});
internal.get('/', (request, response) => {
    let hostname = '';
    if (httpAuthorization.hostname !== null) {
        hostname = httpAuthorization.hostname;
    }
    const page = `<!DOCTYPE html>
        <html>
            <head>
                <title>
                    LG webOS TV bridge
                </title>
            </head>
            <body>
                <H1>LG webOS TV bridge</H1>
                    <form action="/HTTP/form" enctype="url-encoded" method="get">
                        <div>
                            <label for="hostname_label">LG webOS TV bridge hostname:</label>
                            <input type="text" id="hostname_id" name="hostname" value="${hostname}">
                        </div>
                        <div>
                            <label for="hostname_label">LG webOS TV bridge password delete:</label>
                            <input type="checkbox" id="passwordDelete_id" name="passwordDelete">
                        </div>
                        <div class="button">
                            <button type="submit">submit your changes</submit>
                        </div>
                    </form>
            </body>
        </html>`;
    response.type('html').status(200).send(page).end();
});
internal.listen(25393);

const external = express();
external.use('/', express.json());
external.use('/HTTP', basicAuth({'authorizer': requestAuthorizeHTTP}));
function requestAuthorizeHTTP(username, password) {
    if (username === 'HTTP' && password === constants.password) {
        return true;
    }
    return false;
}
external.post('/HTTP', (request, response) => {
    if (request.body.hasOwnProperty('command') && request.body.command.name === 'hostnameGet') {
        if (httpAuthorization.hostname === null) {
            const body = {
                'error': {
                    'message': 'Your L.G. web O.S. T.V. bridge does not have a hostname set.'
                }
            };
            response.type('json').status(200).json(body).end();
        } else {
            const body = {
                'hostname': httpAuthorization.hostname
            };
            response.type('json').status(200).json(body).end();
        }
    } else if (request.body.hasOwnProperty('command') && request.body.command.name === 'passwordSet') {
        if (httpAuthorization.password === null) {
            httpAuthorization.password = request.body.command.value;
            response.type('json').status(200).json({}).end();
        } else {
            const body = {
                'error': {
                    'message': 'Your L.G. web O.S. T.V. bridge password is already set.'
                }
            };
            response.type('json').status(200).json(body).end();
        }
    } else {
        response.status(400).end();
    }
});
external.use('/LGTV', basicAuth({'authorizer': requestAuthorizeLGTV}));
function requestAuthorizeLGTV(username, password) {
    if (username === httpAuthorization.username && password === httpAuthorization.password) {
        return true;
    } else {
        return false;
    }
}
external.post('/LGTV/MAP', (request, response) => {
    if (request.body.hasOwnProperty('command') && request.body.command.name === 'udnsGet') {
        const body = {'udns': Object.keys(lgtvControl)};
        response.type('json').status(200).json(body).end();
    }
});
external.post('/LGTV/RUN', (request, response) => {
    lgtvControl.tvCommand(request.body.television, request.body.command,
        (error, res) => {
            if (err) {
                response.status(500).end();
                return;
            } else {
                response.type('json').status(200).json(res).end();
                return;
            }
        });
});
external.post('/', (request, response) => {
    response.status(401).end();
});
external.listen(25391, 'localhost');
