import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginV2 from "./pages/LoginV2";
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
import Payments from "./pages/Payments";
import User from "./pages/User";
import Documents from "./pages/Documents";
import Expense from "./pages/Expense"
import ExpenseSearch from "./pages/ExpenseSearch";
import Header from "./site/Header";
import Home from "./site/Home";
import RoomDetails from "./site/RoomDetails";
import PageNotFound from "./site/PageNotFound";

export default function App() {

    return (
        <div>
            {/*             <Navbar /> */}
            <Header />
            <Routes>
                <Route path="/login" element={<LoginV2 />} />
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
                <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                <Route path="/booking/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
                <Route path="/expenses" element={<ProtectedRoute><Expense /></ProtectedRoute>} />
                <Route path="/expenses/search" element={<ProtectedRoute><ExpenseSearch /></ProtectedRoute>} />

                <Route path={'/'} element={<Home />} />
                <Route path={'/room/:id'} element={<RoomDetails />} />
                <Route path={'*'} element={<PageNotFound />} />

            </Routes>
        </div>
    );
}
