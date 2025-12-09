// Test Employee CRUD APIs using Node.js built-in fetch (Node 18+)

const API_URL = 'http://localhost:5000/api';

// Test credentials (use an HR account)
const testLogin = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'hr@company.com',
        password: 'hr123',
      }),
    });
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
};

// Test Get All Employees
const testGetEmployees = async (token) => {
  console.log('\n=== TEST: GET ALL EMPLOYEES ===');
  try {
    const response = await fetch(`${API_URL}/employees`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Count:', data.count);
    console.log('First Employee:', data.data?.[0]);
    return data.data?.[0]; // Return first employee for testing
  } catch (error) {
    console.error('Get employees failed:', error);
  }
};

// Test Update Employee
const testUpdateEmployee = async (token, employeeId) => {
  console.log('\n=== TEST: UPDATE EMPLOYEE ===');
  console.log('Employee ID:', employeeId);
  try {
    const response = await fetch(`${API_URL}/employees/${employeeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        phone: '+1-999-888-7777',
        position: 'Updated Position',
        status: 'Active',
      }),
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Message:', data.message);
    console.log('Updated Employee:', data.data);
  } catch (error) {
    console.error('Update employee failed:', error);
  }
};

// Test Delete Employee
const testDeleteEmployee = async (token, employeeId) => {
  console.log('\n=== TEST: DELETE EMPLOYEE ===');
  console.log('Employee ID:', employeeId);
  
  const confirmDelete = false; // Set to true to actually delete
  
  if (!confirmDelete) {
    console.log('⚠️ Delete test skipped (set confirmDelete = true to test)');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/employees/${employeeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Message:', data.message);
  } catch (error) {
    console.error('Delete employee failed:', error);
  }
};

// Run all tests
const runTests = async () => {
  console.log('🧪 Starting Employee API Tests...\n');
  
  // Login
  console.log('=== LOGIN ===');
  const token = await testLogin();
  if (!token) {
    console.error('❌ Login failed. Cannot proceed with tests.');
    return;
  }
  console.log('✅ Login successful');
  console.log('Token:', token.substring(0, 20) + '...');
  
  // Get Employees
  const employee = await testGetEmployees(token);
  if (!employee) {
    console.error('❌ No employees found. Cannot proceed with tests.');
    return;
  }
  
  // Update Employee
  await testUpdateEmployee(token, employee._id);
  
  // Delete Employee (careful!)
  // await testDeleteEmployee(token, employee._id);
  
  console.log('\n✅ All tests completed!');
};

runTests();
