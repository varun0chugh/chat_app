import React, { useEffect, useState } from "react";
import { io } from "socket.io-client"; // Import socket.io-client
import "./App.css";

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shrinkStyle, setShrinkStyle] = useState({ width: "100%" });
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [user, setUser] = useState(null);
  const [receiver, setReceiver] = useState(null);

  // Initialize socket connection
  const socket = io("http://localhost:5000");

  // Fetch users on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch users: " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        setUser(data[0]); // Set the first user for simplicity
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  // Listen for incoming WebSocket messages
  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992 && window.innerWidth <= 1600) {
        setShrinkStyle({ width: "90%" });
      } else if (window.innerWidth >= 700 && window.innerWidth <= 767) {
        setShrinkStyle({ width: "80%" });
      } else if (window.innerWidth >= 600 && window.innerWidth < 700) {
        setShrinkStyle({ width: "75%" });
      } else if (window.innerWidth <= 600) {
        setShrinkStyle({ width: "50%" });
      } else {
        setShrinkStyle({ width: "100%" });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Send a message
  const sendMessage = () => {
    // Check if messageInput, user, and receiver are valid
    if (!messageInput) {
      console.error("Message input is empty.");
      return;
    }
    if (!user) {
      console.error("User is not set.");
      return;
    }
    if (!receiver) {
      console.error("Receiver is not set.");
      return;
    }
  
    const message = {
      sender: user.id,
      receiver: receiver.id,
      content: messageInput,
    };
  
    // Log the message to verify data
    console.log("Sending message:", message);
  
    // Emit message via WebSocket
    socket.emit("message", message);
  
    // Send the message via the REST API
    fetch("http://localhost:5000/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send message: " + response.statusText);
        }
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  
    // Clear input after sending message
    setMessageInput("");
  };
  
  return (
    <div style={shrinkStyle}>
      <nav className="navbar">
        <span>Chat Application</span>
      </nav>
      <div className="content">
        <div className="left-menu">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "Close Menu" : "Open Menu"}
          </button>
          {menuOpen && (
            <ul>
              <li onClick={() => setReceiver({ id: 1, username: "User 1" })}>
                User 1
              </li>
              <li onClick={() => setReceiver({ id: 2, username: "User 2" })}>
                User 2
              </li>
              <li onClick={() => setReceiver({ id: 3, username: "User 3" })}>
                User 3
              </li>
            </ul>
          )}
        </div>
        <div className="main-content">
          <h3>Chat with {receiver ? receiver.username : "Select a user"}</h3>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
        <div className="right-panel">
          <h3>Varun chatapp</h3> {/* Display Varun chatapp */}
          <div className="messages">
            {/* Display all messages in the right panel */}
            {messages
              .filter(
                (msg) =>
                  (msg.sender === user.id && msg.receiver === receiver.id) ||
                  (msg.sender === receiver.id && msg.receiver === user.id)
              )
              .map((msg, index) => (
                <div key={index} className="message">
                  <p>{msg.content}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
      <footer className="footer">Varun chatapp</footer> {/* Display footer message */}
    </div>
  );
};

export default App;
