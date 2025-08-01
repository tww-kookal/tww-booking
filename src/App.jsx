import React, { useEffect, useState } from "react";
import { CLIENT_ID, API_KEY, SCOPES } from "./config";
import BookingSearch from "./components/BookingSearch.jsx";
import Booking from "./components/Booking.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Navbar from "./components/Navbar.jsx";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import AvailabilityChart from "./components/AvailabilityChart.jsx";

let tokenClient;

const App = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState(null);
  const [appLoaded, setAppLoaded] = useState(false); // New state to track app loading

  useEffect(() => {
    const loadGoogleAPI = async () => {
      try {
        // Load the Google API script dynamically
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = async () => {
          // Initialize the gapi client
          await window.gapi.load("client", async () => {
            try {
              await window.gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [
                  "https://sheets.googleapis.com/$discovery/rest?version=v4",
                  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
                ],
              });

              // Initialize the Google Identity Services (GIS) token client
              tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (tokenResponse) => {
                  if (tokenResponse && tokenResponse.access_token) {
                    window.gapi.client.setToken(tokenResponse);
                    setSignedIn(true);
                  } else {
                    console.error("❌ Failed to get access token.");
                    setError("Failed to get access token.");
                  }
                },
              });
              setAppLoaded(true); // Set appLoaded to true after successful initialization
            } catch (e) {
              console.error("❌ gapi client initialization error:", e);
              setError("Google API client initialization failed.");
            }
          });
        };
        script.onerror = () => {
          console.error("❌ Failed to load Google API script.");
          setError("Failed to load Google API script.");
        };
        document.body.appendChild(script);
        setError(null);
      } catch (e) {
        console.error("❌ Error loading Google API:", e);
        setError("Error loading Google API.");
      }
    };

    loadGoogleAPI();
  }, []);

  const handleSignIn = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken();
      setError(null);
    } else {
      console.error("❌ Token client not initialized.");
      setError("Token client not initialized.");
    }
  };

  return (
    <div className="app-container">
      {error && <p className="error-message">Error: {error}</p>}

      {!signedIn && (
        <div className="login-container">
          <button className="login-button" onClick={handleSignIn}>
            Sign in with Google
          </button>
        </div>
      )}

      {signedIn && appLoaded && ( // Conditionally render the Router only when appLoaded is true
        <Router>
          <Navbar />
          <div className="content-container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/availability" element={<AvailabilityChart />} />
              <Route path="/search" element={<BookingSearch />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="*" element={<Navigate to="/" />} /> {/* Redirect any unknown route to Dashboard */}
            </Routes>
          </div>
        </Router>
      )}
    </div>
  );
};

export default App;