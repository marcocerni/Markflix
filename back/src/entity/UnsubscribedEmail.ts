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
export class UnsubscribedEmail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 128})
    email: string;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    constructor(email) {
        this.email = email
    }

}
