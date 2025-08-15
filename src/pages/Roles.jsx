import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../modules/apiClient";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [role_name, setRoleName] = useState("");

  useEffect(() => {
    console.log("Loading Roles............")
    loadRoles();
  }, []);

  async function loadRoles() {
    api.get("/roles") // you need to implement GET /roles in backend or adjust
      .then((r) => {
        const sortedRoles = (r.data.roles || []).sort((a, b) => {
          return a.role_name.localeCompare(b.role_name);
        });
        setRoles(sortedRoles);
      })
      .catch(() => {});
  }

  async function createRole(e) {
    e.preventDefault();
    await api.post("/roles/create", { role_name: role_name });
    loadRoles();
  }

  return (
    <div style={{ padding: 24 }}>
      <ToastContainer />
      <h2>Roles</h2>
      <form onSubmit={createRole}>
        <input value={role_name} onChange={e => setRoleName(e.target.value)} placeholder="role name" />
        <button>Create</button>
      </form>
      <ul>{roles.map(u => <li key={u.role_id}>{u.role_name}</li>)}</ul>
    </div>
  );
}
