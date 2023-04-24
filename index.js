const express = require('express');
const mustache = require('mustache-express');

const url = require('url');

const sequelize = require('./db.js');

const setMainAppRoutes = require('./app.js');

let utils = require('./utils.js');

let settings = {
    port: 8091,
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'udpshare',
        password: process.env.DB_PWD || '',
        database: process.env.DB_DB || 'udpshare',
    },
    session: {
        name: process.env.SESS_SID || 'udpshare.sid',
        secret: process.env.SESS_SEC || 'udpsharelogincookiesecret',
        age: 1 * 60 * 60,   // one hour
    },
    title: 'udpshare frontend',
    mount: 'admin',
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
    app.set('views', 'views');

    setMainAppRoutes(app);

    app.listen(settings.port, () => {
      console.log(`Frontend listening at http://localhost:${settings.port}`)
    });
})();

