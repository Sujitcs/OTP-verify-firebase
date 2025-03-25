import React, { useState, useEffect } from "react";
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
    <div>
      {userAuthenticated ? (
        <Dashboard
          setUserAuthenticated={setUserAuthenticated}
          setAuthToken={setAuthToken}
        />
      ) : (
        <OtpPage
          setUserAuthenticated={setUserAuthenticated}
          setAuthToken={setAuthToken}
        />
      )}
      {/* <Fcmtoken/> */}
    </div>
  );
}
export default App;
