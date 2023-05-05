const express = require('express');
const { loadModels } = require('db.js');
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

    createAPIRoutes(api, await loadModels(seq, './sync/models.js'));

    r.use("/setup.html",
        userauth.express.mustBeLoggedIn(false),
        async (req, res, next) =>
        {
            res.initial_data.hosts = (await seq.models.Host.findAll()).map(h => h.toJSON());
            res.initial_data.sync_dirs = (await seq.models.SyncDir.findAll()).map(h => t.toJSON());
            next();
        }
    );

    r.use("/api/",
        userauth.express.mustBeLoggedIn(false, apiLoginFailure),
        api
    );
};