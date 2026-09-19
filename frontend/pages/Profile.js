import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
    const [profile, setProfile] = useState({
        name: '',
        age: '',
        gender: '',
        contactNumber: '',
    });

    const [isProfileCompleted, setIsProfileCompleted] = useState(false);

    useEffect(() => {
        // Fetch user profile
        axios
            .get('/api/appointment/user/profile', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            .then((response) => {
                setProfile(response.data);
                setIsProfileCompleted(response.data.profileCompleted);
            })
            .catch((error) => {
                console.error('Error fetching profile:', error);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                '/api/appointment/user/update-profile',
                profile,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setIsProfileCompleted(true);
            alert('Profile updated successfully.');
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div>
            <h1>Complete Your Profile</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Age"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    required
                />
                <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    required
                >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                <input
                    type="text"
                    placeholder="Contact Number"
                    value={profile.contactNumber}
                    onChange={(e) => setProfile({ ...profile, contactNumber: e.target.value })}
                    required
                />
                <button type="submit">Save Profile</button>
            </form>
        </div>
    );
};

export default Profile;
