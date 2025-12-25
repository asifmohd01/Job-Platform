# Job Portal - Foundation MVP (Version-0)

## 🚀 Project Overview

A production-quality, AI-ready job portal platform built with modern tech stack. This version focuses on core functionality while maintaining an architecture ready for AI integration, MCP, and DevOps.

**Current Status:** ✅ Backend Complete | 🔧 Frontend In Progress | 📋 Fully Responsive

---

## 📋 Features (Version-0)

### ✅ Authentication & Authorization

- User registration (Candidate/Recruiter/Admin roles)
- JWT-based login with token generation
- Protected routes with middleware
- Password hashing with bcryptjs
- Role-based access control (RBAC)

### ✅ Job Management (Recruiter)

- Create, read, update, delete jobs
- Set job status (open/filled)
- Fields: title, department, skills, experience, location, salary, type, description

### ✅ Job Browsing (Candidate)

- View all open jobs
- Filter by location, job type, skills
- Job details page

### ✅ Job Applications

- Apply to jobs with resume upload
- Resume stored on Cloudinary
- Prevent duplicate applications (unique index)
- Track application status

### ✅ Admin Dashboard

- View all users
- Block/remove users
- View all jobs

---

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas + Mongoose (v7.5.0)
- **Authentication:** JWT (jsonwebtoken)
- **Hashing:** bcryptjs
- **File Storage:** Cloudinary
- **Upload Handler:** Multer + Streamifier
- **API:** RESTful

### Frontend

- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS (dark theme ready)
- **State:** Context API
- **HTTP:** Axios
- **Router:** React Router DOM
- **UI:** Responsive, component-based

### Infrastructure (Future)

- Placeholder for AI service layer
- MCP-ready architecture
- Environment-based config

---

## 📁 Project Structure

```
job/
├── server/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── cloudinary.js         # Cloudinary setup
│   ├── models/
│   │   ├── User.js               # User schema (candidate/recruiter/admin)
│   │   ├── Job.js                # Job posting schema
│   │   └── Application.js        # Job application schema (unique index)
│   ├── controllers/
│   │   ├── authController.js     # Register, login, me
│   │   ├── jobController.js      # Job CRUD + filtering
│   │   ├── applicationController.js  # Apply + list applications
│   │   └── adminController.js    # User & job management
│   ├── routes/
│   │   ├── auth.js               # /api/auth/*
│   │   ├── jobs.js               # /api/jobs/*
│   │   ├── applications.js       # /api/applications/*
│   │   └── admin.js              # /api/admin/*
│   ├── middlewares/
│   │   ├── auth.js               # JWT protection (protect)
│   │   ├── role.js               # Role-based access (permit)
│   │   └── errorHandler.js       # Centralized error handling
│   ├── services/
│   │   ├── upload.js             # Multer config (memory storage)
│   │   └── cloudinaryUpload.js   # Buffer → Cloudinary streaming
│   ├── utils/
│   │   └── generateToken.js      # JWT token creation
│   ├── .env                       # Environment variables
│   ├── package.json
│   └── index.js                   # Server entry point
│
└── client/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   ├── context/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🔐 Environment Variables

Create `.env` in the `server/` folder:

```dotenv
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster0.xxx.mongodb.net/?appName=Cluster0

# JWT
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI (Future - Not Used in V0)
AI_PROVIDER=gemini
ENABLE_AI=false
```

---

## 🚀 Quick Start

### Backend Setup

```bash
cd server
npm install
```

Create `.env` with credentials (see above)

Start server:

```bash
npm run dev    # Development with nodemon
# OR
npm start      # Production
```

✅ Server runs on `http://localhost:5000`

### Frontend Setup

```bash
cd client
npm install
```

Start frontend:

```bash
npm run dev
```

✅ Frontend runs on `http://localhost:5173` (Vite default)

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint             | Body                            | Auth |
| ------ | -------------------- | ------------------------------- | ---- |
| POST   | `/api/auth/register` | `{name, email, password, role}` | ❌   |
| POST   | `/api/auth/login`    | `{email, password}`             | ❌   |
| GET    | `/api/auth/me`       | -                               | ✅   |

### Jobs

| Method | Endpoint                                                | Body                           | Auth | Role            |
| ------ | ------------------------------------------------------- | ------------------------------ | ---- | --------------- |
| GET    | `/api/jobs`                                             | -                              | ❌   | -               |
| GET    | `/api/jobs?location=NYC&jobType=full-time&skills=React` | -                              | ❌   | -               |
| GET    | `/api/jobs/:id`                                         | -                              | ❌   | -               |
| POST   | `/api/jobs`                                             | `{title, dept, skills[], ...}` | ✅   | recruiter/admin |
| PUT    | `/api/jobs/:id`                                         | `{...}`                        | ✅   | recruiter/admin |
| DELETE | `/api/jobs/:id`                                         | -                              | ✅   | recruiter/admin |

