import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IStorage } from "../interface/storage.interface";

@Entity()
export class StorageEntity implements IStorage{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    original_name: string

    @Column()
    size: number

    @Column()
    width: number

    @Column()
    height: number

    @Column()
    destination: string

    @Column()
    reserv_destination: string

    @Column()
    original_file: boolean
}