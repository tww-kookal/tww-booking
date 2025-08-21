import React, { createContext, useState, useEffect } from "react";
import api from "../modules/apiClient";
import { persistTokensReceived, clearTokens, isTokenReceived } from '../contexts/constants';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    //Received from Session
    // const stored = sessionStorage.getItem("user");
    // if (stored) setUser(JSON.parse(stored));

    if (isTokenReceived()) {
      console.debug("AuthContext::Tokens are Received")
      api.defaults.headers.common["Authorization"] = `Bearer ${AUTH_TOKEN}`;
      setToken(AUTH_TOKEN);
      setUser({AUTH_USER});
    } else {
      console.debug("AuthContext::Tokens are not Received")      
    }

  }, []);

  async function login(username, password) {
    // OAuth2 password flow expects form data
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("username", username);
    params.append("password", password);

    const res = await api.post("/login", params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const token = res.data.access_token;
    // optionally, get user info (backend might provide or decode token)
    const userObj = { username };

    //Assigning to Common Variables
    persistTokensReceived(username, token);
    setUser(userObj);
    setToken(token);

    return userObj;
  }

  function logout() {
    clearTokens();
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
