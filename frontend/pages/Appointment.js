import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Appointment = () => {
    const [user, setUser] = useState({});
    const [appointment, setAppointment] = useState({
        date: '',
        time: '',
        doctorId: '',
    });

    useEffect(() => {
        // Fetch user details
        axios
            .get('/api/appointment/user/profile', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            .then((response) => {
                setUser(response.data);
            })
            .catch((error) => {
                console.error('Error fetching user details:', error);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                '/api/appointment/book',
                { ...appointment },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            alert('Appointment booked successfully.');
        } catch (error) {
            console.error('Error booking appointment:', error);
        }
    };

    return (
        <div>
            <h1>Book Appointment</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" value={user.name} readOnly />
                <input type="number" value={user.age} readOnly />
                <input type="text" value={user.gender} readOnly />
                <input type="text" value={user.contactNumber} readOnly />
                <input
                    type="date"
                    value={appointment.date}
                    onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                    required
                />
                <input
                    type="time"
                    value={appointment.time}
                    onChange={(e) => setAppointment({ ...appointment, time: e.target.value })}
                    required
                />
                <select
                    value={appointment.doctorId}
                    onChange={(e) => setAppointment({ ...appointment, doctorId: e.target.value })}
                    required
                >
                    <option value="">Select Doctor</option>
                    {/* Add doctor options dynamically */}
                </select>
                <button type="submit">Book Appointment</button>
            </form>
        </div>
    );
};

export default Appointment;
