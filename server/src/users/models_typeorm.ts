import { Entity, PrimaryColumn, Column, BeforeUpdate, BeforeInsert, AfterLoad } from "typeorm"

console.log("user2");

@Entity()
export class User2
{
    @PrimaryColumn()
    name: string

    @Column()
    password: string

    @Column({name:'properties'})
    propertiesC: string

    properties: object

    @BeforeUpdate()
    @BeforeInsert()
    toDB()
    {
        this.propertiesC = JSON.stringify(this.properties);
    }

    @AfterLoad()
    fromDB()
    {
        this.properties = JSON.parse(this.propertiesC);
    }
};
