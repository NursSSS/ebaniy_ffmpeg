import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkerService } from 'src/worker/worker.service';
import { Repository } from 'typeorm';
import { StorageEntity } from './entity/storage.entity';
import { CreateMetadataDto } from './dto';
import * as fs from 'fs'
import * as path from 'path';


@Injectable()
export class StorageService {
    constructor(
        @InjectRepository(StorageEntity)
        private StorageRepo: Repository<StorageEntity>,
        private WorkerService: WorkerService
    ) { }

    async upload(file: Express.Multer.File) {
        const resolution = await this.WorkerService.videoResolutions(file)
        const storages = [process.env.DATA_1, process.env.DATA_2]
        const original_name = file.originalname
        const links = []

        for (let k = 0; k < storages.length; k++) {
            let newPathDir = storages[k]
            for (let i = 0; i < resolution.body.length; i++) {
                const oldpath = resolution.body[i].path
                const newpath = path.join(newPathDir, resolution.body[i].fileName)
                const size = resolution.body[i].size
                const width = resolution.body[i].width
                const height = resolution.body[i].height
                const name = resolution.body[i].name
                const readStream = fs.createReadStream(oldpath);
                const writeStream = fs.createWriteStream(newpath);

                readStream.pipe(writeStream);
                if (links.length < resolution.body.length) {
                    const dto = {
                        name: name,
                        original_name: original_name,
                        size: size,
                        destination: newpath,
                        width: width,
                        height: height,
                        reserv_destination: storages[k + 1] + resolution.body[i].fileName,
                        original_file: resolution.body[i].original_file
                    }
                    links.push(oldpath)

                    await this.createMetadata(dto)
                }
            }
        }
        await this.WorkerService.deleteFile(links)
        return { code: 201 }
    }

    async createMetadata(dto: CreateMetadataDto) {
        return await this.StorageRepo.save(dto)
    }

    async findOne(name: string) {
        const file = await this.StorageRepo.findBy({
                name: name
        })

        if (file.length === 0) {
            throw new NotFoundException('Video is not found')
        }

        return file
    }

}
