# Task Management Application


##  Project Overview

This is a complete task management solution that allows users to:
- **Create accounts** and securely authenticate
- **Manage tasks** with full CRUD operations
- **Organize work** with status tracking and filtering
- **Access anywhere** with responsive design for all devices


### Frontend (Next.js 14)
- **Modern React** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for beautiful styling
- **JWT Authentication** with secure cookies
- **Real-time Updates** with TanStack Query

### Backend (Node.js + Express)
- **RESTful API** with Express.js
- **JWT Authentication** middleware
- **MongoDB** with Mongoose ODM
- **TypeScript** for type safety
- **CORS** and security headers

### Database (MongoDB)
- **NoSQL** document storage
- **User isolation** for data security
- **Optimized queries** with indexing
- **Schema validation** with Mongoose



### 1. Clone the Repository
```bash
git clone https://github.com/tanushree01/Task_Manage.git
cd Task_Manage
```

### 2. Backend Setup
```bash
cd task_backend
npm install
cp .env
npm run dev
```

**Required Environment Variables:**
```bash
MONGODB_URI=mongodb://localhost:27017/task_manager
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
cd task_frontend
npm install
cp .env
npm run dev
```

**Required Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Access the Application
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)


### Key Features Documentation
- **Authentication Flow** - JWT-based user management
- **API Endpoints** - Complete REST API reference
- **Database Schema** - MongoDB models and relationships
- **Security Features** - JWT, CORS, and data protection


###  Authentication System
- User registration and login
- JWT token management
- Secure HTTP-only cookies
- Route protection
- Auto-logout on token expiry

###  Task Management
- Create, read, update, delete tasks
- Mark tasks as pending/completed
- Task filtering by status
- Real-time updates
- User-specific task isolation



### Frontend Technologies
- **Next.js 14** - React framework with App Router
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Query** - Server state management
- **Axios** - HTTP client for API calls

### Backend Technologies
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe development
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Token authentication

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Auto-restart development
- **Git** - Version control


### Authentication & Authorization
- JWT-based authentication
- HTTP-only secure cookies
- Password hashing with bcrypt
- Route protection middleware
- User data isolation

### Data Protection
- Input validation and sanitization
- MongoDB injection protection
- CORS configuration
- Secure error handling
- Rate limiting (configurable)

### Frontend Deployment
- **Vercel** (Recommended for Next.js)
- **Netlify** (Static hosting)
- **AWS Amplify** (Full-stack hosting)

### Common Issues
1. **MongoDB Connection** - Check service status and connection string
2. **JWT Issues** - Verify secret and token expiration
3. **CORS Errors** - Check frontend/backend URLs
4. **Port Conflicts** - Verify ports 3000 and 5000 are available



