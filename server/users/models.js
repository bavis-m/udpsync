module.exports = function(sequelize, DataTypes)
{
    const User = sequelize.define("User", {
        name: { type:DataTypes.STRING, primaryKey:true },
        password: DataTypes.STRING,
        uri: DataTypes.STRING,
        uriRpc: DataTypes.STRING,
        properties: { type:DataTypes.JSON, get() { return JSON.parse(this.getDataValue("properties")); }, set(v) { this.setDataValue("properties", JSON.stringify(v)); } },
    }, { sequelize });
    return User;
};
