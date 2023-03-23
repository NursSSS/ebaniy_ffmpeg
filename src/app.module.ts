import { Module } from '@nestjs/common';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from './storage/storage.module';
import { DB_CONFIG } from './utils/db_config';
import { WorkerModule } from './worker/worker.module';

@Module({
  imports: [TypeOrmModule.forRoot(DB_CONFIG), StorageModule, WorkerModule]
})
export class AppModule {}
