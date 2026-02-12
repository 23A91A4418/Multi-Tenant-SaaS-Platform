const bcrypt = require('bcryptjs');

const superAdminHash = '$2b$10$6dKq0zM0Y9Yy6JX1d8kE5eQ8ZJ5r8nF9pZ8MZrYQm0VqZ0n5xqY3W';
const tenantAdminHash = '$2b$10$K1V8b6rM0kMZJ5kzYH9FQOZp0T2W5H7J1JZJw2LJ8FZ1M9Y1J0OaW';

const superAdminPass = 'Admin@123';
const tenantAdminPass = 'Demo@123';

async function test() {
    console.log('Testing Super Admin...');
    const match1 = await bcrypt.compare(superAdminPass, superAdminHash);
    console.log(`Super Admin (Admin@123) Match: ${match1}`);

    console.log('Testing Tenant Admin...');
    const match2 = await bcrypt.compare(tenantAdminPass, tenantAdminHash);
    console.log(`Tenant Admin (Demo@123) Match: ${match2}`);

    // Generate new hash to see what it looks like
    const newHash = await bcrypt.hash(superAdminPass, 10);
    console.log(`New Hash for Admin@123: ${newHash}`);
}

test();
