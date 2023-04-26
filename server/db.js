const { Sequelize, DataTypes } = require('sequelize');

const modelFiles = [ './models/user.js' ];

async function init(settings)
{
    const sequelize = new Sequelize(
        settings.db.database,
        settings.db.user,
        settings.db.password,
        { logging: false, logQueryParameters: false, host: settings.db.host, dialect: 'mysql', port: settings.db.port }
    );

    sequelize.authenticate();

    for (modelFile of modelFiles)
    {
        await loadModel(sequelize, modelFile);
    }

    return sequelize;
}

async function loadModel(sequelize, file)
{
    const model = require(file)(sequelize, DataTypes);

    if (typeof model.associate == 'function') model.associate(sequelize.models);
    
    await model.sync({ alter:true });

    return model;
}

module.exports = { init, loadModel };
