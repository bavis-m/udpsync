const express = require('express');
const utils = require('utils/utils-express.js');
const nocache = require('nocache');

const sessionMiddleware = require('session.js');
const setupSync = require('sync/sync.js');

const { loadModels } = require('db_seq.js');
const getUserModel = require('users/models.js');

const setupAdminRoutes = require('users/admin.js');
const setupLoginRoutes = require('users/login.js');
const setupAccountRoutes = require('users/account.js');

const userauth = require('users/userauth.js');
const { graphqlLoginFailure } = require('utils/utils-graphql');

const { makeExecutableSchema } = require('@graphql-tools/schema');
const { default: GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json');

const { createHandler } = require('graphql-http/lib/use/express');

const _ = require('lodash');


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

    const graphqlObjects = [{
        graphql_schema: `
            scalar JSON
            scalar JSONObject
        `,
        graphql_resolvers: { JSON:GraphQLJSON, JSONObject:GraphQLJSONObject }
    }];
    
    const addGraphqlObjects = (...all) =>
    {
        for (var objects of all)
        {
            if (!Array.isArray(objects)) objects = [objects];
            for (var gql of objects)
            {
                if (gql.graphql_schema && gql.graphql_resolvers) graphqlObjects.push(gql);
            }
        }
    };

    addGraphqlObjects(await loadModels(app.ctx.sequelize, getUserModel));

    // may pass info to frontend, so do that here
    await setupSync(app, r, addGraphqlObjects);

    // get body
    r.use(
        express.urlencoded({extended:true}),
    );

    // make sure admin is first, so we always verify the admin user
    setupAdminRoutes(app, r, addGraphqlObjects);
    setupLoginRoutes(app, r, addGraphqlObjects);
    setupAccountRoutes(app, r, addGraphqlObjects);

    const resolvers = graphqlObjects.reduce((r, n) => n.graphql_resolvers ? _.merge(r, n.graphql_resolvers) : r, {});

    const schema = makeExecutableSchema({ typeDefs:graphqlObjects.map(s => s.graphql_schema), resolvers });

    r.use('/graphql',
        userauth.express.mustBeLoggedIn(true, graphqlLoginFailure),
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
