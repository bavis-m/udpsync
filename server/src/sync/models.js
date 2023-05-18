module.exports = function(sequelize, DataTypes)
{
    const Host = sequelize.define("Host", {
        id:             { type:DataTypes.INTEGER,   primaryKey:true,    autoIncrement: true },
        user:           { type:DataTypes.STRING,    allowNull:false,    unique:"user_host_identity" },
        host:           { type:DataTypes.STRING,    allowNull:false,    unique:"user_host_identity" },
        identity_file : { type:DataTypes.STRING,    allowNull:false,    unique:"user_host_identity" },
        paused:         { type:DataTypes.BOOLEAN,   allowNull: false }
    }, { sequelize });
    Host.api_name = "host";

    const SyncDir = sequelize.define("SyncDir", {
        id: { type:DataTypes.INTEGER, primaryKey:true, autoIncrement: true },
        local_path: { type:DataTypes.STRING, unique:"local_path", allowNull:false },
        remote_path: { type:DataTypes.STRING, allowNull: false }
    }, { sequelize });
    SyncDir.api_name = "sync_dir";

    Host.hasMany(SyncDir);


    return [ SyncDir, Host ];
};