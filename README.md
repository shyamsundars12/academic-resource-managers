# 📚 Academic Resource Manager

An intelligent, role-based academic platform for seamless management of learning resources, built using modern web technologies. This system enables **Admins**, **Teachers**, and **Students** to interact with study materials securely and efficiently.

![Java](https://img.shields.io/badge/Java-17-blue.svg)
![Spring Boot](https://img.shields.io/badge/Spring--Boot-3.4.4-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green.svg)
![Google Drive API](https://img.shields.io/badge/API-Google%20Drive-yellow.svg)
![License](https://img.shields.io/github/license/yourusername/academic-resource-manager)

---

## 🚀 Features

- 🔐 **JWT Authentication & Role-Based Access**
  - Secure login for Admin, Teacher, and Student roles
  - Token-based session management using Spring Security

- 🧑‍💼 **Admin Dashboard**
  - Approve or reject teacher/student registrations
  - View platform usage stats

- 🧑‍🏫 **Teacher Panel**
  - Create and manage classrooms
  - Upload study materials to Google Drive
  - Share resources with students

- 👨‍🎓 **Student Access**
  - Join classrooms after approval
  - View/download learning materials

- ☁️ **File Handling**
  - Upload files as multipart requests
  - Files stored in Google Drive and mapped in MongoDB

---

## 🛠️ Tech Stack

### Backend
- **Spring Boot 3.4.4**
- **Spring Security + JWT**
- **MongoDB + Spring Data**
- **Lombok**
- **Google Drive API**
- **Java 17**

### Frontend (Upcoming)
- **React.js**
- **Tailwind CSS**
- **Redux Toolkit**
- **Axios**

---

## 🔄 Application Flow




---

## 🧪 API Testing

Use **Postman** or **Thunder Client** to test the following endpoints:

### 🔑 Authentication
- `POST /api/auth/register` - Role-based signup
- `POST /api/auth/login` - Get JWT token

### 📁 File Upload
- `POST /api/files/upload`  
  - Form-data Key: `file`  
  - Content-Type: `multipart/form-data`  
  - Headers: `Authorization: Bearer <JWT>`

---

## 🛡️ Security Workflow

- JWT generated on login and used in each request
- Spring Security filters ensure role-based access
- Passwords hashed using `BCryptPasswordEncoder`

---

## 💻 Getting Started

### 1. Clone the repo

git clone https://github.com/shyamsundar12/academic-resource-managers.git
cd academic-resource-managers
2. Add your Google Drive credentials
Place your credentials.json inside:

css
Copy
Edit
src/main/resources/
Enable Google Drive API at: https://console.cloud.google.com/

3. Run the app
bash
Copy
Edit
./mvnw spring-boot:run
API Base URL: http://localhost:8080/api

🌟 Future Enhancements
Admin dashboard analytics

Assignment submissions and evaluation

Real-time notifications

Chat system between teacher and students

🌐 Connect with Me
💼 LinkedIn : https://www.linkedin.com/in/shyam-sundar-s-13b297211/
📬 Email: shyamsundar41550@gmail.com
