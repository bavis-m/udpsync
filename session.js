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
        (req, _, next) =>
        {
            if (!req.processed_session_state)
            {
                if (!req.last_state) req.last_state = {};
                if (req.session.last_state)
                {
                    if (Array.isArray(req.session.last_state.msg))
                    {
                        if (!Array.isArray(req.last_state.msg)) req.last_state.msg = [];
                        req.last_state.msg.push(...req.session.last_state.msg);
                    }
                }
                delete req.session.last_state;
                req.processed_session_state = true;
            }
            next();
        }
    ];
}
