const session = require('express-session');
const SequelizeStore = require('express-session-sequelize')(session.Store);

module.exports = function(app)
{
    return [
        session({
            store: new SequelizeStore({
                db: app.ctx.sequelize,
                checkExpirationInterval: 86400000 // prune expired entries every 24h
            }),
            cookie: {
                maxAge: app.ctx.settings.session.age * 1000,
                sameSite: true,
            },
            name: app.ctx.settings.session.name,
            secret: app.ctx.settings.session.secret,
            saveUninitialized: true,
            rolling: true,
            resave: false,
        }),
        (req, res, next) =>
        {
            res.redirectWithSession = (status, path) => new Promise((resolve, reject) =>
            {
                req.session.save(() =>
                    {
                        res.redirect(status, path);
                        resolve();
                    });
            });
            if (!req.processed_session_state)
            {
                if (!req.last_state) req.last_state = {};
                if (req.session.last_state)
                {
                    if (Array.isArray(req.session.last_state.toasts))
                    {
                        if (!Array.isArray(req.last_state.toasts)) req.last_state.toasts = [];
                        req.last_state.toasts.push(...req.session.last_state.toasts);
                    }
                }
                delete req.session.last_state;
                req.processed_session_state = true;
            }
            next();
        }
    ];
}
