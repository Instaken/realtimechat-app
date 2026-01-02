import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Calendar, Save, ArrowLeft } from 'lucide-react';
import Avatar from 'boring-avatars';

const Profile = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        gender: '',
        birthdate: '',
        location: ''
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('chat_user') || '{}');
        if (!user.id) {
            navigate('/auth');
            return;
        }
        setCurrentUser(user);

        // Load profile data from localStorage
        const profileData = JSON.parse(localStorage.getItem(`profile_${user.id}`) || '{}');
        setFormData({
            username: user.username || '',
            email: user.email || '',
            gender: profileData.gender || '',
            birthdate: profileData.birthdate || '',
            location: profileData.location || ''
        });
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSaved(false);
    };

    const calculateAge = (birthdate) => {
        if (!birthdate) return null;
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Save profile data
        const profileData = {
            gender: formData.gender,
            birthdate: formData.birthdate,
            location: formData.location
        };
        localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(profileData));

        // Update user data
        const updatedUser = {
            ...currentUser,
            username: formData.username,
            email: formData.email
        };
        localStorage.setItem('chat_user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    const age = calculateAge(formData.birthdate);

    return (
        <div className="h-full overflow-y-auto bg-gray-50 dark:bg-chat-dark">
            <div className="max-w-3xl mx-auto p-6 pb-12">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/app')}
                        className="flex items-center gap-2 text-gray-600 dark:text-chat-light hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to Rooms
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
                    <p className="text-gray-600 dark:text-chat-light mt-1">Manage your personal information</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white dark:bg-[#565666] rounded-2xl shadow-xl overflow-hidden mb-6">
                    {/* Avatar Section */}
                    <div className="bg-[#464655] dark:bg-[#3b3b4d] p-8 text-center border-b border-chat-grey/20">
                        <div className="inline-block p-2 bg-white/10 rounded-full mb-4">
                            <Avatar
                                size={120}
                                name={currentUser.username}
                                variant="beam"
                                colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-white">{currentUser.username}</h2>
                        <p className="text-white/80 text-sm mt-1">{currentUser.role === 'admin' ? 'Administrator' : 'Member'}</p>
                        {age && <p className="text-white/80 text-sm mt-1">{age} years old</p>}
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Username */}
                        <div>
                            <label className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-2">
                                <User size={18} />
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-gray-100 dark:bg-chat-dark/50 border border-gray-300 dark:border-chat-grey/50 rounded-lg py-3 px-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-chat-grey focus:outline-none focus:border-blue-500 dark:focus:border-chat-light transition-colors"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-2">
                                <Mail size={18} />
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-gray-100 dark:bg-chat-dark/50 border border-gray-300 dark:border-chat-grey/50 rounded-lg py-3 px-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-chat-grey focus:outline-none focus:border-blue-500 dark:focus:border-chat-light transition-colors"
                                required
                            />
                        </div>

                        {/* Gender & Birthdate */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-2">
                                    <User size={18} />
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full bg-gray-100 dark:bg-chat-dark/50 border border-gray-300 dark:border-chat-grey/50 rounded-lg py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-chat-light transition-colors"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-2">
                                    <Calendar size={18} />
                                    Birthdate
                                </label>
                                <input
                                    type="date"
                                    name="birthdate"
                                    value={formData.birthdate}
                                    onChange={handleChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-gray-100 dark:bg-chat-dark/50 border border-gray-300 dark:border-chat-grey/50 rounded-lg py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-chat-light transition-colors"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-2">
                                <MapPin size={18} />
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g., Istanbul, Turkey"
                                className="w-full bg-gray-100 dark:bg-chat-dark/50 border border-gray-300 dark:border-chat-grey/50 rounded-lg py-3 px-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-chat-grey focus:outline-none focus:border-blue-500 dark:focus:border-chat-light transition-colors"
                            />
                        </div>

                        {/* Save Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-chat-light dark:hover:bg-white text-white dark:text-chat-dark font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={20} />
                                Save Changes
                            </button>
                            {saved && (
                                <p className="text-green-500 dark:text-green-400 text-center mt-3 text-sm">✓ Profile saved successfully!</p>
                            )}
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Profile;
