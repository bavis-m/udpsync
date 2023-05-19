const bcrypt = require('bcrypt');
const { URL } = require('node:url');
const { showPage } = require('utils/utils-express.js');

async function hash(password)
{
    return await bcrypt.hash(password, 10);
}

async function compare(p1, p2)
{
    return await bcrypt.compare(p1, p2);
}

const express = 
{
    mustBeLoggedIn: function(rehydrateUser, loginMiddleware)
    {
        return async (req, res, next) =>
        {
            // always rehydrate the user
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

            if (req.session.authed_user)
            {
                next();
            }
            else
            {                
                if (loginMiddleware === undefined)
                {
                    let page = "login.html";
                    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
                    if (url.pathname.endsWith(".html")) page += "?redirect=" + encodeURIComponent(url.pathname);

                    loginMiddleware = showPage(page);
                }
                
                await loginMiddleware(req, res, next);
            }
        }
    },

    mustBeLoggedOut: function()
    {
        return async (req, res, next) =>
        {
            if (req.session.authed_user)
            {
                await res.redirectWithSession(302, '/account.html');
                return;
            }
            next();
        };
    },
};

async function getUser(app, name) { return await app.ctx.sequelize.models.User.findOne({where:{name}}); }

async function getAuthorisedUser(app, name, password)
{
    const user = await getUser(app, name);
    if (user && await compare(password, user.password)) return user;
    return null;
}

async function changePassword(user, password)
{
    user.password = await hash(password);
}

async function createUser(sequelize, name, password)
{
    return sequelize.models.User.create({ name, password:await hash(password) });
}

module.exports =
{
    express,

    getUser,
    getAuthorisedUser,
    createUser,
    changePassword
};
