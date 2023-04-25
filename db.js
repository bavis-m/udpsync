const { Sequelize, DataTypes } = require('sequelize');

const modelFiles = [ './models/user.js' ];

async function initDb(settings)
{
    const sequelize = new Sequelize(
        settings.db.database,
        settings.db.user,
        settings.db.password,
        { logging: false, logQueryParameters: false, host: settings.db.host, dialect: 'mysql', port: settings.db.port }
    );

    modelFiles.forEach(f => require(f)(sequelize, DataTypes));

    for (const name in sequelize.models)
    {
        const model = sequelize.models[name];
        if (typeof model.associate == 'function') model.associate(sequelize.models);
    }

    sequelize.authenticate();
    await sequelize.sync({ alter:true });

    return sequelize;
}

module.exports = initDb;
