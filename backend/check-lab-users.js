import db from './models/index.js';

async function checkLabTechnicianUsers() {
  try {
    console.log('Checking Lab Technician users...');
    
    const labTechs = await db.User.findAll({
      where: { role: 'Lab Technician' },
      attributes: ['id', 'username', 'email', 'role', 'firstName', 'lastName', 'isActive'],
    });
    
    console.log(`Found ${labTechs.length} Lab Technician users:`);
    labTechs.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - Active: ${user.isActive}`);
    });

    if (labTechs.length === 0) {
      console.log('\n❌ No Lab Technician users found!');
      console.log('Creating a test Lab Technician user...');
      
      const newLabTech = await db.User.create({
        username: 'labtech',
        email: 'labtech@example.com',
        password: 'password123',
        role: 'Lab Technician',
        firstName: 'Lab',
        lastName: 'Technician',
        phoneNumber: '+251911000001',
        isActive: true,
      });
      
      console.log(`✅ Created Lab Technician: ${newLabTech.firstName} ${newLabTech.lastName}`);
      console.log('Login with: labtech@example.com / password123');
    }

    console.log('\n✅ Lab Technician user check completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkLabTechnicianUsers();
