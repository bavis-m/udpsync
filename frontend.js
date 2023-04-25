const express = require('express');
const userauth = require('./userauth.js');

const setupAdminRoutes = require('./admin.js');
const setupLoginRoutes = require('./login.js');
const setupAccountRoutes = require('./account.js');

const utils = require('./utils-express.js');

module.exports = function(app)
{
    const r = express.Router();

    // get body
    r.use(
        express.urlencoded({extended:true}),
    );

    // make sure admin is first, so we always verify the admin user
    setupAdminRoutes(app, r);
    setupLoginRoutes(app, r);
    setupAccountRoutes(app, r);

    // page rendering
    r.get(/^\/([^/]+).html$/,
        (req, res) =>
        {
            const view = req.params[0];

            const settings = req.app.ctx.settings;

            let params = { title:settings.title, msg: req.last_state && Array.isArray(req.last_state.msg) ? req.last_state.msg.join("<br>") : '', ...res.template_params };
            if (req.session.authed_user) params.user = req.session.authed_user.name;

            res.render(view, params,
                (err, html) =>
                {
                    if (err)
                    {
                        res.status(404).end();
                        console.log(err);
                    }
                    else
                    {
                        res.send(html).end();
                    }
                });
        }
    );

    return r;
}
