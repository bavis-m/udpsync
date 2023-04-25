const express = require('express');
const utils = require('./utils-express.js');
const sessionMiddleware = require('./session.js');
const frontendRouter = require('./frontend.js');
const userauth = require('./userauth.js');
const nocache = require('nocache');

const staticRoute = "/frontend";

module.exports = function(app, r)
{
    if (r === undefined) r = app;

    const frontendRoute = "/" + app.ctx.settings.mount + "/";

    // public static files served straight away
    r.use(staticRoute,
        express.static('public')
    );

    // everything else gets a session and the showPage helper()
    r.use(
        nocache(),
        sessionMiddleware(app),
        utils.getHelpersMiddleware()
    );

    // frontendRouter *SHOULD ALWAY* terminates
    r.use(frontendRoute,
        frontendRouter(app),
        (_, res) => res.end() // just in case
    );

    // everything else gets the regular login page authentication
    // accelRedirect *ALWAYS* terminates
    r.use(
        userauth.express.mustBeLoggedIn(true, utils.showPage("login.html")),
        //utils.accelRedirect(req => req.session.authed_user.uri)
    );

    r.return(404);
}
