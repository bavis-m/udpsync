const express = require('express');
const { loadModels } = require('db_seq.js');
const { createAPIRoutes, apiLoginFailure } = require('./api/api.js');
const userauth = require('users/userauth.js');
const HostHandler = require('./HostHandler.js');
const SyncDirHandler = require('./SyncDirHandler.js');

const handlerByHostId = new Map();
const handlerBySyncDirId = new Map();

const getModels = require('./models.js');

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

    await loadModels(seq, getModels);

    for (const host of await seq.models.Host.findAll())
    {
        const handler = new HostHandler(host);
        handler.run();
        handlerByHostId.set(host.id, handler);
    }

    for (const syncDir of await seq.models.SyncDir.findAll())
    {
        const handler = new SyncDirHandler(handlerByHostId.get(syncDir.HostId), syncDir);
        handler.run();
        handlerBySyncDirId.set(syncDir.id, handler);
    }

    createAPIRoutes(api, {name:"host", plural:"hosts"}, id => handlerByHostId.get(parseInt(id)), () => handlerByHostId.values());
    createAPIRoutes(api, {name:"sync_dir", plural:"sync_dirs"}, id => handlerBySyncDirId.get(parseInt(id)), () => handlerBySyncDirId.values());

    r.get('/',
        userauth.express.mustBeLoggedIn(false),
        async (req, res, next) =>
        {
            res.initial_data.hosts = (await seq.models.Host.findAll()).map(h => h.toJSON());
            res.initial_data.sync_dirs = (await seq.models.SyncDir.findAll()).map(s => s.toJSON());
            
            req.url = "/home.html";
            next();
        }
    );

    r.use("/api/",
        userauth.express.mustBeLoggedIn(false, apiLoginFailure),
        api
    );
};