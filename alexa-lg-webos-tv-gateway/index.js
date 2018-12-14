/*
 *******************************************************************************
 * I found the 'ssap://*' LG webOS TV commands in
 * <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
 * These commands may be incomplete/inaccurate as the LG Connect SDK team
 * <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
 * since the 1.6.0 release on 09 September 2015.
 */

const express = require('express');
const basicAuth = require('express-basic-auth');
const fs = require('fs-extra');
const Datastore = require('nedb');
const ppath = require('persist-path');
const constants = require('alexa-lg-webos-tv-common');
const HTTPAuthorization = require('./lib/http-authorization.js');
const LGTVControl = require('./lib/lgtv-control.js');
const LGTVSearch = require('./lib/lgtv-search.js');

/*
 * I keep long term information needed to connect to each TV in a database.
 * The long term information is the TV's unique device name (udn), friendly name
 * (name), Internet Protocol address (ip), media access control address (mac)
 * and client key (key).
 */
const configurationDir = ppath('LGwebOSTVGateway');
try {

    /*
     * This operation is synchronous. It is both expected and desired because it
     * occures once at startup and because the directory is needed before the LG
     * webOS TV gateway can run.
     */
    // eslint-disable-next-line no-sync
    fs.mkdirSync(configurationDir);
} catch (error) {
    if (error.code !== 'EEXIST') {
        throw error;
    }
}

/*
 * This operation is synchronous. It is both expected and desired because it
 * occures once at startup and because the database is needed before the LG
 * webOS TV gateway can run.
 */
const httpDb = new Datastore({'filename': `${configurationDir}/http.nedb`});
httpDb.loadDatabase((error) => {
    if (error) {
        throw error;
    }
});
httpDb.ensureIndex({'fieldName': 'username',
    'unique': true});

/*
 * This operation is synchronous. It is both expected and desired because it
 * occures once at startup and because the database is needed before the LG
 * webOS TV gateway can run.
 */
const lgtvDb = new Datastore({'filename': `${configurationDir}/lgtv.nedb`});
lgtvDb.loadDatabase((error) => {
    if (error) {
        throw error;
    }
});
lgtvDb.ensureIndex({'fieldName': 'udn',
    'unique': true});

const httpAuthorization = new HTTPAuthorization(httpDb, (error) => {
    if (error) {
        throw error;
    }
});

// I keep the list of all LG webOS TVs.
const lgtvControl = new LGTVControl(lgtvDb, (error) => {
    if (error) {
        throw error;
    }
});
// eslint-disable-next-line no-unused-vars
lgtvControl.on('error', (error, _udn) => {
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
internal.use('/HTTP/form', express.urlencoded({
    'extended': false
}));
internal.get('/HTTP/form', (request, response) => {
    httpAuthorization.hostname = request.query.hostname;
    if (('passwordDelete' in request.query) && (/^on$/i).test(request.query.passwordDelete)) {
        httpAuthorization.password = null;
    }
    const {hostname, password} = httpAuthorization;
    let hostnameHTML = '<p>The LG webOS TV gateway has no hostname.</p>';
    if (hostname !== null) {
        hostnameHTML = `<p>The LG webOS TV gateway hostname is ${hostname}.`;
    }
    let passwordHTML = '<p>The LG webOS TV gateway has no password.</p>';
    if (password !== null) {
        passwordHTML = '<p>The LG webOS TV gateway has a password.</p>';
    }
    const page = `<!DOCTYPE html>
        <html>
            <head>
                <title>
                    LG webOS TV gateway
                </title>
            </head>
            <body>
                <H1>LG webOS TV gateway</H1>
                ${hostnameHTML}
                ${passwordHTML}
            </body>
        </html>`;
    response.
        type('html').
        status(200).
        send(page).
        end();
});
internal.get('/', (request, response) => {
    let hostname = '';
    if (httpAuthorization.hostname !== null) {
        ({hostname} = httpAuthorization);
    }
    const page = `<!DOCTYPE html>
        <html>
            <head>
                <title>
                    LG webOS TV gateway
                </title>
            </head>
            <body>
                <H1>LG webOS TV gateway</H1>
                    <form action="/HTTP/form" enctype="url-encoded" method="get">
                        <div>
                            <label for="hostname_label">LG webOS TV gateway hostname:</label>
                            <input type="text" id="hostname_id" name="hostname" value="${hostname}">
                        </div>
                        <div>
                            <label for="hostname_label">LG webOS TV gateway password delete:</label>
                            <input type="checkbox" id="passwordDelete_id" name="passwordDelete">
                        </div>
                        <div class="button">
                            <button type="submit">submit your changes</submit>
                        </div>
                    </form>
            </body>
        </html>`;
    response.
        type('html').
        status(200).
        send(page).
        end();
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
    if (Reflect.has(request.body, 'command') && request.body.command.name === 'passwordSet') {
        if (httpAuthorization.password === null) {
            httpAuthorization.password = request.body.command.value;
            response.
                type('json').
                status(200).
                json({}).
                end();
        } else {
            const body = {
                'error': {
                    'message': 'Gateway\'s password is already set.'
                }
            };
            response.
                type('json').
                status(200).
                json(body).
                end();
        }
    } else {
        response.status(400).end();
    }
});
external.use('/LGTV', basicAuth({'authorizer': requestAuthorizeLGTV}));
function requestAuthorizeLGTV(username, password) {
    if (username === httpAuthorization.username && password === httpAuthorization.password) {
        return true;
    }
    return false;
}
external.post('/LGTV/MAP', (request, response) => {
    if (Reflect.apply(Object.getOwnPropertyDescriptor.hasOwnProperty, request.body, 'command') && request.body.command.name === 'udnsGet') {
        const body = {'udns': Object.keys(lgtvControl)};
        response.
            type('json').
            status(200).
            json(body).
            end();
    }
});
external.post('/LGTV/RUN', (request, response) => {
    lgtvControl.tvCommand(
        request.body.television,
        request.body.command,
        (err, res) => {
            if (err) {
                const body = {
                    'error': {
                        'name': err.name,
                        'message': err.message
                    }
                };
                response.
                    type('json').
                    status(200).
                    json(body).
                    end();
            } else {
                response.
                    type('json').
                    status(200).
                    json(res).
                    end();
            }
        }
    );
});
external.post('/', (request, response) => {
    response.status(401).end();
});
external.listen(25391, 'localhost');
