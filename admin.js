const userauth = require('./userauth.js');

const allowedWithNoAdminPassword = ["/set_admin.html", "/do_set_admin"];

module.exports = function(app, r)
{
    if (r === undefined) r = app;

    // must create admin account if not set
    r.use(
        async (req, res, next) =>
        {
            const seq = req.app.ctx.sequelize;

            // get some db stats
            req.num_users = await seq.models.User.count();

            if (req.num_users == 0 && !allowedWithNoAdminPassword.includes(req.url))
            {
                res.showPage("set_admin.html");
                return;
            }

            next();
        }
    );

    // initial admin account setup
    r.post('/do_set_admin',
        async (req, res) =>
        {
            const seq = req.app.ctx.sequelize;

            if (req.num_users > 0)
            {
                res.showPage("login.html", 'Admin account already set');
                return;
            }

            if (typeof req.body.password == 'string' && req.body.password.trim().length > 0)
            {
                await userauth.createUser(seq, "admin", req.body.password.trim());
            }
            res.showPage("login.html", 'Admin password set');
        }
    );
}
