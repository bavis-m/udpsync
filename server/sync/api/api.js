function createAPIRoutes(r, model)
{
    const name = model.api_name || model.name;
    if (model.api_all || model.api_all === undefined)
    {
        r.get(`/${name}/all`, async (_, res) =>
        {
            const all = await model.findAll();
            res.json(all.map(d => d.toJSON()));
        });
    }
}

module.exports = createAPIRoutes;