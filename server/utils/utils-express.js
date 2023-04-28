function showPage(url, msg = null) { return async (req, res) => await res.showPage(url, msg); }

function accelRedirect(getLocCallback)
{
    return (req, res) =>
    {
        res.append('X-Accel-Redirect', '@authed');
        res.append('X-Real-Location', getLocCallback(req));
        res.end();
    };
}

function getHelpersMiddleware()
{
    return (req, res, next) =>
    {
        res.template_params = {};

        res.addMsg = msg =>
        {
            if (req.session)
            {
                if (!req.session.last_state) req.session.last_state = {};
                if (!Array.isArray(req.session.last_state.msg)) req.session.last_state.msg = [];
                req.session.last_state.msg.push(msg);
            }
        };

        res.showPage = async (url, msg = null) =>
        {
            if (msg) res.addMsg(msg);
            await res.redirectWithSession(303, '/' + url);
            res.end();
        };

        next();
    };
}

module.exports = { showPage, accelRedirect, getHelpersMiddleware };
