# HRMS Backend - Authentication System

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. MongoDB Setup
- Open **MongoDB Compass**
- Connect to: `mongodb://localhost:27017`
- Database will be created automatically: `hrms_db`

### 3. Environment Variables
Already configured in `.env` file:
- MongoDB URI: `mongodb://localhost:27017/hrms_db`
- JWT Secret: `hrms_secret_key_2024_secure_token`
- Port: `5000`

### 4. Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Authentication Routes

#### 1. Sign Up (Register)
**POST** `/api/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@company.com",
  "password": "password123",
  "role": "employee",
  "department": "IT",
  "position": "Developer",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "employee",
    "employeeId": "EMP0000001",
    "token": "jwt_token_here"
  }
}
```

#### 2. Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "employee",
    "employeeId": "EMP0000001",
    "token": "jwt_token_here"
  }
}
```

#### 3. Get Current User (Protected)
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "employee",
    "employeeId": "EMP0000001"
  }
}
```

#### 4. Logout
**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

## 🔐 User Roles
- `hr` - HR Manager (full access)
- `employee` - Regular employee
- `tl` - Team Leader

## 🗄️ Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  role: String (hr/employee/tl),
  employeeId: String (auto-generated),
  department: String,
  position: String,
  phone: String,
  joinDate: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token authentication
- ✅ Token expiry (24 hours)
- ✅ Protected routes with middleware
- ✅ Role-based access control
- ✅ Input validation
- ✅ CORS configuration

## 🧪 Testing with Postman/Thunder Client

### 1. Sign Up Test
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "HR Manager",
  "email": "hr@company.com",
  "password": "hr123",
  "role": "hr"
}
```

### 2. Login Test
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "hr@company.com",
  "password": "hr123"
}
```

### 3. Get Me Test
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your_token_here>
```

## 📊 MongoDB Compass Verification
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Check `hrms_db` database
4. View `users` collection
5. You'll see all registered users with hashed passwords

## 🛠️ Project Structure
```
Backend/
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   └── User.js            # User schema
├── controllers/
│   └── authController.js  # Authentication logic
├── routes/
│   └── authRoutes.js      # API routes
├── middleware/
│   └── authMiddleware.js  # JWT verification
├── .env                   # Environment variables
├── server.js              # Main server file
└── package.json
```

## ✅ Next Steps
1. Start MongoDB (if not running)
2. Run `npm install` in Backend folder
3. Run `npm run dev` to start server
4. Test APIs with Postman
5. Integrate with React frontend
