// FILEPATH: d:/Xigma/apps/reactjs/tww-booking/src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../modules/apiClient';
import { persistTokensReceived } from '../contexts/constants';

import '../css/login.large.css';
import '../css/login.handheld.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const params = new URLSearchParams();
            params.append("username", username);
            params.append("password", password);
            const res = await axios.post(
                `${api.defaults.baseURL}/login`,
                params,
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );
            if (res.status !== 200) {
                throw new Error("Login failed");
            }
            const data = res.data;
            const accessToken = data.access_token;
            const userObj = { username };

            persistTokensReceived(username, accessToken);
            setToken(accessToken);
            setUser(userObj);

            // Navigate after successful login
            navigate("/dashboard");

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-paper">
                <h2>Sign In</h2>
                <form
                  className="login-form"
                  onSubmit={e => {
                    e.preventDefault();
                    handleLogin();
                  }}
                >
                    <input
                        className="login-input"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        className="login-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className="login-button" type="submit">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}