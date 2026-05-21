import { DataSource } from 'typeorm';
import { User } from './modules/auth/entities/user.entity';
import { Department } from './modules/departments/entities/department.entity';

const ds = new DataSource({
  type: 'better-sqlite3',
  database: ':memory:',
  synchronize: true,
  entities: [User, Department],
  logging: false,
} as any);

ds.initialize()
  .then(() => {
    console.log('ok - entities loaded in SQLite');
    return ds.destroy();
  })
  .catch((e: Error) => console.error('ERR:', e.message));
