function createAPIRoutes(r, names, get, getAll)
{
    let name = null, plural = null;
    if (names.name)
    {
        name = names.name;
        if (names.plural) plural = names.plural;
    }
    if (!name) name = String(names);
    name = name.trim();
    if (name.length == 0) return;

    if (plural) plural = plural.trim();
    if (!plural || plural.length == 0) plural = name + "s";

    if (getAll)
    {
        r.get(`/${name}/all`, async (_, res) =>
        {
            const all = await getAll();
            res.json({[plural]:Array.from(all).map(d => d.toJSON())});
        });
    }
    
    if (get)
    {
        r.get(`/${name}/:id`, async (req, res) =>
        {
            const v = await get(req.params.id);
            if (v)
            {
                res.json({[name]:v.toJSON()});
            }
            else
            {
                res.status(404).end();
            }
            
        });
    }
}

function apiLoginFailure(req, res, next)
{
    res.json({errors:[{message:"No authentication"}]});
    res.end();
}

module.exports = { createAPIRoutes, apiLoginFailure };