import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import Routes instead of Switch
import MainPage from "./components/MainPage/MainPage.js";
import EntryPage from "./components/EntryPage/EntryPage.js";
import { SERVER_URL } from "./config.js";
import "./App.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({
    username: "Segal",
    role: "admin",
    instrument: "drums",
  });
  const [loading, setLoading] = useState(true);
  console.log("starting app..");
  const verifyToken = async (token) => {
    if (token) {
      try {
        console.log("sending request to server: ", SERVER_URL);
        const response = await fetch(`${SERVER_URL}/validate_token`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("got request back: ", response);
        if (response.ok) {
          const data = await response.json();
          if (data.username) {
            setUser(data);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false); // Set loading to false once verification is complete
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    verifyToken(token);
  }, []); // Run once on mount

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    verifyToken(newToken); // Verify the token after setting it
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/admin/signup"
          element={
            <EntryPage
              role="admin"
              defaultAction="Signup"
              onLogin={handleLogin}
            />
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <MainPage user={user} />
            ) : (
              <EntryPage onLogin={handleLogin} />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

// (
//     <Router>
//         <div className="app-container">
//             <div className="main-content-container">
//                 <Routes>
//                     <Route path="/admin/signup" element={<EntryPage role="admin" defaultAction="Signup" onLogin={handleLogin} />} />
//                     <Route path="/" element={isAuthenticated ? <MainPage user={user} /> : <EntryPage onLogin={handleLogin} />} />
//                 </Routes>
//             </div>
//         </div>
//     </Router>
// );

// import React from 'react';
// import MainPage from './components/MainPage/MainPage.js'; // Import your MainPage component
// import EntryPage from './components/EntryPage/EntryPage.js'; // Import your EntryPage component
// import './App.css';

// function App() {
//   const user = { role: "admin", instrument: "vocals", username: "Segal"};
//   const authenticatedUser = true; // Fixed variable name

//   return (
//     <div className="app-container">
//       <div className="main-content-container">
//         {authenticatedUser ? <MainPage user={user} /> : <EntryPage />}
//       </div>
//     </div>
//   );
// }

// export default App;
