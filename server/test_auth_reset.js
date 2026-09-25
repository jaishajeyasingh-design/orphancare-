process.env.NODE_ENV = 'development';
process.env.JWT_SECRET = 'testsecretkey123';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

let mongoServer;

async function setupDB() {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
}

async function teardownDB() {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
}

// Helper to directly invoke controller handlers
const postRequest = async (route, body, params = {}) => {
    return new Promise((resolve) => {
        const req = { body, params };
        const res = {
            statusCode: 200,
            status(code) { this.statusCode = code; return this; },
            json(data) { resolve({ status: this.statusCode, data }); },
            send(data) { resolve({ status: this.statusCode, data }); }
        };

        if (route === '/api/auth/forgot-password') {
            const { forgotPassword } = require('./src/controllers/authController');
            forgotPassword(req, res);
        } else if (route.startsWith('/api/auth/reset-password/')) {
            const { resetPassword } = require('./src/controllers/authController');
            req.params = { token: route.replace('/api/auth/reset-password/', '') };
            resetPassword(req, res);
        } else if (route === '/api/auth/login') {
            const { loginUser } = require('./src/controllers/authController');
            loginUser(req, res);
        }
    });
};

async function runTests() {
    console.log('--- Starting Authentication & Password Reset Tests ---');
    await setupDB();

    try {
        // 1. Create a test user
        console.log('\n[TEST 1] Creating test user...');
        const testUser = await User.create({
            name: 'Test Admin',
            email: 'testuser@orphancare.org',
            password: 'OldPassword123!',
            role: 'Admin'
        });
        console.log('✓ User created successfully with hashed password.');

        // Verify initial password match
        const initialMatch = await testUser.matchPassword('OldPassword123!');
        if (!initialMatch) throw new Error('Initial password match failed!');
        console.log('✓ Initial password verification passed.');

        // 2. Test Invalid Email Submission on /forgot-password
        console.log('\n[TEST 2] Testing malformed/invalid email format validation...');
        const malformedRes = await postRequest('/api/auth/forgot-password', { email: 'invalidemail' });
        if (malformedRes.status !== 400) throw new Error(`Expected 400 for malformed email, got ${malformedRes.status}`);
        console.log('✓ Malformed email properly rejected with 400 Bad Request.');

        // 3. Test Non-existent Email (Security Check: Generic Response)
        console.log('\n[TEST 3] Testing non-existent email generic response (no account enumeration)...');
        const nonExistentRes = await postRequest('/api/auth/forgot-password', { email: 'nobody@orphancare.org' });
        if (nonExistentRes.status !== 200 || !nonExistentRes.data.message.includes('If an account with that email exists')) {
            throw new Error('Non-existent email failed security generic response requirement!');
        }
        console.log('✓ Non-existent email returns generic success response without revealing user existence.');

        // 4. Test Valid Email Submission
        console.log('\n[TEST 4] Testing valid email submission for password reset link...');
        const validForgotRes = await postRequest('/api/auth/forgot-password', { email: 'testuser@orphancare.org' });
        if (validForgotRes.status !== 200) {
            throw new Error(`Valid email reset request failed! Status: ${validForgotRes.status}, Data: ${JSON.stringify(validForgotRes.data)}`);
        }
        console.log(`✓ Valid email processed. Received message: ${validForgotRes.data.message}`);

        // Check user model in DB
        const updatedUser = await User.findOne({ email: 'testuser@orphancare.org' });
        if (!updatedUser.resetPasswordToken || !updatedUser.resetPasswordExpire) {
            throw new Error('Reset token hash or expiry not saved in DB!');
        }

        // Retrieve token for testing reset (either devResetToken or hash comparison)
        const devToken = validForgotRes.data.devResetToken;
        if (devToken) {
            // Verify raw token is NOT stored in DB
            if (updatedUser.resetPasswordToken === devToken) {
                throw new Error('SECURITY VIOLATION: Raw reset token was stored in database!');
            }
            const expectedHash = crypto.createHash('sha256').update(devToken).digest('hex');
            if (updatedUser.resetPasswordToken !== expectedHash) {
                throw new Error('Reset token hash mismatch in DB!');
            }
            console.log('✓ Security Verified: Reset token is hashed with SHA-256 before DB storage.');
        }

        // 5. Test Invalid Token Rejection
        console.log('\n[TEST 5] Testing invalid token rejection...');
        const invalidTokenRes = await postRequest('/api/auth/reset-password/fakeinvalidtoken123', {
            password: 'NewPassword123!',
            confirmPassword: 'NewPassword123!'
        });
        if (invalidTokenRes.status !== 400) {
            throw new Error(`Expected 400 for invalid token, got ${invalidTokenRes.status}`);
        }
        console.log('✓ Invalid reset token correctly rejected with 400 Bad Request.');

        // If devToken is available (when SMTP is not configured during test), continue flow tests
        if (devToken) {
            // 6. Test Password Mismatch Rejection
            console.log('\n[TEST 6] Testing password mismatch rejection...');
            const mismatchRes = await postRequest(`/api/auth/reset-password/${devToken}`, {
                password: 'NewPassword123!',
                confirmPassword: 'DifferentPassword123!'
            });
            if (mismatchRes.status !== 400 || !mismatchRes.data.message.includes('do not match')) {
                throw new Error('Password mismatch validation failed!');
            }
            console.log('✓ Mismatched password and confirm password correctly rejected.');

            // 7. Test Expired Token Rejection
            console.log('\n[TEST 7] Testing expired token rejection...');
            updatedUser.resetPasswordExpire = Date.now() - 5000;
            await updatedUser.save();

            const expiredRes = await postRequest(`/api/auth/reset-password/${devToken}`, {
                password: 'NewPassword123!',
                confirmPassword: 'NewPassword123!'
            });
            if (expiredRes.status !== 400) {
                throw new Error('Expired token was not rejected!');
            }
            console.log('✓ Expired reset token correctly rejected.');

            // 8. Regenerate Valid Reset Token & Perform Successful Reset
            console.log('\n[TEST 8] Requesting new valid reset token and executing password reset...');
            const newForgotRes = await postRequest('/api/auth/forgot-password', { email: 'testuser@orphancare.org' });
            const validToken = newForgotRes.data.devResetToken;

            const resetRes = await postRequest(`/api/auth/reset-password/${validToken}`, {
                password: 'NewPassword123!',
                confirmPassword: 'NewPassword123!'
            });
            if (resetRes.status !== 200 || !resetRes.data.message.includes('successful')) {
                throw new Error(`Password reset failed: ${JSON.stringify(resetRes.data)}`);
            }
            console.log('✓ Password reset API succeeded.');

            // 9. Verify Post-Reset State in DB
            console.log('\n[TEST 9] Verifying DB state after reset...');
            const postResetUser = await User.findOne({ email: 'testuser@orphancare.org' });
            if (postResetUser.resetPasswordToken || postResetUser.resetPasswordExpire) {
                throw new Error('Reset token was not invalidated/deleted post-reset!');
            }
            console.log('✓ Reset token fields invalidated in database.');

            // 10. Confirm Old Password Fails & New Password Works
            console.log('\n[TEST 10] Testing login credentials with Old vs New password...');
            const oldLoginRes = await postRequest('/api/auth/login', {
                email: 'testuser@orphancare.org',
                password: 'OldPassword123!'
            });
            if (oldLoginRes.status !== 401) {
                throw new Error('Old password still worked after reset!');
            }
            console.log('✓ Old password fails to authenticate.');

            const newLoginRes = await postRequest('/api/auth/login', {
                email: 'testuser@orphancare.org',
                password: 'NewPassword123!'
            });
            if (newLoginRes.status !== 200 || !newLoginRes.data.token) {
                throw new Error('New password failed to authenticate!');
            }
            console.log('✓ New password successfully authenticates user and issues JWT token.');
        }

        // 11. Test Email Configuration Detection
        console.log('\n[TEST 11] Testing SMTP email configuration detection & safe handling...');
        const { isSmtpConfigured, sendPasswordResetEmail } = require('./src/services/emailService');
        const smtpDetected = isSmtpConfigured();
        console.log(`✓ SMTP Configuration status detected safely: ${smtpDetected ? 'CONFIGURED' : 'NOT CONFIGURED'}`);

        const dryRunEmailResult = await sendPasswordResetEmail({
            to: 'testuser@orphancare.org',
            resetUrl: 'http://localhost:5173/reset-password/sampletoken'
        });
        if (!smtpDetected) {
            if (dryRunEmailResult.success) throw new Error('Email service claimed success without SMTP configuration!');
            console.log('✓ Unconfigured SMTP returned safe fallback without crashing server.');
        } else {
            console.log(`✓ Real SMTP delivery executed. Result success: ${dryRunEmailResult.success}`);
        }

        console.log('\n=================================================');
        console.log('ALL AUTHENTICATION & EMAIL RESET TESTS PASSED!');
        console.log('=================================================\n');

    } catch (err) {
        console.error('\n❌ TEST FAILED:', err.message);
        process.exitCode = 1;
    } finally {
        await teardownDB();
    }
}

runTests();
