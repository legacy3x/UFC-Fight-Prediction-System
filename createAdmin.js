import { createAdminUser } from './src/utils/createAdminUser.js';

async function main() {
  console.log('Creating admin user with email: info@legacy3x.com');
  await createAdminUser();
  console.log('Admin creation process completed');
}

main().catch(console.error);
