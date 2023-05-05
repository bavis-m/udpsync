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
                await res.showPage("set_admin.html");
                return;
            }

            next();
        }
    );

    r.use(['/do_set_admin', '/set_admin.html'],
        async (req, res, next) =>
        {
            if (req.num_users > 0)
            {
                await res.showPage("", 'Admin account already set');                
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

            if (typeof req.body.password == 'string' && req.body.password.trim().length > 0)
            {
                await userauth.createUser(seq, "admin", req.body.password.trim());
            }
            await res.showPage("", 'Admin password set');
        }
    );
}
