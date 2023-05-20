const express = require('express');
const { loadModels } = require('db_seq.js');
const userauth = require('users/userauth.js');

const HostHandler = require('./HostHandler.js');
const SyncDirHandler = require('./SyncDirHandler.js');

const { getResolvers, getResolversMap } = require('utils/utils-graphql');

const handlerByHostId = new Map();
const handlerBySyncDirId = new Map();

const getModels = require('./models.js');

module.exports = async (app, r, addGraphqlObjects) =>
{
    if (r === undefined) r = app;

    const seq = app.ctx.sequelize;
    const settings = app.ctx.settings;

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

    addGraphqlObjects(
        HostHandler,
        SyncDirHandler,
        {
            graphql_schema: `
                type Query
                {
                    sync_dirs: [SyncDir!]!
                    sync_dir(id: Int!): SyncDir

                    hosts: [Host!]!
                    host(id: Int!): Host
                }
                type Host
                {
                    sync_dirs: [SyncDir!]!
                }
            `,
            graphql_resolvers: {
                Query: {
                    hosts: () => Array.from(handlerByHostId.values()),
                    host: (p, args, ctx) => handlerByHostId.get(args.id),

                    sync_dirs: () => Array.from(handlerBySyncDirId.values()),
                    sync_dir: (p, args, ctx) => handlerBySyncDirId.get(args.id),
                },
                Host: {
                    sync_dirs: v => Array.from(handlerBySyncDirId.values()).filter(s => s.syncDir.HostId == v.host.id)
                }
            }
        }
    );

    r.get('/',
        userauth.express.mustBeLoggedIn(false),
        async (req, res, next) =>
        {
            await res.addGraphQL("{hosts{id,user,host,identity_file,paused,state,error},sync_dirs{id,local_path,remote_path,host{id},state,error}}");

            req.url = "/home.html";
            next();
        }
    );
};