import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Paper } from '@mui/material';
import axios from 'axios';
import api from '../modules/apiClient';
import { persistTokensReceived } from '../contexts/constants';

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
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
                <Typography variant="h5" gutterBottom>
                    Login
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
                    <TextField type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
                    <Button variant="contained" color="primary" onClick={handleLogin}>
                        Sign In
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}