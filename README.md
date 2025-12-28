
---

# Job Portal Platform

A full-stack job portal platform where **candidates apply for jobs**, **recruiters manage hiring**, and **admins control the system**.
Built with a modern tech stack and designed to scale into an AI-powered recruitment platform.

---

## 🚀 Project Overview

This project is a **production-ready job portal application** implementing real-world hiring workflows used by companies.
It supports **role-based access**, **resume uploads**, **job management**, and a **clean SaaS-style UI**.

> AI & MCP integrations are **architecturally prepared** and can be added in future versions.

---

## ✨ Key Features

### Authentication & Roles

- JWT-based authentication
- Roles: **Candidate, Recruiter, Admin**
- Protected routes & role-based access

### Candidate

- Create and edit detailed profile
- Upload, view, and download resume (Cloudinary)
- Browse and filter jobs
- Apply for jobs
- Track applications

### Recruiter

- Create, edit, delete job posts
- View only jobs posted by them
- View candidates who applied
- Access full candidate profiles (read-only)

### Admin

- View all users
- Block or delete users
- View all jobs

---

## 🛠️ Tech Stack

### Frontend

- React.js (Vite)
- Tailwind CSS
- React Router DOM
- Axios
- Context API
- Fully responsive UI

### Backend

- Node.js
- Express.js
- MongoDB Atlas + Mongoose
- JWT Authentication
- Role-Based Access Control

### Media

- Cloudinary (resume uploads)

### DevOps (Implemented)

- Docker
- Jenkins (CI/CD)
- Kubernetes
- Ansible (infrastructure provisioning)

---

## 📸 Screenshots

> _(Add screenshots here once deployed or running locally)_

```
/screenshots
├── login.png
├── candidate-dashboard.png
├── recruiter-dashboard.png
├── job-listing.png
├── candidate-profile.png
```

---

## 📁 Project Structure

```
Job-Platform/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── utils/
│   ├── index.js
│   └── package.json
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
```

---

## ⚙️ Environment Setup

### Backend `.env`

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_atlas_url

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## ▶️ Project Setup (Local)

### 1️⃣ Backend

```bash
cd server
npm install
npm run dev
```

Backend runs at:

```
http://localhost:5000
```

---

### 2️⃣ Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🔗 API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Jobs

- `GET /api/jobs`
- `POST /api/jobs` (Recruiter)
- `PUT /api/jobs/:id`
- `DELETE /api/jobs/:id`

### Applications

- `POST /api/applications/:jobId/apply`
- `GET /api/applications/:jobId`

### Admin

- `GET /api/admin/users`
- `PUT /api/admin/users/:id/block`
- `DELETE /api/admin/users/:id`

---

## 🔐 Resume Handling (Important)

- Resumes stored in **Cloudinary**
- Resume access is **secured via backend**
- Supports:

  - View resume in same tab
  - Download resume
  - Replace resume

- No direct Cloudinary access from frontend

---

## 🧠 Architecture Highlights

- Clean separation of concerns
- Centralized error handling
- Secure JWT middleware
- Cloudinary streaming (no disk storage)
- DB-level duplicate application prevention
- AI & MCP-ready service layer

---

## 🚧 Future Enhancements

- AI resume parsing & matching
- MCP integration
- Real-time notifications
- Analytics dashboards
- Mobile app (React Native)
- Advanced recruiter workflows

---

## 📌 Production Checklist

- Secure secrets
- Enable HTTPS
- Rate limiting
- Input validation
- Logging & monitoring
- CI/CD automation

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Asif Mohd**
B.Tech – Information Science & Engineering
🔗 GitHub: [https://github.com/asifmohd01](https://github.com/asifmohd01)
🔗 LinkedIn: [https://linkedin.com/in/asifmohd01](https://linkedin.com/in/asifmohd01)

---

