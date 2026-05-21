import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { DatabaseConfig } from '../database.config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const databaseFactory = (entities: any[]): TypeOrmModuleAsyncOptions => ({
  inject: [ConfigService],
  useFactory: (config: ConfigService): TypeOrmModuleOptions => {
    const db = config.get<DatabaseConfig>('database')!;
    return {
      type: 'postgres',
      host: db.host,
      port: db.port,
      username: db.username,
      password: db.password,
      database: db.database,
      entities,
      synchronize: false,
      migrationsRun: false,
    };
  },
});
