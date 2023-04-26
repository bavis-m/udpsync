module.exports = function(sequelize, DataTypes)
{
    const SyncDir = sequelize.define("SyncDir", {
        id: { type:DataTypes.INTEGER, primaryKey:true, autoIncrement: true },
        local_path: { type:DataTypes.STRING, unique:true },
        remote_path: { type:DataTypes.STRING },
        remote_host: { type:DataTypes.STRING },
        remote_user: { type:DataTypes.STRING },
        //properties: { type:DataTypes.JSON, get() { return JSON.parse(this.getDataValue("properties")); }, set(v) { this.setDataValue("properties", JSON.stringify(v)); } },
    }, { sequelize });
    SyncDir.api_name = "sync_dir";
    return SyncDir;
};
