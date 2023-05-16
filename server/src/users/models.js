function getUserModel(sequelize, DataTypes)
{
    const User = sequelize.define("User", {
        name: { type:DataTypes.STRING, primaryKey:true },
        password: DataTypes.STRING,
        //uri: DataTypes.STRING,
        //uriRpc: DataTypes.STRING,
        properties: { type:DataTypes.JSON, get() { return JSON.parse(this.getDataValue("properties")); }, set(v) { this.setDataValue("properties", JSON.stringify(v)); } },
    }, { sequelize });
    return User;
}

const schemaAndResolvers = { schema: /* graphql */ `
type Query {
    users: [User!]!
}

type User {
    name: String!
    properties: JSONObject
}
`,
    resolvers: {
        Query: {
            users: () =>
            {
                return [{name:"admin", properties:{data:3}}];
            }
        },
        User: {
            name: u => u.name,
            properties: u => u.properties,
        }
    }
};

module.exports = { getUserModel, schemaAndResolvers };