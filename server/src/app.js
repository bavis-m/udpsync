const express = require('express');
const utils = require('utils/utils-express.js');
const nocache = require('nocache');

const sessionMiddleware = require('session.js');
const setupSync = require('sync/sync.js');

const setupAdminRoutes = require('users/admin.js');
const setupLoginRoutes = require('users/login.js');
const setupAccountRoutes = require('users/account.js');

const userauth = require('users/userauth.js');
const { apiLoginFailure } = require('sync/api/api.js');

const { makeExecutableSchema } = require('@graphql-tools/schema');
const { default: GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json');

const { createHandler } = require('graphql-http/lib/use/express');

const { schemaAndResolvers: userSchemaAndResolvers } = require('users/models.js');


module.exports = async function(app, r)
{
    if (r === undefined) r = app;

    r.use(
        // public static files/bundled files served straight away
        express.static('/app/client/public'),
        express.static('/app/client/dist/public'),

        // nothing else is cached
        nocache(),

        // url encoded data ni requests
        express.urlencoded({extended:true}),

        // load the user's session and the showPage helper()
        sessionMiddleware(app),
        utils.getHelpersMiddleware(),
    );

    const schemasAndResolvers = [{schema:`
scalar JSON
scalar JSONObject

type Query {
    test: String!
}
    `,
        resolvers: {Query:{test:() => "blah"}}
    },
    userSchemaAndResolvers
];
    const addGraphQL = s => schemasAndResolvers.push(s);

    // may pass info to frontend, so do that here
    await setupSync(app, r, addGraphQL);

    // get body
    r.use(
        express.urlencoded({extended:true}),
    );

    // make sure admin is first, so we always verify the admin user
    setupAdminRoutes(app, r, addGraphQL);
    setupLoginRoutes(app, r, addGraphQL);
    setupAccountRoutes(app, r, addGraphQL);

    const resolvers = { JSON:GraphQLJSON, JSONObject:GraphQLJSONObject };
    Object.assign(resolvers, ...schemasAndResolvers.map(sr => sr.resolvers || {}));

    const schema = makeExecutableSchema({ typeDefs:schemasAndResolvers.map(s => s.schema), resolvers });

    r.use('/graphql',
        userauth.express.mustBeLoggedIn(true, apiLoginFailure),
        createHandler({ schema, context: (req, params) => ({ ...app.ctx, session:req.raw.session }) })
    );

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

    r.use(
        // just in case
        (_, res) => res.status(404).end() 
    );

    return r;
};
