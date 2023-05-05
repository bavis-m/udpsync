function createAPIRoutes(r, models)
{
    if (!Array.isArray(models)) models = [models];

    for (const model of models)
    {
        const name = model.api_name || model.name;
        if (model.api_all || model.api_all === undefined)
        {
            r.get(`/${name}/all`, async (_, res) =>
            {
                const all = await model.findAll();
                res.json({[model.api_plural || (name + "s")]:all.map(d => d.toJSON())});
            });
        }
    }
}

function apiLoginFailure(req, res, next)
{
    res.json({error:"Must be logged in"});
    res.end();
}

module.exports = { createAPIRoutes, apiLoginFailure };