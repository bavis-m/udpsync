const express = require('express');

const setupAdminRoutes = require('users/admin.js');
const setupLoginRoutes = require('users/login.js');
const setupAccountRoutes = require('users/account.js');

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

            const toastsData = JSON.stringify(req.last_state && Array.isArray(req.last_state.toasts) ? req.last_state.toasts : []);

            let params = { title:settings.title, toasts: `<script>$(function() { Dist.toast(${toastsData}); });</script>`, ...res.template_params };
            if (req.session.authed_user) params.user = req.session.authed_user.name;

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
