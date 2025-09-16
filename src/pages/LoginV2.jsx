import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../modules/apiClient";
import { persistTokensReceived, clearTokens } from "../contexts/constants";
import Home from "../site/Home";

import '../css/login.large.css';
import '../css/login.handheld.css';

export default function LoginV2() {
    const navigate = useNavigate();

    clearTokens();
    navigate('/');

    // 🔑 Single flow: login once and get access token
    return (
        <Home />
    );
}
