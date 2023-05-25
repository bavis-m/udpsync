const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { URL } = require('node:url');
const { showPage } = require('utils/utils-express.js');
const { getResolvers } = require('utils/utils-graphql.js');

async function setupData(seq, graphql)
{
    const User = await seq.define('User', {
        name: { type:DataTypes.STRING, primaryKey:true },
        password: DataTypes.STRING,
        properties: { type:DataTypes.JSON, get() { return JSON.parse(this.getDataValue('properties')); }, set(v) { this.setDataValue('properties', JSON.stringify(v)); } },
    });
    User.findAuthorized = async function(name, password)
    {
        const user = await this.findOne({where:{name}});
        if (user && await bcrypt.compare(password, user.password)) return user;
        return null;
    }

    graphql.addSchemas(`
        type Query {
            users: [User!]!
            user(name: String): User
            authed_user: String
        }

        type User {
            name: String!
            properties: JSONObject
        }
    `);

    graphql.addResolvers({
        Query: {
            users: async () => await User.findAll(),
            user: async (parent, args) => await User.findOne({where:{name:args.name}}),
            authed_user: (parent, args, ctx) => ctx.session.authed_user ? ctx.session.authed_user.name : null
        },
        User: getResolvers('name', 'properties')
    });
}

async function setup(app, r)
{
    const User = app.ctx.sequelize.models.User;

    if (r === undefined) r = app;

    /**************************************
    * make sure at least one account exists
    **************************************/

    r.use(
        async (req, res, next) =>
        {
            const userCount = await User.count();
            const isAdminUrl = req.url == '/set_admin.html' || req.url == '/do_set_admin';

            if (isAdminUrl && userCount == 0) return next();
            if (!isAdminUrl && userCount > 0) return next();
            
            if (isAdminUrl) return await res.showPage('', 'Admin account already set');
            await res.showPage('set_admin.html');
        }
    );

    // initial account setup
    r.post('/do_set_admin',
        async (req, res) =>
        {
            if (typeof req.body.password != 'string' ||
                req.body.password.trim().length == 0) return await res.showPage('set_admin.html', 'Invalid password');

            await User.create({ name:'admin', password:await hash(req.body.password.trim()) });
            await res.showPage('', 'Admin password set');
        }
    );

    /*****************
    * login and logout
    *****************/

    // verify login state
    r.use(['/login.html', '/do_login'],
        mustBeLoggedOut()
    );

    // handle login
    r.post('/do_login',
        async (req, res) =>
        {
            const user = await User.findAuthorized(req.body.user, req.body.password);
            if (user)
            {
                req.session.authed_user = user.toJSON();
                await res.showPage(req.body.redirect || '', 'Logged in');
            }
            else
            {
                await res.showPage('login.html', 'Login failed');
            }
        }
    );

    // handle logout
    r.post('/do_logout',
        mustBeLoggedIn(false),
        async (req, res) =>
        {
            const name = req.session.authed_user.name;
            delete req.session.authed_user;
            await res.showPage('login.html', `Logged out from user <b>${name}</b>`);
        }
    );

    /*****************
    * account updating
    *****************/

    // verify login state
    r.use(['/account.html', '/do_set_password'],
        mustBeLoggedIn(true)
    );

    // change password
    r.post('/do_set_password',
        async (req, res) =>
        {
            if (typeof req.body.old_password != 'string' ||

                typeof req.body.new_password != 'string' ||
                req.body.new_password.trim().length == 0 ||

                typeof req.body.new_password2 != 'string' ||
                req.body.new_password.trim() != req.body.new_password2.trim() ||
                
                !(await User.findAuthorized(req.session.authed_user.name, req.body.old_password)))
            {
                return await res.showPage('account.html', 'Invalid request');
            }

            user.password = await hash(req.body.new_password.trim());
            await user.save();
            res.addMsg('Password changed! Please re-log in.');
            req.url = '/do_logout';
            req.app.handle(req, res);
        }
    );
}

async function hash(password)
{
    return await bcrypt.hash(password, 10);
}

function mustBeLoggedIn(rehydrateUser, loginMiddleware)
{
    return async (req, res, next) =>
    {
        if (req.session.authed_user && rehydrateUser)
        {
            const user = await req.app.ctx.sequelize.models.User.findOne({where:{name:req.session.authed_user.name}});
            if (!user)
            {
                delete req.session.authed_user;
            }
            else
            {
                req.session.authed_user = user.toJSON();
            }
        }

        if (req.session.authed_user) return next();

        if (loginMiddleware === undefined)
        {
            let page = 'login.html';
            const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
            if (url.pathname.endsWith('.html')) page += '?redirect=' + encodeURIComponent(url.pathname);

            loginMiddleware = showPage(page);
        }
        
        await loginMiddleware(req, res, next);
    }
}

function mustBeLoggedOut()
{
    return async (req, res, next) =>
    {
        if (req.session.authed_user) return await res.redirectWithSession(302, '/account.html');
        next();
    };
}

module.exports = { setupData, setup, mustBeLoggedIn, mustBeLoggedOut };