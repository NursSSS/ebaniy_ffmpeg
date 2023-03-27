import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkerService } from 'src/worker/worker.service';
import { Repository } from 'typeorm';
import { StorageEntity } from './entity/storage.entity';
import { CreateMetadataDto } from './dto';
import * as fs from 'fs'
import * as path from 'path';
import * as Docker from 'dockerode'


@Injectable()
export class StorageService {
    constructor(
        @InjectRepository(StorageEntity)
        private StorageRepo: Repository<StorageEntity>,
        private WorkerService: WorkerService
    ) { }

    async upload(file: Express.Multer.File) {
        const resolution = await this.WorkerService.videoResolutions(file)
        const data = ['data_1', 'data_2', 'data_3', 'data_4']
        const storages = await this.getVolumeSize(data)
        const original_name = file.originalname
        const links = []
        const fullPath = path.join(__dirname, '..', '..', 'data')

        for (let i = 0; i < resolution.body.length; i++) {
            const k = 0
            const newPathDir = path.join(fullPath, storages[k].volume)
            const newPathDir2 = path.join(fullPath, storages[k + 1].volume)
            const oldpath = resolution.body[i].path
            const newpath = path.join(newPathDir, resolution.body[i].fileName)
            const newpath2 = path.join(newPathDir2, resolution.body[i].fileName)
            const size = resolution.body[i].size
            const width = resolution.body[i].width
            const height = resolution.body[i].height
            const name = resolution.body[i].name
            const readStream = fs.createReadStream(oldpath);
            const writeStream = fs.createWriteStream(newpath);
            const writeStream2 = fs.createWriteStream(newpath2);

            readStream.pipe(writeStream);
            readStream.pipe(writeStream2);

            const dto = {
                name: name,
                original_name: original_name,
                size: size,
                destination: newpath,
                width: width,
                height: height,
                reserv_destination: path.join(fullPath, storages[k + 1].volume, resolution.body[i].fileName),
                original_file: resolution.body[i].original_file
            }
            links.push(oldpath)

            await this.createMetadata(dto)

        }

        console.log(links)
        // try(){
            await this.WorkerService.deleteFile(links)
        // }    
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

    async getVolumeSize(dto: string[]) {
        var docker = new Docker({ socketPath: '/var/run/docker.sock' });

        const volumes = dto

        const output = []
        const df = await docker.df()
        const dVolumes = df.Volumes

        for (let i = 0; i < volumes.length; i++) {
            const data = volumes[i]
            const volume = dVolumes.find((i) => i.Name == `storage_${data}`)
            output.push({
                volume: data,
                size: volume.UsageData.Size
            })
        }

        output.sort((a, b) => a.size - b.size)
        const result = output.slice(0, 2)
        console.log(result);
        return result
    }

    

    async deleteFile(filePath) {
        for (let i = 0; i < filePath.length; i++) {
            try {
                await fs.promises.unlink(filePath[i]);
                console.log(`File ${filePath[i]} has been deleted.`);
            } catch (error) {
                console.error(`Error deleting file ${filePath[i]}: ${error.message}`);
            }
        }

        return { code: 202 }
    }
}
