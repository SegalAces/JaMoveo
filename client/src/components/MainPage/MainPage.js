import React, { useState, useEffect, useRef } from "react";
import MainAdmin from "./MainAdmin"; // Assuming these are your components
import MainUser from "./MainUser";
import LivePage from "../LivePage/LivePage.js";
import "./MainPage.css";
import { SERVER_URL } from "../../config.js";
const MainPage = ({ user }) => {
  const [rehearsalState, setRehearsalState] = useState({
    isRehearsalOn: false,
    song: null,
  });
  const [loading, setLoading] = useState(true); // Add loading state
  const socketRef = useRef(null);
  useEffect(() => {
    socketRef.current = new WebSocket(
      `${SERVER_URL}/ws/notifications`
    );
    // Handle WebSocket messages
    socketRef.current.onmessage = (message) => {
      const data = JSON.parse(message.data);
      console.log(
        "got socket message. rehearsal state: ",
        data.rehearsal_state
      );
      console.log("got socket message. song: ", data.current_song);
      // Update the entire rehearsalState object
      setRehearsalState({
        isRehearsalOn: data.rehearsal_state === "active",
        song: data.current_song,
      });
      setLoading(false); // Set loading to false when message is received
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket closed");
    };

    // Add beforeunload event to handle tab/browser closure
    const handleBeforeUnload = () => {
      if (socketRef.current) {
        sendMessage({ action: "stop_rehearsal", username: user.username });
        socketRef.current.close();
        console.log("WebSocket closed on tab close");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup WebSocket and remove event listener
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user.username]);

  const { isRehearsalOn, song } = rehearsalState;

  const sendMessage = (message) => {
    console.log("sending message: ", message);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      console.log("sent message: ", message);
    }
  };
  return (
    <div className="main-page-container">
      {loading ? ( // Show loading indicator if loading
        <div className="loading-indicator">Loading...</div> // Styled loading indicator
      ) : song ? (
        <LivePage song={song} user={user} sendMessage={sendMessage} />
      ) : user.role === "admin" ? (
        <div className="admin-user">
          <MainAdmin isRehearsalOn={isRehearsalOn} sendMessage={sendMessage} />
        </div>
      ) : (
        <div className="admin-user">
          <MainUser isRehearsalOn={isRehearsalOn} />
        </div>
      )}
    </div>
  );
};

export default MainPage;
