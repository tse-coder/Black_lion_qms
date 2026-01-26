import bcrypt from 'bcryptjs';
import db from './models/index.js';

const demoUsers = [
  {
    username: 'admin',
    email: 'admin@blacklion.com',
    password: 'admin123',
    role: 'Admin',
    firstName: 'Admin',
    lastName: 'User',
    phoneNumber: '+251911000001',
    isActive: true,
  },
  {
    username: 'doctor_solomon',
    email: 'doctor@blacklion.com',
    password: 'doctor123',
    role: 'Doctor',
    firstName: 'Solomon',
    lastName: 'Tadesse',
    phoneNumber: '+251911000002',
    isActive: true,
  },
  {
    username: 'labtech_almaz',
    email: 'labtech@blacklion.com',
    password: 'labtech123',
    role: 'Lab Technician',
    firstName: 'Almaz',
    lastName: 'Bekele',
    phoneNumber: '+251911000003',
    isActive: true,
  },
  {
    username: 'patient_abebe',
    email: 'patient@blacklion.com',
    password: 'patient123',
    role: 'Patient',
    firstName: 'Abebe',
    lastName: 'Kebede',
    phoneNumber: '+251911000004',
    isActive: true,
  },
];

async function seedUsers() {
  try {
    console.log('Seeding demo users...');
    
    // Create demo users
    for (const userData of demoUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const [user, created] = await db.User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          ...userData,
          password: hashedPassword,
        },
      });
      
      if (created) {
        console.log(`✓ Created ${userData.role}: ${userData.email}`);
      } else {
        console.log(`- User already exists: ${userData.email}`);
      }
    }
    
    console.log('\nDemo users ready!');
    console.log('\nLogin credentials:');
    demoUsers.forEach(user => {
      console.log(`${user.role}: ${user.email} / ${user.password}`);
    });
    
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

seedUsers();
