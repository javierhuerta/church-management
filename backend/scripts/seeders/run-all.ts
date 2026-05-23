import 'reflect-metadata';
import { runSeeders } from '../../src/seeds';

// process.argv: ['node', 'run-all.js', ...filters]
const filter = process.argv.slice(2);

runSeeders(filter)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error running seeders:', error);
    process.exit(1);
  });
