# RentifyPro Admin Panel - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

---

## 📦 Installation & Setup

### 1️⃣ Backend Setup

```bash
# Navigate to Backend folder
cd Backend

# Install dependencies (already done)
npm install

# Start the backend server
npm run dev
```

**Backend will run on:** `http://localhost:5000`

### 2️⃣ Frontend Setup

```bash
# Navigate to Frontend folder (open new terminal)
cd Frontend

# Start the frontend development server
npm run dev
```

**Frontend will run on:** `http://localhost:5179` (or next available port)

---

## 🔐 Authentication API

### Default Test User
- **Email:** `admin@rentifypro.com`
- **Password:** `admin123`

### API Endpoints

#### 1. Register New User
- **URL:** `POST http://localhost:5000/api/auth/register`
- **Body:**
```json
{
  "name": "Your Name",
  "email": "your@email.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```
- **Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "name": "Your Name",
      "email": "your@email.com",
      "role": "User"
    }
  }
}
```

#### 2. Login User
- **URL:** `POST http://localhost:5000/api/auth/login`
- **Body:**
```json
{
  "email": "admin@rentifypro.com",
  "password": "admin123"
}
```
- **Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@rentifypro.com",
      "role": "Administrator"
    }
  }
}
```

#### 3. Verify Token
- **URL:** `POST http://localhost:5000/api/auth/verify-token`
- **Body:**
```json
{
  "token": "your_jwt_token_here"
}
```

#### 4. Get Current User (Protected)
- **URL:** `GET http://localhost:5000/api/auth/me`
- **Headers:**
```
Authorization: Bearer your_jwt_token_here
```

---

## 🔑 Token Management

### Token Storage
Token is automatically stored in localStorage after successful login/signup:
- Key: `authToken`
- Value: JWT token string

### Token Validation
- Token is checked on every protected route
- Expired/Invalid tokens redirect to login page
- Token expires in 7 days (configurable in .env)

### Logout
- Clears all auth data from localStorage
- Redirects to login page

---

## 📝 How It Works

### 1. **User Registration (SignUp)**
```
User fills form → Frontend validates → API call to /register 
→ Backend validates → Hashes password → Creates user 
→ Generates JWT token → Returns token + user data 
→ Frontend stores token in localStorage → Redirects to dashboard
```

### 2. **User Login**
```
User enters credentials → Frontend validates → API call to /login 
→ Backend checks email → Verifies password → Generates JWT token 
→ Returns token + user data → Frontend stores token 
→ Redirects to dashboard
```

### 3. **Token Verification (Auto-login)**
```
App loads → Check if token exists in localStorage 
→ If exists, verify with /verify-token API 
→ If valid, user stays logged in → If invalid, redirect to login
```

### 4. **Protected Routes**
```
User tries to access dashboard → ProtectedRoute checks token 
→ If token exists, render page → If no token, redirect to login
```

### 5. **Logout**
```
User clicks logout → Clear localStorage (token, user data) 
→ Redirect to login page
```

---

## 🛠️ Technical Details

### Frontend (React + Vite)
- **Auth Service:** `/src/services/authService.js`
  - `loginUser()` - Login with email/password
  - `registerUser()` - Register new user
  - `verifyToken()` - Check if token is valid
  - `logoutUser()` - Clear auth data
  - `isAuthenticated()` - Check authentication status

- **Protected Routes:** `/src/components/ProtectedRoute.jsx`
  - Checks token before rendering protected pages

### Backend (Node.js + Express)
- **Controllers:** `/Backend/controllers/authController.js`
  - User registration logic
  - Login authentication
  - Token generation with JWT
  - Password hashing with bcryptjs

- **Middleware:** `/Backend/middleware/auth.js`
  - Token verification for protected routes

- **Routes:** `/Backend/routes/auth.js`
  - Public: /register, /login, /verify-token
  - Protected: /me

---

## 🔒 Security Features

✅ **Password Hashing:** bcryptjs with salt rounds  
✅ **JWT Tokens:** Secure token-based authentication  
✅ **Token Expiry:** Automatic logout after 7 days  
✅ **Protected Routes:** Authorization middleware  
✅ **CORS Enabled:** Secure cross-origin requests  
✅ **Input Validation:** Frontend + Backend validation  

---

## 🧪 Testing the API

### Using Frontend
1. Go to `http://localhost:5179/signup`
2. Fill the form and register
3. You'll be redirected to dashboard
4. Logout and try logging in with same credentials

### Using Postman/Thunder Client
1. **Register:**
   - POST `http://localhost:5000/api/auth/register`
   - Send JSON body with name, email, password, confirmPassword

2. **Login:**
   - POST `http://localhost:5000/api/auth/login`
   - Send JSON body with email, password
   - Copy the token from response

3. **Get User:**
   - GET `http://localhost:5000/api/auth/me`
   - Add header: `Authorization: Bearer <your_token>`

---

## 📂 Project Structure

```
AdminPanel/
├── Backend/
│   ├── controllers/
│   │   └── authController.js    # Auth logic
│   ├── middleware/
│   │   └── auth.js               # Token verification
│   ├── routes/
│   │   └── auth.js               # API routes
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express server
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── authService.js   # API calls
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page with API
│   │   │   └── SignUp.jsx       # Signup page with API
│   │   └── App.jsx               # Routes config
│   └── package.json
```

---

## 🐛 Troubleshooting

### Backend not starting?
```bash
cd Backend
npm install
npm run dev
```

### Frontend not connecting to backend?
- Check if backend is running on port 5000
- Check API_URL in `authService.js` (should be `http://localhost:5000/api`)

### Token not working?
- Clear localStorage and login again
- Check if token is being sent in headers
- Verify JWT_SECRET in .env file

### CORS errors?
- Backend already has CORS enabled
- Make sure both servers are running

---

## 🎯 Next Steps

1. ✅ Backend API created with authentication
2. ✅ Frontend integrated with API
3. ✅ Token-based auth working
4. ✅ Auto-login with token verification
5. 🔄 Ready to add database (MongoDB/PostgreSQL)
6. 🔄 Ready to add more protected APIs

---

## 📞 Support

Token stored in localStorage as: `authToken`  
Backend running on: `http://localhost:5000`  
Frontend running on: `http://localhost:5179`

**Test Credentials:**
- Email: admin@rentifypro.com
- Password: admin123

**Happy Coding! 🚀**
