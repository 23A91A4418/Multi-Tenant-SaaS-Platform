const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    console.log('Running seeds...');

    const seedFile = path.join(__dirname, '../../seeds/seed_data.sql');

    if (!fs.existsSync(seedFile)) {
      throw new Error('seed_data.sql not found');
    }

    const sql = fs.readFileSync(seedFile, 'utf8');
    await pool.query(sql);

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
})();
