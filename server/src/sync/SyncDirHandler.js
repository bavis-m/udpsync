const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const { DataTypes } = require('sequelize');
const { sleepAsync } = require('utils/utils');
const { getResolvers, getResolversMap } = require('utils/utils-graphql');
const HostHandler = require('./HostHandler');

module.exports = class SyncDirHandler
{
    static setupData(seq, graphql)
    {
        this.SyncDir = seq.define("SyncDir", {
            id: { type:DataTypes.INTEGER, primaryKey:true, autoIncrement: true },
            local_path: { type:DataTypes.STRING, unique:"local_path", allowNull:false },
            remote_path: { type:DataTypes.STRING, allowNull: false }
        });
        HostHandler.Host.hasMany(this.SyncDir);
    
        graphql.addSchemas(`
            type SyncDir
            {
                id: Int!
                local_path: String!
                remote_path: String!
                host: Host!
                state: String!
                error: String
            }
        `);
    
        // value here is a SyncDirHandler, not a SyncDir db model instance
        graphql.addResolvers({
            SyncDir: {
                ...getResolversMap(s => s.syncDir, 'id', 'local_path', 'remote_path'),
                ...getResolvers('state', 'error'),
                host: v => v.hostHandler
            }
        });
    }

    constructor(hostHandler, syncDir)
    {
        this.hostHandler = hostHandler;
        this.syncDir = syncDir;
        this.getRemoteDirs();

        this.state = 'none';
        this.error = null;
    }

    toJSON()
    {
        return { ...this.syncDir.toJSON(), state:this.state, error:this.error };
    }

    async run()
    {
        await this.waitForMasterControl();
        console.log(this.getRemoteDirs());

        if (this.state != 'error')
        {
            this.state = 'idle';
            this.error = null;
        }
    }

    async waitForMasterControl()
    {
        this.state = 'wait_host_control';
        this.error = null;
        while (!fs.existsSync(this.hostHandler.controlPath))
        {
            await sleepAsync(1000);
        }
    }

    get sshCommand()
    {
        return `ssh -S "${this.hostHandler.controlPath}"`;
    }

    getRemoteDirs()
    {
        const params = [
            '-r',
            '-n',
            '--ignore-existing',
            '--out-format=%n',
            '--include=*/',
            '--exclude=*',
            '-e',
            this.sshCommand,
            this.hostHandler.userAtHost + ':/', // most likely this is going to be passed to rrsync, and it changes root to point to the target directory
            this.syncDir.local_path
        ];
        const results = spawnSync('/usr/bin/rsync', params, {encoding:'utf8'});
        if (results.status != 0)
        {
            this.state = 'error';
            this.error = results.stderr;
            return null;
        }

        return results.stdout.split(/\r?\n/);
    }
};