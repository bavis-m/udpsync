const userauth = require('./userauth.js');

module.exports = function(app, r)
{
    // verify login state
    r.use(["/account.html", "/do_set_password"],
        userauth.express.mustBeLoggedIn(true)
    );

    // change password
    r.post('/do_set_password',
        async (req, res) =>
        {
            if (typeof req.body.old_password == 'string' &&

                typeof req.body.new_password == 'string' &&
                req.body.new_password.trim().length > 0 &&

                typeof req.body.new_password2 == 'string' && 
                req.body.new_password.trim() === req.body.new_password2.trim())
            {

                const user = await userauth.getAuthorisedUser(req.app, req.session.authed_user.name, req.body.old_password);
                if (user)
                {
                    await userauth.changePassword(user, req.body.new_password.trim());
                    user.save();
                    res.addMsg("Password changed! Please re-log in.");
                    req.url = "/admin/do_logout";
                    req.app.handle(req, res);
                }
                else
                {
                    res.showPage("account.html", "Invalid request");
                }
            }
        }
    );
};
