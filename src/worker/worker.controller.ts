import { Controller, UseInterceptors } from '@nestjs/common';
import { Body, Delete, Get, Param, Post, UploadedFile } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { WorkerService } from './worker.service';

@Controller('worker')
export class WorkerController {
    constructor(
        private WorkerService: WorkerService
    ){}

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
                const filename = file.originalname
                callback(null, filename)
            },
        })
    }))
    async videoResolutions(@UploadedFile() file: Express.Multer.File){
        console.log(file)
        return await this.WorkerService.videoResolutions(file)
    }

    @Delete()
    async delete(@Body() filePath){
        filePath = filePath.filePath
        return await this.WorkerService.deleteFile(filePath)
    }

    @Get()
    async getVideoResolution(@Body() path){
        path = path.path
        return await this.WorkerService.getVideoResolution(path)
    }
}
