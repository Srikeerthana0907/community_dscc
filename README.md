# JoyNet Community Platform

A joyful, real-time community chat platform built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io.

## Features
- **Real-Time Community Rooms**: Engage in real-time group chats with other users.
- **End-to-End Encrypted Messaging**: Secure your communications with client-side encryption.
- **Happy Thoughts Feed**: Share positive updates with the community, featuring AI-powered sentiment analysis and comforting recommendations.
- **Interactive Posts**: Like and comment on happy thoughts directly in the feed.
- **Premium UI**: Designed with a "Cool, Breezy, Happy" aesthetic featuring glassmorphism and smooth animations.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Socket.io-client, CryptoJS, Lucide-react
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, JsonWebToken

## Setup Instructions

### Backend
1. Navigate to the `backend` directory.
2. Install dependencies: `npm install`
3. Create a `.env` file with `PORT`, `MONGO_URI`, and `JWT_SECRET`.
4. Start the server: `npm start`

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Create a `.env.local` file with `VITE_API_BASE_URL` and `VITE_SOCKET_URL`.
4. Start the dev server: `npm run dev`
