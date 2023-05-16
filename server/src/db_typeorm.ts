import * as path from "node:path"
import { DataSource } from "typeorm"

export default async function initTypeORM(settings)
{
    const dataSource = new DataSource({
        type: "mysql",
        host: settings.db.host,
        port: settings.db.port,
        username: settings.db.user,
        password: settings.db.password,
        database: settings.db.database,
        entities: [path.resolve(__dirname, './**/models_typeorm.js')],
        synchronize: true
    });

    console.log("Waiting...");
    await dataSource.initialize();
    console.log("Initialized");

    return dataSource;
}