const express = require('express');
const { loadModel } = require('./../db.js');
const createAPIRoutes = require('./../api/api.js');

async function init(app)
{
    const seq = app.ctx.sequelize;
    const settings = app.ctx.settings;

    const r = express.Router();

    // get body
    r.use(
        express.urlencoded({extended:true}),
    );

    createAPIRoutes(r, await loadModel(seq, './sync/models/sync_dir.js'));

    app.use("/api/", r);
}

module.exports = init;