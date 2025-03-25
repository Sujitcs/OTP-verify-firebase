import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import OtpPage from "./OtpPage";
import Dashboard from "./Dashboard";
import Fcmtoken from "./Fcmtoken";

function App() {
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [, setAuthToken] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setAuthToken(storedToken);
      setUserAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            userAuthenticated ? (
              <Dashboard
                setUserAuthenticated={setUserAuthenticated}
                setAuthToken={setAuthToken}
              />
            ) : (
              <OtpPage
                setUserAuthenticated={setUserAuthenticated}
                setAuthToken={setAuthToken}
              />
            )
          }
        />
        <Route path="/fcmtoken" element={<Fcmtoken />} />
      </Routes>
    </Router>
  );
}

export default App;
