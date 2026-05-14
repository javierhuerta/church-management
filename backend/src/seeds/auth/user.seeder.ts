import { DataSource } from 'typeorm';
import { User } from '../../modules/auth/entities/user.entity';
import { UserRole } from '../../modules/common/entities/user-role.enum';
import { Seeder } from '../seeder';

export class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(User);

    const users = [
      {
        email: 'pastor@iglesia.cl',
        password: await bcrypt.hash('password123', 10),
        name: 'Roberto Hernández',
        role: UserRole.Pastor,
      },
      {
        email: 'anciano@iglesia.cl',
        password: await bcrypt.hash('password123', 10),
        name: 'Carlos Muñoz',
        role: UserRole.Anciano,
      },
      {
        email: 'secretaria@iglesia.cl',
        password: await bcrypt.hash('password123', 10),
        name: 'María López',
        role: UserRole.Secretaria,
      },
    ];

    for (const userData of users) {
      const existing = await repo.findOne({ where: { email: userData.email } });
      if (!existing) {
        const user = repo.create(userData);
        await repo.save(user);
        console.log(`Created user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }
  }
}

import * as bcrypt from 'bcrypt';