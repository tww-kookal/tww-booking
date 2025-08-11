// Users.jsx
import React, { useEffect, useState } from "react";
import api from "../modules/apiClient";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        loadUsers().then( users => setUsers(users)).catch(() => {});
    }, []);

    async function createUser(e) {
        e.preventDefault();
        await api.post("/createUser", { username, password, role_id: roleId });
        // refresh list...
    }

    return (
        <div style={{ padding: 24 }}>
            <h2>Users</h2>
            <form onSubmit={createUser}>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
                <button>Create</button>
            </form>
            <ul>{users.map(u => <li key={u.user_id}>{u.first_name} {u.last_name} ({u.username})</li>)}</ul>

        </div>
    );
}

async function loadUsers() {
    try {
        const response = await api.get("/users");
        const sortedUsers = (response.data.users || []).sort((a, b) => {
            return a.username.localeCompare(b.username);
        });
        return sortedUsers
    } catch (error) {
        console.log(error);
    } // you need to implement GET /users in backend or adjust
}

