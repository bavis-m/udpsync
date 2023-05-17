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

module.exports = { getResolvers, getResolversMap, graphqlLoginFailure };