const express = require('express');
const utils = require('utils/utils-express.js');
const nocache = require('nocache');

const sessionMiddleware = require('session.js');
const frontendRouter = require('frontend.js');
const setupSync = require('sync/sync.js');


module.exports = async function(app, r)
{
    if (r === undefined) r = app;

    r.use(
        // public static files/bundled files served straight away
        express.static('client/public'),
        express.static('client/dist/public'),

        // nothing else is cached
        nocache(),

        // url encoded data ni requests
        express.urlencoded({extended:true}),

        // load the user's session and the showPage helper()
        sessionMiddleware(app),
        utils.getHelpersMiddleware(),
    );

    // may pass info to frontend, so do that here
    await setupSync(app, r);

    r.use(
        // frontend hookups
        frontendRouter(app), 

        // just in case
        (_, res) => res.status(404).end() 
    );
};
