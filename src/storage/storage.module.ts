import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageEntity } from './entity/storage.entity';
import { WorkerModule } from 'src/worker/worker.module';

@Module({
  imports: [TypeOrmModule.forFeature([StorageEntity]), WorkerModule],
  controllers: [StorageController],
  providers: [StorageService]
})
export class StorageModule {}
