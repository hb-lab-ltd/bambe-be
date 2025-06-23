const pool = require('./db');
const bcrypt = require('bcryptjs');

// User credentials for registration
const users = [
  // Super Admin Users
  {
    username: 'superadmin',
    email: 'admin@umuhuza.com',
    password: 'admin123',
    role: 'admin',
    type: 'admin'
  },
  {
    username: 'admin2',
    email: 'admin2@umuhuza.com',
    password: 'admin456',
    role: 'admin',
    type: 'admin'
  },

  // Agent Users
  {
    username: 'agent1',
    email: 'agent1@umuhuza.com',
    password: 'agent123',
    role: 'agent',
    type: 'admin'
  },
  {
    username: 'agent2',
    email: 'agent2@umuhuza.com',
    password: 'agent456',
    role: 'agent',
    type: 'admin'
  },
  {
    username: 'agent3',
    email: 'agent3@umuhuza.com',
    password: 'agent789',
    role: 'agent',
    type: 'admin'
  },

  // Client Users
  {
    name: 'John Doe',
    email: 'client1@umuhuza.com',
    phone: '+250783224032',
    password: 'client123',
    type: 'client'
  },
  {
    name: 'Jane Smith',
    email: 'client2@umuhuza.com',
    phone: '+250783224033',
    password: 'client456',
    type: 'client'
  },
  {
    name: 'Mike Johnson',
    email: 'client3@umuhuza.com',
    phone: '+250783224034',
    password: 'client789',
    type: 'client'
  },
  {
    name: 'Sarah Wilson',
    email: 'client4@umuhuza.com',
    phone: '+250783224035',
    password: 'client101',
    type: 'client'
  },
  {
    name: 'David Brown',
    email: 'client5@umuhuza.com',
    phone: '+250783224036',
    password: 'client202',
    type: 'client'
  }
];

async function registerUsers() {
  try {
    console.log('🚀 Starting user registration...\n');

    // First, register all admin/agent users
    const adminUsers = [];
    for (const user of users.filter(u => u.type === 'admin')) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Check if user already exists
        const [existingUsers] = await pool.query(
          'SELECT * FROM Users WHERE email = ?',
          [user.email]
        );

        if (existingUsers.length > 0) {
          console.log(`⚠️  User ${user.email} already exists, skipping...`);
          adminUsers.push({
            ...user,
            id: existingUsers[0].id,
            status: 'already_exists',
            message: 'User already exists'
          });
          continue;
        }

        const sql = 'INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(sql, [user.username, user.email, hashedPassword, user.role]);
        
        console.log(`✅ Registered ${user.role}: ${user.email}`);
        adminUsers.push({
          ...user,
          id: result.insertId,
          status: 'registered',
          message: 'Successfully registered'
        });

      } catch (error) {
        console.error(`❌ Error registering ${user.email}:`, error.message);
        adminUsers.push({
          ...user,
          status: 'error',
          message: error.message
        });
      }
    }

    // Get a valid admin user ID for client registration
    let validAdminUser = adminUsers.find(u => u.role === 'admin' && u.status === 'registered');
    if (!validAdminUser) {
      // Try to get any existing admin user from database
      const [existingAdmins] = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
      if (existingAdmins.length === 0) {
        throw new Error('No admin user found for client registration');
      }
      validAdminUser = { id: existingAdmins[0].id };
    }

    console.log(`\n🔗 Using admin user ID ${validAdminUser.id} for client registration...\n`);

    // Now register client users
    const clientUsers = [];
    for (const user of users.filter(u => u.type === 'client')) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Check if client already exists
        const [existingClients] = await pool.query(
          'SELECT * FROM customers WHERE email = ?',
          [user.email]
        );

        if (existingClients.length > 0) {
          console.log(`⚠️  Client ${user.email} already exists, skipping...`);
          clientUsers.push({
            ...user,
            status: 'already_exists',
            message: 'Client already exists'
          });
          continue;
        }

        const sql = 'INSERT INTO customers (name, email, phone, password, status, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())';
        await pool.query(sql, [user.name, user.email, user.phone, hashedPassword, 'active', validAdminUser.id]);
        
        console.log(`✅ Registered Client: ${user.email}`);
        clientUsers.push({
          ...user,
          status: 'registered',
          message: 'Successfully registered'
        });
      } catch (error) {
        console.error(`❌ Error registering ${user.email}:`, error.message);
        clientUsers.push({
          ...user,
          status: 'error',
          message: error.message
        });
      }
    }

    console.log('\n📋 Registration Summary:');
    console.log('='.repeat(50));
    
    const adminUserList = adminUsers.filter(u => u.role === 'admin');
    const agentUserList = adminUsers.filter(u => u.role === 'agent');

    console.log(`\n👑 Super Admin Users (${adminUserList.length}):`);
    adminUserList.forEach(user => {
      console.log(`   ${user.status === 'registered' ? '✅' : '⚠️'} ${user.email} - ${user.password}`);
    });

    console.log(`\n👔 Agent Users (${agentUserList.length}):`);
    agentUserList.forEach(user => {
      console.log(`   ${user.status === 'registered' ? '✅' : '⚠️'} ${user.email} - ${user.password}`);
    });

    console.log(`\n👤 Client Users (${clientUsers.length}):`);
    clientUsers.forEach(user => {
      console.log(`   ${user.status === 'registered' ? '✅' : '⚠️'} ${user.email} - ${user.password}`);
    });

    console.log('\n🎯 Test Credentials:');
    console.log('='.repeat(50));
    console.log('\n🔐 Login Credentials for Testing:');
    console.log('\n👑 Super Admin:');
    console.log('   Email: admin@umuhuza.com');
    console.log('   Password: admin123');
    console.log('   Expected Redirect: /admin-dashboard');
    
    console.log('\n👔 Agent:');
    console.log('   Email: agent1@umuhuza.com');
    console.log('   Password: agent123');
    console.log('   Expected Redirect: /agent-dashboard');
    
    console.log('\n👤 Client:');
    console.log('   Email: client1@umuhuza.com');
    console.log('   Password: client123');
    console.log('   Expected Redirect: /client-dashboard');

    console.log('\n🚀 Ready to test the unified authentication system!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start your server: npm start');
    console.log('2. Start your client: npm run dev');
    console.log('3. Test login with the credentials above');
    console.log('4. Verify navigation shows correct user info');
    console.log('5. Test role-based access control');

  } catch (error) {
    console.error('❌ Registration failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the registration
registerUsers(); 