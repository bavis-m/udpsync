const express = require('express');
const { loadModels } = require('db.js');
const { createAPIRoutes, apiLoginFailure } = require('./api/api.js');
const userauth = require('users/userauth.js');
const HostHandler = require('./HostHandler.js');

const handlerByHostId = new Map();

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

    await loadModels(seq, './sync/models.js');
    for (const host of await seq.models.Host.findAll())
    {
        const remote = new HostHandler(host);
        remote.run();
        handlerByHostId.set(host.id, remote);
    }

    createAPIRoutes(api, {name:"host", plural:"hosts"}, id => handlerByHostId.get(parseInt(id)), () => handlerByHostId.values());

    r.get('/',
        userauth.express.mustBeLoggedIn(false),
        async (req, res, next) =>
        {
            res.initial_data.hosts = (await seq.models.Host.findAll()).map(h => h.toJSON());
            res.initial_data.sync_dirs = (await seq.models.SyncDir.findAll()).map(h => t.toJSON());
            
            req.url = "/home.html";
            next();
        }
    );

    r.use("/api/",
        userauth.express.mustBeLoggedIn(false, apiLoginFailure),
        api
    );
};