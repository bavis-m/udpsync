const { spawnSync } = require('child_process');
const userauth = require('./userauth.js');

function getCompleteMissingFiles(root)
{
    const output = spawnSync(
        "find",
        [
            root,
            "-mindepth", "3",
            "-links", "1",
            "-printf", "%P\\0"
        ],
        { encoding: "utf8" }
    ).stdout.trim();

    if (output.length == 0) return [];
    return  output.split('\0').map(f => f.trim()).filter(f => f.length > 0).sort();
}

module.exports = function(app, r)
{
    if (r === undefined) r = app;

    // load information for unlinked items
    r.get("/link.html",
        userauth.express.mustBeLoggedIn(true),
        (req, res, next) =>
        {
            let files = [];
            if (req.session.authed_user.properties?.completed_root)
            {
                files = getCompleteMissingFiles(req.session.authed_user.properties.completed_root);
            }

            res.template_params.possible_complete_links = JSON.stringify(files);
            next();
        }
    );
};
