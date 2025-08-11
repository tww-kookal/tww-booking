import React, { useState } from "react";
import api from "../modules/apiClient";
import { Link } from "react-router-dom";

export default function Rooms() {
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [people, setPeople] = useState(1);
    const [available, setAvailable] = useState([]);

    async function check(e) {
        e?.preventDefault();
        const resp = await api.get("/rooms/checkRoomAvailability", {
            params: {
                check_in_date: checkIn,
                check_out_date: checkOut,
                number_of_people: people
            }
        });
        setAvailable((resp.data.available_rooms || []).sort((a, b) => {
            return a.check_in - b.check_in;
        }));
    }

    return (
        <div style={{ padding: 24 }}>
            <h2>Check Room Availability</h2>
            <form onSubmit={check}>
                <label>Check-in</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                <label>Check-out</label>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                <label>People</label>
                <input type="number" value={people} onChange={(e) => setPeople(e.target.value)} />
                <button type="submit">Check</button>
            </form>

            <ul>
                {available.map((r) => (
                    <li key={r.room_id}>
                        {r.room_name} — <Link to={`/book/${r.room_id}`}>Book</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
