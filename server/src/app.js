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
const { graphqlLoginFailure, getGraphQLHelperMiddleware } = require('utils/utils-graphql');

const { makeExecutableSchema } = require('@graphql-tools/schema');
const { default: GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json');

const { createHandler } = require('graphql-http/lib/use/express');

const { graphql } = require('graphql');

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
        express.json(),

        // load the user's session and the showPage helper()
        sessionMiddleware(app),
        utils.getHelpersMiddleware(),
    );

    r.use(getGraphQLHelperMiddleware());

    const graphqlObjects = [{
        graphql_schema: `
            scalar JSON
            scalar JSONObject

            type Query {
                authed_user: String
            }
        `,
        graphql_resolvers: { JSON:GraphQLJSON, JSONObject:GraphQLJSONObject, Query:{ authed_user: (p, args, ctx) => ctx.session.authed_user ? ctx.session.authed_user.name : null } }
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

    app.ctx.schema = makeExecutableSchema({ typeDefs:graphqlObjects.map(s => s.graphql_schema), resolvers });
    

    r.use('/graphql',
        userauth.express.mustBeLoggedIn(true, graphqlLoginFailure),
        createHandler({ schema:app.ctx.schema, context: (req, params) => ({ ...app.ctx, session:req.raw.session }) })
    );

    r.use("/graphiql.html",
        userauth.express.mustBeLoggedIn(true)
    );

    // page rendering
    r.get(/^\/([^/]+).html$/,
        async (req, res) =>
        {
            const view = req.params[0];

            const settings = req.app.ctx.settings;

            res.initial_data.toasts = req.last_state && Array.isArray(req.last_state.toasts) ? req.last_state.toasts : [];

            await res.addGraphQL("{authed_user}");

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
