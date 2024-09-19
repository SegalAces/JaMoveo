import React, { useState, useEffect, useRef } from "react";
import "./LyricsContainer.css";

const LyricsContainer = ({ lyrics, language, instrument }) => {
  const [scrolling, setScrolling] = useState(true);
  const lyricsRef = useRef(null);
  console.log('song rylics from lyrics container: ', lyrics);
  console.log('instrument from lyrics container: ', instrument);
  // Start scrolling lyrics automatically
  useEffect(() => {
    let scrollInterval;
    if (scrolling) {
      scrollInterval = setInterval(() => {
        if (lyricsRef.current) {
          lyricsRef.current.scrollBy(0, 1); // Scroll down slowly
        }
      }, 30); // Adjust speed as needed
    }

    return () => clearInterval(scrollInterval); // Cleanup the interval
  }, [scrolling]);

  // Toggle scrolling behavior
  const toggleScrolling = () => {
    setScrolling((prev) => !prev);
  };

  return (
    <div>
      <div
        className={`lyrics-container ${language === "hebrew" ? "rtl" : ""}`}
        ref={lyricsRef}
      >
        {lyrics.map((line, index) => (
          <div
            key={index}
            className={`lyrics-line ${instrument === "vocals" ? "vocals" : ""}`}
          >
            {line.map((item, i) => (
              <div key={i} className="lyrics-word">
                {/* Only show chords if instrument is NOT vocals */}
                {instrument !== "vocals" && item.chords && (
                  <div className="chord">{item.chords}</div>
                )}
                <div>{item.lyrics}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button className="scrolling-button" onClick={toggleScrolling}>
        {scrolling ? "Stop Scrolling" : "Start Scrolling"}
      </button>
    </div>
  );
};

export default LyricsContainer;
