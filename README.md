
Chat Application Documentation
This is a Real-Time Chat Application with a ReactJS frontend and Flask backend. It allows users to send and receive messages in real-time using WebSockets and stores messages in a SQLite database.

Features:
Real-Time Messaging with Socket.IO.
Message History stored in SQLite.
Responsive Design for different screen sizes.
Technologies:
Frontend: ReactJS
Backend: Flask
Database: SQLite
WebSockets: Socket.IO
Setup:
1. Clone the repository:
bash
Copy code
git clone https://github.com/varun0chugh/chat_app.git
cd chat_app
2. Backend Setup:
Navigate to the backend folder:
bash
Copy code
cd backend
Install dependencies:
bash
Copy code
pip install -r requirements.txt
Run the Flask server:
bash
Copy code
python app.py
3. Frontend Setup:
Navigate to the frontend folder:
bash
Copy code
cd frontend
Install dependencies:
bash
Copy code
npm install
Start the React app:
bash
Copy code
npm start
4. Access the Application:
Frontend: Visit http://localhost:3000.
Backend: API is available at http://localhost:5000.
API Endpoints:
GET /api/users: Fetch all users.
POST /api/messages: Send a new message.
