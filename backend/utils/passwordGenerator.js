/**
 * Generate a secure random password with format: vfstr + 3 random characters
 * @param {number} length - Length of password (default: 8, but will always be 8 for vfstr format)
 * @returns {string} - Generated password (format: vfstrXXX where XXX are random)
 */
function generatePassword(length = 8) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';

    const allChars = uppercase + lowercase + numbers;

    // Start with 'vfstr' prefix (5 characters)
    let password = 'vfstr';

    // Add 3 random characters to make it 8 characters total
    for (let i = 0; i < 3; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password;
}

module.exports = { generatePassword };
