import { Controller, Post, UploadedFile, UseInterceptors, Get, Body, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { StorageService } from './storage.service';
import * as randomstring from 'randomstring'

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const random = randomstring.generate({
          length: 12,
          charset: 'alphabetic'
        })
        const filename = `${random}.mp4`
        callback(null, filename)
      },
    })
  }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return await this.storageService.upload(file)
  }

  @Get(':name')
  async findOne(@Param('name') name: string){
    return await this.storageService.findOne(name)
  }
}
