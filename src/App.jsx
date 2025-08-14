import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Rooms from "./pages/Rooms";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AvailabilityChart from "./pages/AvailabilityChart";
import BookingSearch from "./pages/BookingSearch";
import Booking from "./pages/Booking";
import Customer from "./pages/Customer";
import User from "./pages/User";

export default function App() {
    return (
        <div>
            <Navbar />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
                <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/availability" element={<ProtectedRoute><AvailabilityChart /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><BookingSearch /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                <Route path="/user" element={<ProtectedRoute><User /></ProtectedRoute>} />
                <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
                <Route path="/customers/new" element={<ProtectedRoute><Customer /></ProtectedRoute>} />
                <Route path="/user/new" element={<ProtectedRoute><User /></ProtectedRoute>} />
            </Routes>
        </div>
    );
}
