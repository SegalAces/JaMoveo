import React from "react";
import './MainUser.css'
const MainUser = ({ isRehearsalOn }) => {
  return (
    <div className="main-user-container">
      <p className="rehearsal-status">
        {isRehearsalOn ? "Waiting for next song" : "Waiting for rehearsal to start"}
      </p>
    </div>
  );
};

export default MainUser;