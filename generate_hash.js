// Script to generate bcrypt password hash for Admin@123
import bcrypt from 'bcryptjs';

const password = 'Admin@123';

bcrypt.genSalt(10, (err, salt) => {
    if (err) {
        console.error('Error generating salt:', err);
        return;
    }

    bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return;
        }

        console.log('Password:', password);
        console.log('Bcrypt Hash:', hash);
        console.log('\nUse this hash in your schema.sql for the admin user password_hash field.');
    });
});
