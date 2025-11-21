# RentifyPro Backend API

## Setup Instructions

1. Install dependencies:
```bash
cd Backend
npm install
```

2. Start the server:
```bash
npm run dev
```

Server will run on: http://localhost:5000

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- Body: `{ name, email, password, confirmPassword }`
- Returns: `{ token, user }`

#### Login User
- **POST** `/api/auth/login`
- Body: `{ email, password }`
- Returns: `{ token, user }`

#### Verify Token
- **POST** `/api/auth/verify-token`
- Body: `{ token }`
- Returns: `{ user }`

#### Get Current User
- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`
- Returns: `{ user }`

## Default User Credentials
- Email: admin@rentifypro.com
- Password: admin123

## Environment Variables
Create `.env` file with:
```
PORT=5000
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```
