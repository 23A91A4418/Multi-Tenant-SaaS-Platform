const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    console.log('Running migrations...');

    const migrationsDir = path.join(__dirname, '../../migrations');

    if (!fs.existsSync(migrationsDir)) {
      throw new Error('migrations folder not found');
    }

    // Read all .sql files and sort them
    const files = fs
      .readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      throw new Error('No migration files found');
    }

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      console.log(`Running ${file}...`);

      const sql = fs.readFileSync(filePath, 'utf8');
      await pool.query(sql);
    }

    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
})();
