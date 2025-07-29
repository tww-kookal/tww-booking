// src/components/GoogleLoginButton.jsx
import React from 'react';
import { useEffect, useRef } from 'react';
import { jwtDecode } from "jwt-decode";
import { CLIENT_ID, API_KEY, SCOPES, SHEET_ID } from "../config"; // Make sure these are correctly defined

const GoogleLoginButton = ({ onLogin }) => {
  const divRef = useRef(null);

  useEffect(() => {
    if (window.google && divRef.current) {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => {
          const user = jwtDecode(response.credential);
          onLogin(user);
        },
      });

      window.google.accounts.id.renderButton(divRef.current, {
        theme: 'outline',
        size: 'large',
      });

      // Optional: show one-tap
      // window.google.accounts.id.prompt();
    }
  }, []);

  return <div ref={divRef}></div>;
};

export default GoogleLoginButton;
