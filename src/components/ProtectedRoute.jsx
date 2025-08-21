import React from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { getUserContext } from "../contexts/constants";

export default function ProtectedRoute({ children }) {
  //Instead of Receiving Context from the AuthContext Let's do it from constants
  // const { user } = React.useContext(AuthContext);
  // console.debug("ProtectedRoute::user", user)

  const userContext = getUserContext()
  if (!userContext || !userContext.isTokenReceived) {
    console.debug("ProtectedRoute::No Token Received")
    return <Navigate to="/login" replace />;
  }

  return children;
}
