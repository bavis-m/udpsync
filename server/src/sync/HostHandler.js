const { spawn } = require('node:child_process');
const fs = require('node:fs');
const { DataTypes } = require('sequelize');
const { sleepAsync } = require('utils/utils.js');
const { getResolvers, getResolversMap } = require('utils/utils-graphql.js');

module.exports = class HostHandler
{
    static setupData(seq, graphql)
    {
        this.Host = seq.define('Host', {
            id:             { type:DataTypes.INTEGER,   primaryKey:true,    autoIncrement: true },
            user:           { type:DataTypes.STRING,    allowNull:false,    unique:'user_host_identity' },
            host:           { type:DataTypes.STRING,    allowNull:false,    unique:'user_host_identity' },
            identity_file : { type:DataTypes.STRING,    allowNull:false,    unique:'user_host_identity' },
            paused:         { type:DataTypes.BOOLEAN,   allowNull: false }
        });
    
        graphql.addSchemas(`
            type Host
            {
                id: Int!
                user: String!
                host: String!
                identity_file: String!
                paused: Boolean
                state: String!
                error: String
            }
        `);
    
        // value here is a HostHandler, not a Host db model instance
        graphql.addResolvers({
            Host: {
                ...getResolversMap(h => h.host, 'id', 'user', 'host', 'identity_file', 'paused'),
                ...getResolvers('state', 'error')
            }
        });
    }

    constructor(host)
    {
        this.host = host;
        this.resetTimeout();
        this.state = 'none';
        this.error = null;
    }

    get controlPath()
    {
        return `/tmp/sshcontrol_${this.host.id}`;
    }

    get userAtHost()
    {
        return this.host.user + '@' + this.host.host;
    }

    resetTimeout()
    {
        this.timeoutSeconds = 60;
    }

    get active()
    {
        return this.process && this.process.active;
    }

    run()
    {
        if (this.host.paused || this.state == 'running') return;

        if (!fs.existsSync(this.host.identity_file))
        {
            this.state = 'error';
            this.error = 'invalid_identity';
        }

        if (fs.existsSync(this.controlPath)) fs.unlinkSync(this.controlPath);

        this.process = spawn('/udpsend/yeshup', ['/usr/bin/ssh', '-N', '-M', '-S', this.controlPath, '-i', this.host.identity_file, this.userAtHost], { detached: true, stdio: 'ignore' });
        this.process.unref();

        if (this.process)
        {
            this.resetTimeout();
            this.clearTimeout();
            this.state = 'running';
            this.error = null;
            this.process.on('exit', this.processExited.bind(this));
        }
        else
        {
            this.processExited();
        }
    }

    clearTimeout()
    {
        if (this.timeout)
        {
            this.timeout.cancel();
            this.timeout = undefined;
        }
    }
    

    async processExited()
    {
        this.state = 'exited';
        this.error = null;

        this.clearTimeout();
        this.timeout = sleepAsync(this.timeoutSeconds * 1000);

        try
        {
            await this.timeout;
        }
        catch
        {
            // cancelled
            return;
        }

        this.timeoutSeconds = Math.min(10 * 60, this.timeoutSeconds * 2);
        this.run();
    }

    stop()
    {
        console.log('STOPPED');
        this.clearTimeout();
        if (this.process)
        {
            this.state = 'stopped';
            this.error = null;
            this.process.removeAllListeners('exit');
            this.process.kill();
            this.process = null;
        }
    }

    async pause()
    {
        if (this.state != 'paused')
        {
            this.clearTimeout();
            this.stop();
            this.state = 'paused';
            this.error = null;
            this.host.paused = true;
            await this.host.save();
        }
    }

    async resume()
    {
        if (this.state == 'paused')
        {
            this.host.paused = false;
            this.run();
            await this.host.save();
        }
    }
};