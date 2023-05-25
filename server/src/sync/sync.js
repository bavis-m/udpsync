const { mustBeLoggedIn } = require('userauth.js');

const HostHandler = require('./HostHandler.js');
const SyncDirHandler = require('./SyncDirHandler.js');

const handlerByHostId = new Map();
const handlerBySyncDirId = new Map();

function setupData(seq, graphql)
{
    HostHandler.setupData(seq, graphql);
    SyncDirHandler.setupData(seq, graphql);

    graphql.addSchemas(`
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
    `);

    graphql.addResolvers({
        Query: {
            hosts: () => Array.from(handlerByHostId.values()),
            host: (p, args, ctx) => handlerByHostId.get(args.id),

            sync_dirs: () => Array.from(handlerBySyncDirId.values()),
            sync_dir: (p, args, ctx) => handlerBySyncDirId.get(args.id),
        },
        Host: {
            sync_dirs: v => Array.from(handlerBySyncDirId.values()).filter(s => s.syncDir.HostId == v.host.id)
        }
    });
}

async function setup(app, r)
{
    for (const host of await HostHandler.Host.findAll())
    {
        const handler = new HostHandler(host);
        handler.run();
        handlerByHostId.set(host.id, handler);
    }

    for (const syncDir of await SyncDirHandler.SyncDir.findAll())
    {
        const handler = new SyncDirHandler(handlerByHostId.get(syncDir.HostId), syncDir);
        handler.run();
        handlerBySyncDirId.set(syncDir.id, handler);
    }

    if (r === undefined) r = app;

    r.get('/',
        mustBeLoggedIn(false),
        async (req, res, next) =>
        {
            await res.addGraphQL("{hosts{id,user,host,identity_file,paused,state,error},sync_dirs{id,local_path,remote_path,host{id},state,error}}");

            req.url = "/home.html";
            next();
        }
    );
}

module.exports = { setupData, setup };