// import React, { useEffect, useState } from "react";
// import { gapi } from "gapi-script";
// import { CLIENT_ID, API_KEY, SCOPES } from "./config.js"; // Make sure these are correctly defined
// import SheetCRUD from "./components/SheetCRUD.jsx";
// import DriveCRUD from "./components/DriveCRUD.jsx";

// const App2 = () => {
//   const [gapiLoaded, setGapiLoaded] = useState(false);
//   const [signedIn, setSignedIn] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const start = () => {
//       console.log("👉 Loading gapi.client...");
//       gapi.client
//         .init({
//           apiKey: API_KEY,
//           clientId: CLIENT_ID,
//           discoveryDocs: [
//             "https://sheets.googleapis.com/$discovery/rest?version=v4",
//             "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
//           ],
//           scope: SCOPES,
//         })
//         .then(() => {
//           console.log("✅ gapi.client initialized.");
//           const authInstance = gapi.auth2.getAuthInstance();
//           const isUserSignedIn = authInstance.isSignedIn.get();
//           setSignedIn(isUserSignedIn);
//           setGapiLoaded(true);
//           console.log("✅ gapi client initialized and auth status checked.");
//         })
//         .catch((err) => {
//           console.error("❌ Error during gapi.client.init:", err);
//           setError("Failed to initialize Google API");
//         });
//     };

//     console.log("🌐 Loading gapi...");
//     gapi.load("client:auth2", start);
//   }, []);

//   const handleSignIn = () => {
//     const authInstance = gapi.auth2.getAuthInstance();
//     if (!authInstance) {
//       console.error("❌ gapi.auth2 is not initialized.");
//       return;
//     }

//     console.log("🔐 Initiating sign-in...");
//     authInstance
//       .signIn()
//       .then(() => {
//         console.log("✅ User signed in.");
//         setSignedIn(true);
//         setGapiLoaded(true);
//       })
//       .catch((err) => {
//         console.error("❌ Sign-in error:", err);
//         setError("Google Sign-In failed");
//       });
//   };

//   return (
//     <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
//       <h1>The Westwood Booking</h1>

//       {!gapiLoaded && <p>Loading Google APIs...</p>}

//       {error && <p style={{ color: "red" }}>Error: {error}</p>}

//       {!signedIn && gapiLoaded && (
//         <button onClick={handleSignIn}>Sign in with Google</button>
//       )}

//       {signedIn && (
//         <div>
//           <h2>✅ You are signed in!</h2>
//           <SheetCRUD />
//           <DriveCRUD />
//         </div>
//       )}
//     </div>
//   );
// };

// export default App2;
