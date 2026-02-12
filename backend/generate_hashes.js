const bcrypt = require('bcryptjs');

async function generate() {
    console.log('Generating hashes...');
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const demoHash = await bcrypt.hash('Demo@123', 10);
    const userHash = await bcrypt.hash('User@123', 10);

    console.log(`Admin@123: ${adminHash}`);
    console.log(`Demo@123: ${demoHash}`);
    console.log(`User@123: ${userHash}`);
}

generate();
