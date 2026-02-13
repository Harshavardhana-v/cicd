Documenting Project Run Instructions
This plan outlines how to run the frontend and backend of the project.

Proposed Changes
Documentation
[NEW] 
run_instructions.md
NOTE

As per the user's request, these instructions are provided here in the implementation plan rather than as a separate file in the project.

Backend
The backend is a Node.js Express server.

Location: c:\cicd\Backend

Installation
bash
cd Backend
npm install
Running the server
Development mode (with nodemon):
bash
npm run dev
Production mode:
bash
npm start
Frontend
The frontend is built with Next.js.

Location: c:\cicd\Frontend

Installation
bash
cd Frontend
npm install
Running the application
Development mode:
bash
npm run dev
Build and Start (Production):
bash
npm run build
npm start
Verification Plan
Manual Verification
Confirm that npm run dev works for both Frontend and Backend separately.
Verify that the paths and commands match the package.json files in the respective directories.
