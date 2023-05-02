const express = require('express');
const { loadModel } = require('db.js');
const { createAPIRoutes, apiLoginFailure } = require('./api/api.js');
const userauth = require('users/userauth.js')

module.exports = async (app, r) =>
{
    if (r === undefined) r = app;

    const seq = app.ctx.sequelize;
    const settings = app.ctx.settings;

    const api = express.Router();

    // get body
    api.use(
        express.urlencoded({extended:true}),
    );

    createAPIRoutes(api, await loadModel(seq, './sync/models/sync_dir.js'));

    r.use("/api/",
        userauth.express.mustBeLoggedIn(false, apiLoginFailure),
        api
    );
};