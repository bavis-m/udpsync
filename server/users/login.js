const userauth = require('./userauth.js');

module.exports = function(app, r)
{
    if (r === undefined) r = app;

    // verify login state
    r.use(["/login.html", "/do_login"],
        userauth.express.mustBeLoggedOut()
    );

    r.use('/do_logout',
        userauth.express.mustBeLoggedIn(false)
    );

    // handle login
    r.post('/do_login',
        async (req, res) =>
        {
            const user = await userauth.getAuthorisedUser(req.app, req.body.user, req.body.password);
            if (user)
            {
                req.session.authed_user = user.toJSON();
                await res.showPage("account.html", 'Logged in');
            }
            else
            {
                await res.showPage("login.html", 'Login failed');
            }
        }
    );

    // logout
    r.post('/do_logout',
        async (req, res) =>
        {
            const name = req.session.authed_user.name;
            delete req.session.authed_user;
            delete req.session.auth;
            await res.showPage("login.html", `Logged out from user <b>${name}</b>`);
        }
    );
};
