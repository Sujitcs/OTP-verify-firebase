import React, { useEffect, useState } from "react";
import axios from "axios";
import './dashboard.css';
const Dashboard = ({ setUserAuthenticated, setAuthToken }) => {
  const [data, setData] = useState(null);
  const authToken = localStorage.getItem("authToken");
  const API_URL='http://localhost:5000';

  useEffect(() => {
    if (authToken) {
      axios.get(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((response) => setData(response.data))
      .catch((error) => console.error("Error fetching dashboard data:", error));
    }
  }, [authToken]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/logout`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      localStorage.removeItem("authToken");
      setAuthToken("");
      setUserAuthenticated(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="dashboard-container">
  <div className="dashboard-box">
    <h1 className="dashboard-title">Dashboard</h1>
    <p className="dashboard-message">
  {data ? (
    <span>
      <strong>Hello, </strong> {data.Hello}
    </span>
  ) : (
    <span>Loading...</span>
  )}
</p>

  </div>
  <button onClick={handleLogout} className="logout-button">Logout</button>
</div>

  );
};

export default Dashboard;