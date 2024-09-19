import React, { useState } from "react";
import ResultPage from "./ResultPage/ResultPage.js"; // Assuming this is the result page component
import { SERVER_URL } from "../../config.js";
import "./MainAdmin.css";

const MainAdmin = ({ isRehearsalOn, sendMessage }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  // Handle input change for the search query
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStartRehearsal = () => {
    const message = {
      action: "start_rehearsal",
      rehearsal_state: true,
    };
    console.log("sending start rehearsal message");
    sendMessage(message);
    console.log("start rehearsal message sent");
  };

  // Handle search action (on click or enter key)
  const handleSearch = async () => {
    try {
      // Send a GET request to fetch the search results
      const response = await fetch(
        `${SERVER_URL}/search/songs?query=${searchQuery}`
      );
      const results = await response.json();
      setSearchResults(results); // Update the results with what is returned from the server
      console.log("results from server:", results);
      console.log("results on variable:", searchResults);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  // Handle song selection
  const handleSongSelection = (song) => {
    console.log("prepering message for send: ", song);
    const message = {
      action: "song_chosen",
      song_id: song._id,
      artist: song.artist,
    };
    sendMessage(message);
  };

  // Handle new search
  const handleNewSearch = () => {
    setSearchResults(null);
    setSearchQuery("");
  };

  return (
    <>
      {!isRehearsalOn && (
        <button
          className="start-rehearsal-button"
          onClick={handleStartRehearsal}
        >
          Start Rehearsal
        </button>
      )}
      {isRehearsalOn && (
        <>
          {searchResults ? (
            <ResultPage
              songs={searchResults.songs}
              onSongSelection={handleSongSelection}
              onNewSearch={handleNewSearch}
            />
          ) : (
            <div className="search-section">
              <h2>Search any song...</h2>
              <input
                type="text"
                placeholder="Enter song title or artist"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <button className="search-button" onClick={handleSearch}>
                Search
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default MainAdmin;
