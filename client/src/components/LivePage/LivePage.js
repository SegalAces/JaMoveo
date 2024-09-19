import React from "react";
import LyricsContainer from "./LyricsContainer.js"; // Assuming this is your component
import "./LivePage.css";

const LivePage = ({ user, song, sendMessage }) => {
  const { artist, language, chords, title } = song;

  // Quit button handler (if any logic is needed)
  const handleQuit = () => {
    console.log("Quit button clicked");
    // Send message to WebSocket indicating that no song is chosen
    sendMessage({ action: "song_not_chosen" });
  };
  return (
    <div className="live-page-container">
      {user.role === "admin" && (
        <button className="quit-button" onClick={handleQuit}>
          Quit
        </button>
      )}

      <>
        <h1>{title}</h1>
        <h3>{`By: ${artist}`}</h3>
      </>

      <LyricsContainer
        lyrics={chords}
        language={language}
        instrument={user.instrument}
      />
    </div>
  );
};

export default LivePage;