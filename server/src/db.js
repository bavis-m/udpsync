const { Sequelize } = require('sequelize');

module.exports = async function(settings)
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