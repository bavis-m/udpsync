function showPage(url, toast = null) { return async (req, res) => await res.showPage(url, toast); }

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

        res.addMsg = toast =>
        {
            if (req.session)
            {
                if (!req.session.last_state) req.session.last_state = {};
                if (!Array.isArray(req.session.last_state.toasts)) req.session.last_state.toasts = [];
                req.session.last_state.toasts.push(toast);
            }
        };

        res.showPage = async (url, toast = null) =>
        {
            if (toast) res.addMsg(toast);
            await res.redirectWithSession(303, '/' + url);
            res.end();
        };

        next();
    };
}

module.exports = { showPage, accelRedirect, getHelpersMiddleware };
