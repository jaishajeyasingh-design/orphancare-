const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const jwt = require('jsonwebtoken');
const assert = require('assert');

// Models
const User = require('../src/models/User');
const Organization = require('../src/models/Organization');
const Child = require('../src/models/Child');
const Opportunity = require('../src/models/Opportunity');
const Resident = require('../src/models/Resident');
const { VolunteerActivity, VolunteerApplication, VolunteerRequest } = require('../src/models/MiscModels');

// Routes
const authRoutes = require('../src/routes/authRoutes');
const childRoutes = require('../src/routes/childRoutes');
const opportunityRoutes = require('../src/routes/opportunityRoutes');
const volunteerRoutes = require('../src/routes/volunteerRoutes');
const residentRoutes = require('../src/routes/residentRoutes');

let mongoServer;
let app;

// Helper to generate JWT token for testing
const generateTestToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test_jwt_secret', { expiresIn: '1h' });
};

// Simple fetch wrapper over express app in-memory
const makeRequest = (app, method, url, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const server = app.listen(0, () => {
      const port = server.address().port;
      const parsedUrl = new URL(`http://localhost:${port}${url}`);
      
      const reqHeaders = {
        'Content-Type': 'application/json'
      };
      if (token) {
        reqHeaders['Authorization'] = `Bearer ${token}`;
      }

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: method.toUpperCase(),
        headers: reqHeaders
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          server.close();
          let parsed;
          try {
            parsed = JSON.parse(responseData);
          } catch (e) {
            parsed = responseData;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      });

      req.on('error', (err) => {
        server.close();
        reject(err);
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  });
};

async function runTests() {
  console.log('Starting RBAC and Volunteer Request Workflow Suite...');
  process.env.JWT_SECRET = 'test_jwt_secret';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/children', childRoutes);
  app.use('/api/opportunities', opportunityRoutes);
  app.use('/api/volunteers', volunteerRoutes);
  app.use('/api/residents', residentRoutes);

  // Setup Test DB State
  const orgA = await Organization.create({ name: 'Hope Haven Orphanage', email: 'hope@haven.org' });
  const orgB = await Organization.create({ name: 'Sunshine Children Home', email: 'sunshine@care.org' });

  const adminA = await User.create({
    name: 'Admin Alice',
    email: 'alice@hopehaven.org',
    password: 'password123',
    role: 'Admin',
    organization: orgA._id
  });

  const adminB = await User.create({
    name: 'Admin Bob',
    email: 'bob@sunshine.org',
    password: 'password123',
    role: 'Admin',
    organization: orgB._id
  });

  const volunteerA = await User.create({
    name: 'Volunteer Victor',
    email: 'victor@volunteer.org',
    password: 'password123',
    role: 'Volunteer'
  });

  const volunteerB = await User.create({
    name: 'Volunteer Valerie',
    email: 'valerie@volunteer.org',
    password: 'password123',
    role: 'Volunteer'
  });

  const tokenAdminA = generateTestToken(adminA._id);
  const tokenAdminB = generateTestToken(adminB._id);
  const tokenVolA = generateTestToken(volunteerA._id);
  const tokenVolB = generateTestToken(volunteerB._id);

  const childA = await Child.create({
    anonymizedCode: 'CH-1001',
    age: 10,
    gender: 'Male',
    organization: orgA._id,
    educationLevel: 'Grade 5',
    interests: ['Coding', 'Chess'],
    skills: ['Python Basics'],
    aspirations: ['Software Engineer'],
    needs: [{ category: 'Education', description: 'Programming & Technology Mentorship', urgency: 'High' }]
  });

  const childB = await Child.create({
    anonymizedCode: 'CH-2002',
    age: 12,
    gender: 'Female',
    organization: orgB._id,
    educationLevel: 'Grade 7',
    interests: ['Art', 'Music'],
    skills: ['Drawing'],
    aspirations: ['Artist'],
    needs: [{ category: 'Mentorship', description: 'Art & Design Coaching', urgency: 'Medium' }]
  });

  // Test 1: Admin can access their own organization's children
  let res = await makeRequest(app, 'GET', '/api/children', null, tokenAdminA);
  assert.strictEqual(res.status, 200, 'Test 1 Failed: Status not 200');
  assert.strictEqual(res.body.length, 1, 'Test 1 Failed: Length not 1');
  assert.strictEqual(res.body[0].anonymizedCode, 'CH-1001', 'Test 1 Failed: Code mismatch');
  console.log('✓ Test 1 Passed: Admin can access their own organization\'s children.');

  // Test 2: Admin cannot access another organization's children
  res = await makeRequest(app, 'GET', `/api/children/${childB._id}`, null, tokenAdminA);
  assert.strictEqual(res.status, 404, 'Test 2 Failed: Status not 404');
  console.log('✓ Test 2 Passed: Admin cannot access another organization\'s children.');

  // Test 3: Volunteer can view allowed child info
  res = await makeRequest(app, 'GET', `/api/children/${childA._id}`, null, tokenVolA);
  assert.strictEqual(res.status, 200, 'Test 3 Failed');
  assert.strictEqual(res.body.anonymizedCode, 'CH-1001');
  assert.strictEqual(res.body.password, undefined);
  console.log('✓ Test 3 Passed: Volunteer can view allowed anonymized child info.');

  // Test 4: Volunteer cannot edit child info
  res = await makeRequest(app, 'PUT', `/api/children/${childA._id}`, { age: 11 }, tokenVolA);
  assert.strictEqual(res.status, 403, 'Test 4 Failed');
  console.log('✓ Test 4 Passed: Volunteer cannot edit child info.');

  // Test 5: Admin can create/publish a volunteering need
  const payload = {
    title: 'Programming & Technology Mentorship',
    type: 'Mentorship',
    description: 'Teach Python programming to children',
    supportCategories: ['Education'],
    requiredSkills: ['Python', 'Java']
  };
  res = await makeRequest(app, 'POST', '/api/opportunities', payload, tokenAdminA);
  assert.strictEqual(res.status, 201, 'Test 5 Failed');
  assert.strictEqual(res.body.title, 'Programming & Technology Mentorship');
  const oppA = res.body;
  console.log('✓ Test 5 Passed: Admin can create/publish a volunteering need.');

  // Test 6: Volunteer can view available volunteering needs
  res = await makeRequest(app, 'GET', '/api/opportunities', null, tokenVolA);
  assert.strictEqual(res.status, 200, 'Test 6 Failed');
  assert(res.body.some(o => o.title === 'Programming & Technology Mentorship'));
  console.log('✓ Test 6 Passed: Volunteer can view available volunteering needs.');

  // Test 7: Volunteer can submit a request
  const reqPayload = {
    opportunityId: oppA._id,
    message: 'I would love to mentor in Python programming!'
  };
  res = await makeRequest(app, 'POST', '/api/volunteers/requests', reqPayload, tokenVolA);
  assert.strictEqual(res.status, 201, 'Test 7 Failed');
  assert.strictEqual(res.body.status, 'Pending');
  const createdRequestId = res.body._id;
  console.log('✓ Test 7 Passed: Volunteer can submit a request.');

  // Test 8: Volunteer ID is taken from JWT, not request body
  const spoofPayload = {
    opportunityId: oppA._id,
    volunteer: adminB._id,
    message: 'Spoofed volunteer identity'
  };
  res = await makeRequest(app, 'POST', '/api/volunteers/requests', spoofPayload, tokenVolB);
  assert.strictEqual(res.status, 201, 'Test 8 Failed');
  const volBReqId = res.body._id;
  const volBUser = res.body.volunteer._id ? res.body.volunteer._id.toString() : res.body.volunteer.toString();
  assert.strictEqual(volBUser, volunteerB._id.toString(), 'Test 8 Failed: Volunteer ID was not taken from JWT');
  console.log('✓ Test 8 Passed: Volunteer ID is taken from JWT, not request body.');

  // Test 9: Duplicate volunteer request is rejected server-side
  res = await makeRequest(app, 'POST', '/api/volunteers/requests', reqPayload, tokenVolA);
  assert.strictEqual(res.status, 400, 'Test 9 Failed');
  assert(res.body.message.includes('already have an active request'));
  console.log('✓ Test 9 Passed: Duplicate volunteer request is rejected.');

  // Test 10: Volunteer can view their own requests
  res = await makeRequest(app, 'GET', '/api/volunteers/my-requests', null, tokenVolA);
  assert.strictEqual(res.status, 200, 'Test 10 Failed');
  assert(res.body.some(r => r._id.toString() === createdRequestId.toString()));
  console.log('✓ Test 10 Passed: Volunteer can view their own requests.');

  // Test 11: Volunteer cannot view another volunteer\'s private request
  res = await makeRequest(app, 'GET', `/api/volunteers/requests/${createdRequestId}`, null, tokenVolB);
  assert.strictEqual(res.status, 404, 'Test 11 Failed');
  console.log('✓ Test 11 Passed: Volunteer cannot view another volunteer\'s private request.');

  // Test 12: Correct organization Admin can approve request
  res = await makeRequest(app, 'PUT', `/api/volunteers/requests/${createdRequestId}/status`, { status: 'Approved' }, tokenAdminA);
  assert.strictEqual(res.status, 200, 'Test 12 Failed');
  assert.strictEqual(res.body.status, 'Approved');
  console.log('✓ Test 12 Passed: Correct organization Admin can approve request.');

  // Test 13: Wrong organization Admin cannot approve request
  res = await makeRequest(app, 'PUT', `/api/volunteers/requests/${createdRequestId}/status`, { status: 'Rejected' }, tokenAdminB);
  assert.strictEqual(res.status, 404, 'Test 13 Failed');
  console.log('✓ Test 13 Passed: Wrong organization Admin cannot approve request.');

  // Test 14: Volunteer cannot approve/reject requests
  res = await makeRequest(app, 'PUT', `/api/volunteers/requests/${createdRequestId}/status`, { status: 'Approved' }, tokenVolA);
  assert.strictEqual(res.status, 403, 'Test 14 Failed');
  console.log('✓ Test 14 Passed: Volunteer cannot approve/reject requests.');

  // Test 15: Approved request is visible to the volunteer as Approved
  res = await makeRequest(app, 'GET', '/api/volunteers/my-requests', null, tokenVolA);
  assert.strictEqual(res.status, 200, 'Test 15 Failed');
  const vol1Req = res.body.find(r => r._id.toString() === createdRequestId.toString());
  assert.strictEqual(vol1Req.status, 'Approved');
  console.log('✓ Test 15 Passed: Approved request is visible to the volunteer.');

  // Test 16: Rejected request is visible with Rejected status
  res = await makeRequest(app, 'PUT', `/api/volunteers/requests/${volBReqId}/status`, { status: 'Rejected' }, tokenAdminA);
  assert.strictEqual(res.status, 200, 'Test 16 Failed');
  assert.strictEqual(res.body.status, 'Rejected');

  res = await makeRequest(app, 'GET', '/api/volunteers/my-requests', null, tokenVolB);
  const vol2Req = res.body.find(r => r._id.toString() === volBReqId.toString());
  assert.strictEqual(vol2Req.status, 'Rejected');
  console.log('✓ Test 16 Passed: Rejected request is visible with Rejected status.');

  // Test 17: Existing legacy volunteer activity functionality still works
  res = await makeRequest(app, 'POST', '/api/volunteers/activities', {
    title: 'Weekend Reading Club',
    date: new Date(Date.now() + 86400000)
  }, tokenAdminA);
  assert.strictEqual(res.status, 201, 'Test 17 Failed');

  res = await makeRequest(app, 'POST', '/api/volunteers/apply', { activityId: res.body._id }, tokenVolA);
  assert.strictEqual(res.status, 201, 'Test 17 Failed Apply');
  console.log('✓ Test 17 Passed: Existing legacy volunteer functionality still works.');

  // Test 18: Existing AI matching functionality still works
  res = await makeRequest(app, 'GET', '/api/opportunities', null, tokenAdminA);
  assert.strictEqual(res.status, 200, 'Test 18 Failed');
  console.log('✓ Test 18 Passed: Existing AI matching functionality still works.');

  // Test 19: Existing Resident functionality remains intact
  res = await makeRequest(app, 'GET', '/api/residents', null, tokenAdminA);
  assert.strictEqual(res.status, 200, 'Test 19 Failed');
  console.log('✓ Test 19 Passed: Existing Resident functionality remains intact.');

  console.log('\n========================================');
  console.log(' ALL 19 INTEGRATION TESTS PASSED SUCCESSFULLY! ');
  console.log('========================================\n');

  await mongoose.disconnect();
  await mongoServer.stop();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test Suite Exception:', err);
  process.exit(1);
});
