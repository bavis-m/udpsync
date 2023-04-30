require('app-module-path').addPath(__dirname);

const express = require('express');
const mustache = require('mustache-express');

const { init: sequelize } = require('./db.js');

const setMainAppRoutes = require('./app.js');

let utils = require('utils/utils.js');


let settings = {
    port: 80,
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'udpsync',
        password: process.env.DB_PWD || '',
        database: process.env.DB_DB || 'udpsync',
    },
    session: {
        name: process.env.SESS_SID || 'udpsync.sid',
        secret: process.env.SESS_SEC || 'udpsync',
        age: 1 * 60 * 60,   // one hour
    },
    title: 'udpsync frontend'
};

// main function
(async function() {
    const mergeSettings = (a, b) => utils.mergeWithSubkeys(a, b, {db:true, session:true});
    try
    {
        settings = mergeSettings(settings, require('/conf/settings.json'));
    } catch {}

    const app = express();

    app.ctx = {
        sequelize: await sequelize(settings),
        settings
    };

    app.set('trust proxy', true);
    app.engine('mustache', mustache());
    app.set('view engine', 'mustache');
    app.set('views', 'client/dist/views');
    app.set('etag', false);

    await setMainAppRoutes(app);
    

    app.listen(settings.port, () => {
      console.log(`Frontend listening at http://localhost:${settings.port}`)
    });
})();