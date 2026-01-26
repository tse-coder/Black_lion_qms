import db from './models/index.js';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
    const adminEmail = 'admin.blacklion@gmail.com';
    const adminPassword = 'blacklionadmin';

    try {
        console.log('--- Admin Seeding Started ---');

        // Check if admin already exists
        const existingAdmin = await db.User.findOne({
            where: { email: adminEmail }
        });

        if (existingAdmin) {
            console.log(`Admin user with email ${adminEmail} already exists.`);
            // Update role just in case
            await existingAdmin.update({ role: 'Admin' });
            console.log('Verified role as Admin.');
        } else {
            // Create admin user
            // Note: User model has a beforeCreate hook to hash the password, 
            // but if you want to be safe or if the hook handles it differently, 
            // check User.js. In this codebase, beforeCreate hashes it.
            await db.User.create({
                username: 'admin_primary',
                email: adminEmail,
                password: adminPassword,
                role: 'Admin',
                firstName: 'Master',
                lastName: 'Admin',
                phoneNumber: '+251911000000', // Placeholder valid Ethiopian number
                isActive: true,
            });
            console.log(`Successfully created Admin: ${adminEmail}`);
        }

        console.log('--- Admin Seeding Completed ---');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
