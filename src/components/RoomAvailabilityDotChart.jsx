import React, { useEffect, useState, useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, XAxis, YAxis, Scatter, Tooltip } from 'recharts';
import dayjs from 'dayjs';
import { loadFromSheetToBookings, roomAvailabilityStatusColors, roomOptions } from './constants'; // Assuming roomOptions is defined in constants.js
import './css/RoomAvailabilityDotChart.css'; // Add your CSS file for styling

const RoomAvailabilityDotChart = ({ defaultStartDate = dayjs().format('YYYY-MM-DD') }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [data, setData] = useState([]);

    const filterBookings = async (startDate) => {
        setLoading(true);
        try {
            const allBookings = await loadFromSheetToBookings();
            const today = startDate || new Date().toISOString().split('T')[0];
            return allBookings.filter(booking =>
                booking.checkInDate >= today && booking.checkInDate <= dayjs(today).add(15, 'day').format('YYYY-MM-DD')
            ).map(booking => ({
                x: booking.checkInDate,
                y: booking.roomName,
                status: booking.status,
            }));
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to fetch bookings. Please try again.");
            return [];
        } finally {
            setLoading(false);
        }
    }

    const CustomDot = ({ cx, cy, payload }) => {
        return (
            <circle
                cx={cx}
                cy={cy}
                r={6}
                stroke="#000"
                strokeWidth={1}
                fill={roomAvailabilityStatusColors[payload.status]}
            />
        );
    };


    useEffect(() => {
        const fetchData = async () => {
            const fetchData = await filterBookings(startDate);
            setData(fetchData);
        };
        fetchData();
    }, [startDate]);

    const memoizedData = useMemo(() => data, [data]);

    console.log("Filtered Data:", memoizedData);

    const filteredData = memoizedData.filter((entry) => {
        const date = dayjs(entry.x);
        const today = dayjs(startDate);
        return date.isAfter(today.subtract(1, 'day')) && date.isBefore(today.add(15, 'day'));
    });

    return (
        <div className="w-full overflow-x-auto p-4">
            {error && <div className="error-message">{error}</div>}
            {loading ? 'Fetching from data store...' : ''}
            <div className="mb-4">
                <label className="font-semibold mr-2">Start Date:</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border rounded px-2 py-1"
                />
            </div>
            <div style={{ width: '1000px', maxWidth: '2000px', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <XAxis
                            type="category"
                            dataKey="x"
                            name="Date"
                            tickFormatter={(tick) => dayjs(tick).format('MM/DD')}
                            interval={0}
                        />
                        <YAxis
                            type="category"
                            dataKey="y"
                            name="Room"
                            ticks={roomOptions}
                        />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter
                            name="Room Bookings"
                            data={filteredData}
                            fill="#8884d8"
                            shape={<CustomDot />}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RoomAvailabilityDotChart;