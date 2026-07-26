import axios from "axios";
import React, { useState } from "react";

const UsersSideBar = () => {
  const [users, setUsers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [error, setError] = useState("");

  const fetchAllUsers = async () => {
    try {
      setError("");

      if (showSidebar) {
        setShowSidebar(false);
        return;
      }

      const res = await axios.get("/api/user/all", { withCredentials: true });
      const data = res.data;

      console.log("API Response:", data);
      setUsers(data);
      setShowSidebar(true);
    } catch (err) {
      setError(err.response?.data?.message || "Server error occurred");
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
  <button
    onClick={fetchAllUsers}
    style={{
      padding: "8px 12px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      margin: "10px",
      width: "auto", // 👈 keeps button size compact
      whiteSpace: "nowrap", // 👈 prevents text wrapping
    }}
  >
    Show All Users
  </button>

      {error && (
        <p style={{ color: "red", marginLeft: "10px", alignSelf: "center" }}>
          {error}
        </p>
      )}

      {showSidebar && (
        <div
          style={{
            width: "260px",
            backgroundColor: "#f8f9fa",
            borderRight: "1px solid #ddd",
            height: "100vh",
            overflowY: "auto",
            padding: "15px",
          }}
        >
          <h3 style={{ textAlign: "center" }}>All Users</h3>
          {users && users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 5px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <img
                  src={user.profilePic?.url || "https://via.placeholder.com/40"}
                  alt={user.name}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <span>{user.name || "Unnamed User"}</span>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#888" }}>No users found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersSideBar;
