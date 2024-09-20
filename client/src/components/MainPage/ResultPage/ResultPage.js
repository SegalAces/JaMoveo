import React from "react";
import './ResultPage.css';

const ResultPage = ({ songs, onSongSelection, onNewSearch }) => {
/*showing songs return from database. */  
  return (
    <div className="result-page-container">
      <h2>Select a Song</h2>
      {songs.length === 0 ? (
        <p className="no-songs-message">No songs found containing these words.</p>
      ) : (
        <ul className="songs-list">
          {songs.map((song, index) => (
            <li
              key={index}
              className="song-item"
              onClick={() => onSongSelection(song)}
            >
              <strong>{song.title}</strong> <span>by {song.artist}</span>
            </li>
          ))}
        </ul>
      )}
      <button className="new-search-button" onClick={onNewSearch}>
        New Search
      </button>
    </div>
  );
};

export default ResultPage;