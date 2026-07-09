# 📝 BlogApp — Full Stack Blogging Platform

A full-stack blogging platform where users can write, read, and comment on blogs. Built with React, Node.js, Express, MongoDB, and Cloudinary.

---

## 🌟 Features

- **User Authentication** — Register, Login, Logout with JWT
- **Blog Management** — Create, Read, Update, Delete blogs
- **Image Upload** — Cover image upload via Cloudinary CDN
- **Comments System** — Nested comments with replies
- **Like System** — Like / Unlike blogs
- **User Profile** — Avatar, Bio, Stats
- **Search & Filter** — Search blogs by title/content, filter by tags
- **Pagination** — Load blogs page by page
- **Protected Routes** — Auth-based access control
- **Responsive UI** — Mobile friendly design with Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI Framework |
| React Router DOM | Client-side routing |
| Tailwind CSS | Styling |
| Axios | HTTP requests |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| Bcryptjs | Password hashing |
| Multer | File upload handling |
| Cloudinary | Image storage & CDN |

---

## 📁 Project Structure

```
blog-platform/
├── server/                     # Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           # MongoDB connection
│   │   │   └── cloudinary.js   # Cloudinary setup
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── blog.model.js
│   │   │   └── comment.model.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── blog.controller.js
│   │   │   ├── comment.controller.js
│   │   │   └── user.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── blog.routes.js
│   │   │   ├── comment.routes.js
│   │   │   └── user.routes.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   └── multer.middleware.js
│   │   ├── utils/
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   └── asyncHandler.js
│   │   └── app.js
│   ├── public/temp/            # Temp image storage
│   ├── .env
│   └── index.js
│
└── client/                     # Frontend
    └── src/
        ├── api/
        │   └── axios.js        # Axios instance
        ├── context/
        │   └── AuthContext.jsx # Global auth state
        ├── components/
        │   ├── Navbar.jsx
        │   ├── BlogCard.jsx
        │   └── CommentSection.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── BlogDetail.jsx
        │   ├── CreateBlog.jsx
        │   └── Profile.jsx
        ├── App.jsx
        └── main.jsx
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the repo

```bash
git clone https://github.com/your-username/blog-platform.git
cd blog-platform
```

### 2. Backend setup

```bash
cd server
npm install
```

`.env` file banao `server/` folder mein:

```env
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/blogApp
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd client
npm install
npm run dev
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port (default: 4000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRY` | JWT token expiry (e.g. 7d) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

---

## 📡 API Endpoints

### Auth Routes `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | New user register |
| POST | `/login` | ❌ | User login |
| POST | `/logout` | ✅ | User logout |
| GET | `/me` | ✅ | Current user info |

### Blog Routes `/api/blogs`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ❌ | All published blogs |
| GET | `/:id` | ❌ | Single blog |
| POST | `/` | ✅ | Create blog |
| PATCH | `/:id` | ✅ | Update blog |
| DELETE | `/:id` | ✅ | Delete blog |
| POST | `/:id/like` | ✅ | Like / Unlike |

### Comment Routes `/api/comments`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/:blogId` | ❌ | Get all comments |
| POST | `/:blogId` | ✅ | Add comment |
| PATCH | `/:id` | ✅ | Edit comment |
| DELETE | `/:id` | ✅ | Delete comment |

### User Routes `/api/users`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/:username` | ❌ | Public profile |
| PATCH | `/update/profile` | ✅ | Update profile |
| PATCH | `/update/password` | ✅ | Change password |
| DELETE | `/delete/account` | ✅ | Delete account |

---

## 🔐 Security Features

- Password hashing with **Bcrypt** (10 salt rounds)
- **JWT** access tokens with expiry
- **Refresh tokens** stored in DB
- `httpOnly` cookies — XSS protection
- `select: false` on sensitive fields
- Soft delete — data preserved
- Owner-only edit/delete checks

---

## 🚀 Deployment

### Backend — Render
1. Render.com pe new Web Service banao
2. GitHub repo connect karo
3. Environment variables add karo
4. Build command: `npm install`
5. Start command: `npm start`

### Frontend — Vercel
1. Vercel.com pe new project banao
2. GitHub repo connect karo
3. Root directory: `client`
4. Deploy!

---

## 👤 Author

**Love sharma**
- GitHub: [https://github.com/loveCoder52](https://github.com/loveCoder52)
- LinkedIn: [https://www.linkedin.com/in/love-sharma-dev](https://linkedin.com/in/love-sharma-dev)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).