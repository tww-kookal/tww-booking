import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../modules/apiClient";
import { persistTokensReceived } from "../contexts/constants";

import '../css/login.large.css';
import '../css/login.handheld.css';

export default function Login() {
    const navigate = useNavigate();

    // 🔑 Single flow: login once and get access token
    const login = useGoogleLogin({
        flow: "implicit", // or "auth-code" if you want to exchange server-side
        scope: "openid profile email https://www.googleapis.com/auth/drive.readonly",
        response_type: "id_token token",   // ask for both
        onSuccess: async (tokenResponse) => {
            const { access_token, id_token } = tokenResponse;

            try {
                const resp = await api.post(`/users/googleAuth/login`, JSON.stringify({ token: access_token }));
                persistTokensReceived(resp?.data?.user || undefined, access_token);
                navigate('/dashboard')
            } catch (err) {
                console.error("Error logging in:", err.status);
                if (err.status == 404) {
                    try {
                        console.debug("Sign up.....")
                        const signUpResp = await api.post(`/users/googleAuth/signup`, { token: access_token });
                        persistTokensReceived(signUpResp?.data?.user || undefined, access_token);
                        navigate("/dashboard");
                    } catch (err) {
                        console.error("Error signing up:", err);
                        toast.error("Signup failed");
                        return;
                    }
                }
            }
        },
        onError: (err) => {
            console.error("Login Failed:", err);
            toast.error("Login failed");

        }
    });

    return (
        <div className="login-container">
            <ToastContainer />
            <button onClick={() => login()}>Sign in with Google</button>
        </div>
    );
}