### Applications

| Method | Endpoint                         | Body                              | Auth | Notes                        |
| ------ | -------------------------------- | --------------------------------- | ---- | ---------------------------- |
| POST   | `/api/applications/:jobId/apply` | `FormData: {resume, coverLetter}` | ✅   | Prevents duplicates          |
| GET    | `/api/applications/:jobId`       | -                                 | ✅   | Recruiter lists applications |

### Admin

| Method | Endpoint                     | Body | Auth | Role  |
| ------ | ---------------------------- | ---- | ---- | ----- |
| GET    | `/api/admin/users`           | -    | ✅   | admin |
| PUT    | `/api/admin/users/:id/block` | -    | ✅   | admin |
| DELETE | `/api/admin/users/:id`       | -    | ✅   | admin |
| GET    | `/api/admin/jobs`            | -    | ✅   | admin |

---

## 🔑 Sample Requests

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "role": "candidate"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### Create Job (Recruiter)

```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Senior React Developer",
    "department": "Engineering",
    "skills": ["React", "Node.js", "MongoDB"],
    "experience": 5,
    "location": "San Francisco",
    "salary": "150k-200k",
    "jobType": "full-time",
    "description": "We are looking for...",
    "status": "open"
  }'
```

### Apply for Job

```bash
curl -X POST http://localhost:5000/api/applications/JOB_ID/apply \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "resume=@path/to/resume.pdf" \
  -F "coverLetter=I am interested in..."
```

---

## 🎨 Dark Theme & Responsive Design

All frontend components use:

- **Tailwind CSS** with dark mode utilities (`dark:` prefix)
- **Mobile-first** responsive design
- **Flexbox/Grid** layouts
- **Color Scheme:** Dark backgrounds with accent colors
- **Breakpoints:** sm, md, lg, xl responsive layers

---

## 🏗️ Architecture Decisions

1. **Mongoose v7.5.0** - Modern, no deprecated options
2. **JWT in Headers** - Standard `Authorization: Bearer token`
3. **Unique Index** on `(job, candidate)` for Application - Prevents duplicates at DB level
4. **Memory Storage (Multer)** - Streams directly to Cloudinary (no disk write)
5. **Separation of Concerns** - Controllers, services, models, middlewares
6. **Centralized Error Handling** - Single middleware for all errors
7. **Environment-Based Config** - `.env` for secrets

---

## 🔄 Data Flow

```
Candidate Registration → Login → Get JWT → Browse Jobs → Apply (Upload Resume) → Track Application

Recruiter Registration → Login → Create Jobs → View Applications → Manage Candidates

Admin Login → View All Users → Block Users → View All Jobs → Manage Platform
```

---

## 🤖 AI & MCP Ready (Architecture Only)

Structure is prepared for:

- Separate AI service layer (not implemented in V0)
- Abstract AI provider (Gemini/ChatGPT switchable)
- Model Context Protocol (MCP) integration points
- WebSocket support for real-time features (future)

---

## 🧪 Testing

To test API endpoints:

**Option 1: cURL** (See Sample Requests above)

**Option 2: Postman**

- Import collection: `postman-collection.json` (create manually)
- Set environment variables for `BASE_URL` and `TOKEN`

**Option 3: Thunder Client** (VS Code extension)

- Create requests inline in VS Code

---

## 📦 Dependencies

### Backend

```json
{
  "dotenv": "^16.0.0",
  "express": "^4.18.0",
  "mongoose": "^7.5.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "cors": "^2.8.5",
  "cloudinary": "^1.37.0",
  "multer": "^1.4.4",
  "streamifier": "^0.1.1"
}
```

### Frontend (To be installed)

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "tailwindcss": "^3.x"
}
```

---

## ✅ Checklist for Production

- [ ] Update JWT_SECRET with strong random key
- [ ] Add rate limiting middleware
- [ ] Implement input validation with joi/zod
- [ ] Add HTTPS/SSL
- [ ] Implement CORS whitelist
- [ ] Add request logging (morgan)
- [ ] Database backup strategy
- [ ] Error tracking (Sentry)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Unit & integration tests

---

## 🚀 Next Steps (Future Versions)

1. **Version-1:** AI-powered job recommendations
2. **Version-2:** MCP integration for intelligent automation
3. **Version-3:** Real-time notifications (WebSockets)
4. **Version-4:** DevOps & Cloud deployment (Docker, K8s)
5. **Version-5:** Mobile app (React Native)

---

## 📝 License

MIT

---

## 🤝 Support

For issues or questions, refer to the API endpoints section or check individual controller files.

---

**Built with ❤️ as an MVP Foundation** | Ready to scale to enterprise
#   J o b - P l a t f o r m  
 