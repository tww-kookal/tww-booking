import React from "react";
import { render } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import Main from "../src/main.jsx";

// Since main.jsx directly renders to the DOM, we will test the component tree it renders
import App from "../src/App";
import { AuthProvider } from "../src/contexts/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_APP_CLIENT_ID } from "../src/modules/config";

describe("Main component render", () => {
  it("renders without crashing", () => {
    render(<Main />);
  });
});