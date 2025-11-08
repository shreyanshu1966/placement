import axios from 'axios';

const testLogin = async () => {
  try {
    console.log('🧪 Testing Login API...\n');

    // Test 1: Student login
    console.log('Test 1: Student Login');
    const studentRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'alice.student@college.edu',
      password: 'student123'
    });
    console.log('✅ Student Login Success:');
    console.log('   Token:', studentRes.data.token ? 'Generated ✓' : 'Missing ✗');
    console.log('   User:', studentRes.data.user.name);
    console.log('   Role:', studentRes.data.user.role);
    console.log('');

    // Test 2: Faculty login
    console.log('Test 2: Faculty Login');
    const facultyRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'john.smith@college.edu',
      password: 'faculty123'
    });
    console.log('✅ Faculty Login Success:');
    console.log('   Token:', facultyRes.data.token ? 'Generated ✓' : 'Missing ✗');
    console.log('   User:', facultyRes.data.user.name);
    console.log('   Role:', facultyRes.data.user.role);
    console.log('');

    // Test 3: Admin login
    console.log('Test 3: Admin Login');
    const adminRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@college.edu',
      password: 'admin123'
    });
    console.log('✅ Admin Login Success:');
    console.log('   Token:', adminRes.data.token ? 'Generated ✓' : 'Missing ✗');
    console.log('   User:', adminRes.data.user.name);
    console.log('   Role:', adminRes.data.user.role);
    console.log('');

    // Test 4: Wrong password
    console.log('Test 4: Wrong Password');
    try {
      await axios.post('http://localhost:5000/api/auth/login', {
        email: 'alice.student@college.edu',
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed');
    } catch (error) {
      console.log('✅ Correctly rejected:', error.response.data.message);
    }
    console.log('');

    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testLogin();
