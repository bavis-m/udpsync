const _ = require('lodash');
const { graphql } = require('graphql');
const { createHandler } = require('graphql-http/lib/use/express');
const { default:GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json');
const { makeExecutableSchema } = require('@graphql-tools/schema');

module.exports = class GraphQLBuilder
{
    schemas = [`
        scalar JSON
        scalar JSONObject
    `];

    resolvers = { JSON:GraphQLJSON, JSONObject:GraphQLJSONObject };

    schema = null;
    
    addSchemas(...all)
    {
        for (var schemas of all)
        {
            if (!Array.isArray(schemas)) schemas = [schemas];
            this.schemas = this.schemas.concat(schemas);
        }
    }

    addResolvers(...all)
    {        
        for (var resolvers of all)
        {
            this.resolvers = _.merge(this.resolvers, resolvers);
        }
    };

    build()
    {
        this.schema = makeExecutableSchema({ typeDefs:this.schemas, resolvers:this.resolvers });
    }

    getMiddleware()
    {
        return (req, res, next) =>
        {
            res.addGraphQL = async (source, props) =>
            {
                const result = await graphql({ schema:this.schema, source, contextValue: { ...req.app.ctx, session:req.session }, ...props });
                if (result.errors && result.errors.length > 0)
                {
                    throw `Error in "${s}":\n${result.errors.map(e => e.toJSON()).join("\n")}`;
                }
                Object.assign(res.initial_data, result.data);
            };
            next();
        };
    }

    getGraphqlRouteHandler()
    {
        return createHandler({ schema:this.schema, context: (req, params) => ({ ...req.raw.app.ctx, session:req.raw.session }) })
    }
}