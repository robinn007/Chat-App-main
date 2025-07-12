import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import "./App.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [socketID, setSocketId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [connectionError, setConnectionError] = useState("");

  const socket = useMemo(() => {
    if (!isAuthenticated) return null;
    
    return io("http://localhost:3000", {
      withCredentials: true,
    });
  }, [isAuthenticated]);

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "GET",
        credentials: "include",
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        setConnectionError("");
      } else {
        setConnectionError("Login failed");
      }
    } catch (error) {
      setConnectionError("Login failed: " + error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (socket && message && room) {
      socket.emit("message", { room, message });
      setMessage("");
    }
  };

  const joinRoomHandler = (e) => {
    e.preventDefault();
    if (socket && roomName) {
      socket.emit("join-room", roomName);
      setRoomName("");
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      setSocketId(socket.id);
      setConnectionError("");
      console.log("connected", socket.id);
    });

    socket.on("receive-message", (data) => {
      console.log("Received message:", data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("connect_error", (error) => {
      setConnectionError("Connection failed: " + error.message);
      console.error("Connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      setSocketId("");
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="div" gutterBottom>
            Socket.IO Chat
          </Typography>
          <Typography variant="body1" gutterBottom>
            Please login to access the chat
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleLogin}
            sx={{ mt: 2 }}
          >
            Login
          </Button>
          {connectionError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {connectionError}
            </Alert>
          )}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 2 }}>
        <Typography variant="h4" component="div" gutterBottom>
          Socket.IO Chat
        </Typography>
        
        <Typography variant="body2" component="div" gutterBottom>
          Socket ID: {socketID}
        </Typography>

        {connectionError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {connectionError}
          </Alert>
        )}

        <Box component="form" onSubmit={joinRoomHandler} sx={{ mb: 3 }}>
          <Typography variant="h6">Join Room</Typography>
          <TextField
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            label="Room Name"
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
          <Button type="submit" variant="contained" color="primary">
            Join
          </Button>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <Typography variant="h6">Send Message</Typography>
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            label="Message"
            variant="outlined"
            size="small"
            sx={{ mr: 1, mb: 1 }}
          />
          <TextField
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            label="Room"
            variant="outlined"
            size="small"
            sx={{ mr: 1, mb: 1 }}
          />
          <Button type="submit" variant="contained" color="primary">
            Send
          </Button>
        </Box>

        <Box>
          <Typography variant="h6">Messages:</Typography>
          <Stack spacing={1}>
            {messages.map((m, i) => (
              <Typography key={i} variant="body1" component="div" sx={{ p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                {m}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default App;