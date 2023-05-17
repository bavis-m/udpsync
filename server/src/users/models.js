const { getResolvers } = require("utils/utils-graphql");

function getUserModel(sequelize, DataTypes)
{
    const User = sequelize.define("User", {
        name: { type:DataTypes.STRING, primaryKey:true },
        password: DataTypes.STRING,
        //uri: DataTypes.STRING,
        //uriRpc: DataTypes.STRING,
        properties: { type:DataTypes.JSON, get() { return JSON.parse(this.getDataValue("properties")); }, set(v) { this.setDataValue("properties", JSON.stringify(v)); } },
    }, { sequelize });
    User.graphql_schema = /* graphql */ `
type Query {
    users: [User!]!
    user(name: String): User
}

type User {
    name: String!
    properties: JSONObject
}
    `;
    User.graphql_resolvers = 
    {
        Query: {
            users: async (p, args, ctx) => await ctx.sequelize.models.User.findAll(),
            user: async (p, args, ctx) => await ctx.sequelize.models.User.findOne({where:{name:args.name}})
        },
        User: getResolvers("name", "properties")
    };
    return User;
}

module.exports = getUserModel;