# LearnWell

LearnWell is a personal full-stack edtech platform built and maintained by Rohit Yadav. The project is designed for students and instructors, combining course discovery, enrollment, progress tracking, instructor course management, and a context-aware AI chatbot inside a modern MERN architecture.

## Author

- **Developer:** Rohit Yadav
- **Project Type:** personal project
- **Architecture:** MERN stack with separate [`frontend`](frontend) and [`server`](server) applications

## Core Highlights

- Role-based experience for students and instructors
- JWT-based authentication with OTP signup flow
- Course browsing, purchase, and enrolled learning flow
- Instructor dashboard for course management and analytics
- Profile management and display picture update support
- Razorpay payment integration for enrollments
- Cloudinary-based media upload handling
- Integrated AI chatbot for authenticated users
- Responsive frontend powered by React and Vite

## Project Structure

```text
LearnWell/
├── frontend/
│   ├── public/
│   └── src/
└── server/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    └── utils/
```

## Tech Stack

### Frontend

Based on [`frontend/package.json`](frontend/package.json):

- React 19
- Vite 8
- React Router DOM
- Redux Toolkit
- Axios
- Tailwind CSS 4
- React Hook Form
- React Hot Toast
- Chart-based dashboard visualizations

### Backend

Based on [`server/package.json`](server/package.json):

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication
- bcryptjs
- Nodemailer
- Cloudinary
- Razorpay
- express-fileupload

## Frontend Overview

The application routes are defined in [`App()`](frontend/src/App.jsx:35).

Main public pages include:

- Home
- About
- Contact
- Catalog
- Course details
- Login
- Signup
- Forgot password
- Verify email
- Update password

Protected flows include:

- Student dashboard
- Instructor dashboard
- Cart and enrolled courses
- Course creation and editing
- Lesson viewing for enrolled students

The global AI assistant is mounted through [`AIChatbot`](frontend/src/App.jsx:41), making the chatbot part of the main application shell.

## Backend Overview

The API server is initialized in [`server/index.js`](server/index.js:17) and exposes the main route groups below:

- [`/api/v1/auth`](server/index.js:47)
- [`/api/v1/chat`](server/index.js:48)
- [`/api/v1/course`](server/index.js:49)
- [`/api/v1/profile`](server/index.js:50)
- [`/api/v1/payment`](server/index.js:51)
- [`/api/v1/reach`](server/index.js:52)

The root health response is handled in [`server/index.js`](server/index.js:54).

## Main Features

### 1. Authentication and Account Access

Authentication routes are defined in [`server/routes/User.js`](server/routes/User.js:17).

Supported capabilities include:

- user signup
- login
- logout
- refresh token
- OTP sending
- password change
- reset password token generation
- password reset flow

### 2. Course Management

Course and catalog endpoints are available in [`server/routes/Course.js`](server/routes/Course.js:36).

Included functionality:

- create course
- edit course
- delete course
- add section
- update section
- delete section
- add subsection
- update subsection
- delete subsection
- fetch all courses
- fetch student-visible courses
- fetch course details
- fetch full course details for authenticated users
- update course progress
- create and fetch ratings/reviews
- category creation and category page details

### 3. Profile Management

Profile features are defined in [`server/routes/Profile.js`](server/routes/Profile.js:13).

Supported actions:

- get user details
- update profile
- update display picture
- get enrolled courses
- view instructor dashboard analytics
- delete account

### 4. Payments

Payment routes are defined in [`server/routes/Payments.js`](server/routes/Payments.js:10).

Student payment flow includes:

- payment capture
- payment verification
- payment success email handling

### 5. Contact Handling

Public contact submission is exposed in [`server/routes/Contact.js`](server/routes/Contact.js:7).

### 6. AI Chatbot

The chatbot request handler is implemented in [`chatWithAssistant()`](server/controllers/Chat.js:4).

This feature is one of the strongest parts of the project because it is not just a simple UI chatbot. The assistant is connected to backend orchestration and platform context so that authenticated users can interact with a more relevant, data-aware assistant experience.

## User Roles

LearnWell currently supports two primary user roles:

- **Student**
  - browse courses
  - purchase courses
  - access enrolled content
  - track progress
  - rate courses
- **Instructor**
  - create and manage courses
  - organize sections and subsections
  - view dashboard insights
  - manage authored content

## Local Development Setup

### 1. Install dependencies

For the root workspace:

```bash
npm install
```

For the frontend:

```bash
cd frontend && npm install
```

For the backend:

```bash
cd server && npm install
```

### 2. Configure environment variables

Create your own environment files for the backend and frontend as needed. This project uses environment-driven configuration for services such as:

- MongoDB connection
- JWT secrets
- Cloudinary credentials
- Razorpay keys
- frontend URL / allowed origins

Since this is now an independent personal project, you should keep your own secrets locally and never commit real credentials.

### 3. Run the applications

Frontend development server from [`frontend`](frontend):

```bash
npm run dev
```

Backend development server from [`server`](server):

```bash
npm run dev
```

Production backend run command from [`server`](server):

```bash
npm start
```

Frontend build command from [`frontend/package.json`](frontend/package.json):

```bash
npm run build
```

## Why This Project Stands Out

- It combines a traditional LMS workflow with a personalized AI assistant.
- It includes both student and instructor journeys in one platform.
- It demonstrates practical full-stack engineering with authentication, payments, media handling, and dashboards.
- It is structured as a personal independent codebase and can be evolved under your own repository and release process.

## Repository Status

This workspace has been prepared as an independent personal project. It is no longer tied to earlier Git clone metadata, so you can initialize a fresh repository and manage version history under your own identity.

## License

This project is licensed under the [MIT License](LICENSE).
