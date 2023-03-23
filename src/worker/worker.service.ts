import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg'
import * as fs from 'fs'
import * as path from 'path';
import { ResolutionDto } from './dto/resolution.dto';

@Injectable()
export class WorkerService {
    async videoResolutions(file: Express.Multer.File) {
        const inputFilePath = `./uploads/${file.filename}`;
        const videos = [
            { input: inputFilePath, resolution: '3840x2160', width: 3840, height: 2160, bitrate: '25000k' },
            { input: inputFilePath, resolution: '2560x1440', width: 2560, height: 1440, bitrate: '10000k' },
            { input: inputFilePath, resolution: '1920x1080', width: 1920, height: 1080, bitrate: '5500k' },
            { input: inputFilePath, resolution: '1280x720', width: 1280, height: 720, bitrate: '4000k' },
            { input: inputFilePath, resolution: '854x480', width: 854, height: 480, bitrate: '1000k' },
            { input: inputFilePath, resolution: '640x360', width: 640, height: 360, bitrate: '800k' },
            { input: inputFilePath, resolution: '426x240', width: 426, height: 240, bitrate: '400k' }
        ];
        
        const resolution = await this.getVideoResolution(inputFilePath)
        const resolutions = videos.filter((item) => item.height < Number(resolution.height))
        const outputDir = './output';
        const outputVideosPath = '/output'
        const fullPath = path.join(__dirname, '..', '..')
        const fileName = file.filename.split('').slice(0, -4).join('')
        const outputVideos = [
            {
                name: fileName,
                path: `${file.destination}/${file.filename}`,
                width: Number(resolution.width),
                height: Number(resolution.height),
                fileName: file.filename,
                size: file.size,
                original_file: true
            }
        ];

        const promises = resolutions.map((video) => {
            const outputName = `${fileName}_${video.resolution}_${video.bitrate}.mp4`;
            const outputPath = `${outputDir}/${outputName}`;
            const videoPath = path.join(fullPath, outputVideosPath, outputName)

            return new Promise((resolve, reject) => {
                ffmpeg(video.input)
                    .videoBitrate(video.bitrate)
                    .size(video.resolution)
                    .autopad()
                    .output(outputPath)
                    .on('end', () => {
                        ffmpeg.ffprobe(outputPath, (err, info) => {
                            if (err) {
                                console.error(`Error getting video size of ${outputName}: ${err.message}`);
                                reject(err);
                            }
                            outputVideos.push({
                                name: fileName,
                                path: videoPath,
                                width: video.width,
                                height: video.height,
                                fileName: outputName,
                                size: info.format.size,
                                original_file: false
                            });
                            resolve('')
                            return;
                        });
                        console.log(`Successfully encoded ${outputName}`)
                        resolve('')
                    })
                    .on('error', (err) => {
                        console.error(`Error encoding ${outputName}: ${err.message}`);
                        reject(err);
                    })
                    .run();
            });
        });

        await Promise.all(promises)
        return { status: 201, message: 'ok', body: outputVideos };
    }

    async getVideoResolution(videoPath: string): Promise<ResolutionDto> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) {
                    reject(err);
                    return;
                }
                const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
                const resolution = {
                        width: `${videoStream.width}`,
                        height: `${videoStream.height}`
                    }
                resolve(resolution);
            });
        });
    }

    async deleteFile(filePath: string[]) {
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
