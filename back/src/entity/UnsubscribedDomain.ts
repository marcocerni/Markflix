import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import {Length, IsNotEmpty} from "class-validator";
import * as bcrypt from "bcryptjs";

@Entity()
export class UnsubscribedDomain {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 128})
    domain: string;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    constructor(domain) {
        this.domain = domain
    }

}
