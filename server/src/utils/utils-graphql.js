const { graphql } = require('graphql');

function getResolvers(...names)
{
    names = names.reduce((a, n) => a.concat(Array.isArray(n) ? n : [n]), []);
    return names.reduce((r, n) => ({ ...r, [n]: v => v[n]}), {});
}

function getResolversMap(f, ...names)
{
    names = names.reduce((a, n) => a.concat(Array.isArray(n) ? n : [n]), []);
    return names.reduce((r, n) => ({ ...r, [n]: v => f(v)[n]}), {});
}

function graphqlLoginFailure(req, res, next)
{
    res.status(401).json({errors:[{message:"No authentication"}]});
}

function getGraphQLHelperMiddleware()
{
    return (req, res, next) =>
    {
        res.addGraphQL = async (source, props) =>
        {
            const result = await graphql({ schema:req.app.ctx.schema, source, contextValue: { ...req.app.ctx, session:req.session }, ...props });
            if (result.errors && result.errors.length > 0)
            {
                throw `Error in "${s}":\n${result.errors.map(e => e.toJSON()).join("\n")}`;
            }
            Object.assign(res.initial_data, result.data);
        };
        next();
    };
}

module.exports = { getResolvers, getResolversMap, graphqlLoginFailure, getGraphQLHelperMiddleware };