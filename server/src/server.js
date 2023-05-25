require('reflect-metadata');
require('app-module-path').addPath(__dirname);

const express = require('express');
const mustache = require('mustache-express');

const sequelize = require('db.js');

const GraphQLBuilder = require('graphql-builder.js');

const { setupData:setupAppData, setup:setupApp } = require('app.js');

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
        graphql: new GraphQLBuilder(),
        settings
    };

    app.set('trust proxy', true);
    app.engine('mustache', mustache());
    app.set('view engine', 'mustache');
    app.set('views', '/app/client/dist/views');
    app.set('etag', false);

    app.use(
        // public static files/bundled files served straight away
        express.static('/app/client/public'),
        express.static('/app/client/dist/public'),

        express.urlencoded({extended:true}),
        express.json()
    );

    // app specific setup
    setupAppData(app.ctx.sequelize, app.ctx.graphql);

    await app.ctx.sequelize.sync({ alter:true });
    app.ctx.graphql.build();

    setupApp(app);
    // end app specific setup

    app.use(
        // just in case
        (_, res) => res.status(404).end() 
    );
    

    app.listen(settings.port, () => {
      console.log(`Frontend listening at http://localhost:${settings.port}`)
    });
})();