const { getHelpersMiddleware } = require('utils/utils-express.js');
const nocache = require('nocache');
const sessionMiddleware = require('session.js');

const { setup:setupUserauth, setupData:setupUserauthData, mustBeLoggedIn } = require('userauth.js');
const { setup:setupSync, setupData:setupSyncData } = require('sync/sync.js');

const { graphqlLoginFailure } = require('utils/utils-graphql.js');

function setupData(seq, graphql)
{
    setupUserauthData(seq, graphql);
    setupSyncData(seq, graphql);
}

async function setup(app, r)
{
    if (r === undefined) r = app;

    r.use(
        // nothing in the app is cached
        nocache(),

        // load the user's session and the showPage helper()
        sessionMiddleware(app),
        getHelpersMiddleware(),

        // load graphql helpers
        app.ctx.graphql.getMiddleware()
    );

    await setupUserauth(app, r);
    await setupSync(app, r);

    r.use('/graphql',
        mustBeLoggedIn(true, graphqlLoginFailure),
        app.ctx.graphql.getGraphqlRouteHandler()
    );

    r.use("/graphiql.html",
        mustBeLoggedIn(true)
    );

    // page rendering
    r.get(/^\/([^/]+).html$/,
        async (req, res) =>
        {
            // setup all initial data
            res.initial_data.toasts = req.last_state && Array.isArray(req.last_state.toasts) ? req.last_state.toasts : [];
            await res.addGraphQL("{authed_user}");

            let params = {
                title:req.app.ctx.settings.title,
                ...res.template_params,
                initial_data: JSON.stringify(res.initial_data)
            };

            res.render(req.params[0], params,
                (err, html) =>
                {
                    if (err)
                    {
                        console.log(err);
                        return res.status(404).end();
                    }
                    res.send(html).end();
                });
        }
    );
}

module.exports = { setupData, setup };