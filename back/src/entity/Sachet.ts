import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import {Length} from "class-validator";

@Entity()
export class Sachet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'text'})
    logo: string;

    @Column()
    opacity: number;

    @Column({nullable: true, length: 256})
    backBackground: string | null;

    @Column({nullable: true, length: 7})
    backBackgroundColor: string | null;

    @Column({nullable: true})
    backBackgroundOpacity: number;

    @Column({nullable: true, length: 7})
    backColor: string;

    @Column({nullable: true, length: 256})
    frontBackground: string | null;

    @Column({nullable: true, length: 7})
    frontBackgroundColor: string | null;

    @Column({nullable: true})
    frontBackgroundOpacity: number;

    @Column({nullable: true, length: 7})
    frontColor: string;

    @Column({length: 128})
    email: string;

    @Column({nullable: true, length: 512})
    comment: string | null;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

}
