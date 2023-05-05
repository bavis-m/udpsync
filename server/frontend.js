const express = require('express');

const setupAdminRoutes = require('users/admin.js');
const setupLoginRoutes = require('users/login.js');
const setupAccountRoutes = require('users/account.js');

const { showPage } = require('utils/utils-express.js');

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

            res.initial_data.toasts = req.last_state && Array.isArray(req.last_state.toasts) ? req.last_state.toasts : [];

            if (req.session.authed_user)
            {
                res.initial_data.authed_user = req.session.authed_user;
            }

            let params = { title:settings.title, ...res.template_params, initial_data: `<script>window.initial_data = ${JSON.stringify(res.initial_data)};</script>` };

            if (!process.env.NO_MUSTACHE)
            {
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
        }
    );

    return r;
}
