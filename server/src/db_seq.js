const { Sequelize, DataTypes } = require('sequelize');

async function init(settings)
{
    const sequelize = new Sequelize(
        settings.db.database,
        settings.db.user,
        settings.db.password,
        { logging: false, logQueryParameters: false, host: settings.db.host, dialect: 'mysql', port: settings.db.port }
    );

    sequelize.authenticate();

    return sequelize;
}

async function loadModels(sequelize, getModels)
{
    let models = getModels(sequelize, DataTypes);
    if (!Array.isArray(models)) models = [models];

    for (const model of models)
    {
        if (typeof model.associate == 'function') model.associate(sequelize.models);    
        await model.sync({ alter:true });
    }

    return models;
}

module.exports = { init, loadModels };