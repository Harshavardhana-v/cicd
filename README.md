# CI/CD Project

This project contains a full-stack application with a Next.js frontend and a Node.js Express backend.

## Project Structure
- `Backend/`: Express server for handling API requests and code analysis.
- `Frontend/`: Next.js application for the user interface.

---

## Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the server:
   - **Development:** `npm run dev` (starts with nodemon)
   - **Production:** `npm start`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the application:
   - **Development:** `npm run dev`
   - **Production:**
     ```bash
     npm run build
     npm start
     ```

---

## Technical Details

### Backend Stack
- **Framework:** Express
- **Language:** JavaScript (ES Modules)
- **Key Dependencies:** Axios, CORS, Dotenv, Nodemon

### Frontend Stack
- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS 4, Framer Motion
- **State Management:** Zustand, Valtio
- **Key Features:** Monaco Editor integration, React Flow, TanStack Query
