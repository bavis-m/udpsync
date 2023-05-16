import "reflect-metadata"

import * as utils from './../server/utils/utils.js';
import { DataSource } from "typeorm"

//test
let settings = {
    port: 80,
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER || 'udpsync',
        password: process.env.DB_PWD || '',
        database: process.env.DB_DB || 'udpsync',
    }
};

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User2 {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    isActive: boolean
}

// main function
(async function() {
    const mergeSettings = (a, b) => utils.mergeWithSubkeys(a, b, {db:true, session:true});
    try
    {
        settings = mergeSettings(settings, require('/conf/settings.json'));
    } catch {}

    const dataSource = new DataSource({
        type: "mysql",
        host: settings.db.host,
        port: settings.db.port,
        username: settings.db.user,
        password: settings.db.password,
        database: settings.db.database,
        entities: ['./**'],
        synchronize: true
    });

    console.log("Waiting...");
    await dataSource.initialize();
    console.log("Initialized");
})();