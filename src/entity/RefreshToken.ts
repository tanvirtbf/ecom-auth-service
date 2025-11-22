import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity() // typeOrm database ke bole eta ekta table hobe
export class RefreshToken {
    // table name hobe refresh_token
    @PrimaryGeneratedColumn() // Auto increment primary key
    id: number;

    @Column({ type: "timestamp" }) // database e typestamp column
    expiresAt: Date; // kokhon token expire hobe seta

    @ManyToOne(() => User) // Many refresh token belongs to 1 user
    user: User; // User table er primary key id seta auto detect kore ekhane niye ashbe and typeorm intelligently user: User ke userId: 1 kore felbe .
    // userId

    @UpdateDateColumn()
    updatedAt: number;

    @CreateDateColumn()
    createdAt: number;
}
