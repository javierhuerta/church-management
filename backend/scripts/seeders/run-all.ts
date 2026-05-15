import 'reflect-metadata';
import { runAllSeeders } from '../../src/seeds';

runAllSeeders()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error running seeders:', error);
    process.exit(1);
  });
