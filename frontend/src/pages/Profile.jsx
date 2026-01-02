import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Calendar, Save, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Avatar from 'boring-avatars';
import { Datepicker } from 'flowbite-react';
import { userService } from '../services/api';

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
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const user = await userService.getMe();
            setCurrentUser(user);
            setFormData({
                username: user.username || '',
                email: user.email || '',
                gender: user.gender || '',
                birthdate: user.birthdate || '',
                location: user.location || ''
            });
        } catch (error) {
            console.error("Failed to fetch profile", error);
            const localUser = JSON.parse(localStorage.getItem('chat_user') || '{}');
            if (!localUser.id) navigate('/auth');
            else setCurrentUser(localUser);
        } finally {
            setLoading(false);
        }
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = await userService.updateMe(formData);
            setCurrentUser(updatedUser);
            localStorage.setItem('chat_user', JSON.stringify(updatedUser));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Update failed: " + (error.response?.data?.message || error.message));
        }
    };

    if (loading || !currentUser) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-chat-dark">
                <Loader2 className="animate-spin text-chat-light" size={40} />
            </div>
        );
    }

    const age = calculateAge(formData.birthdate);

    return (
        <div className="h-full overflow-y-auto bg-gray-50 dark:bg-chat-dark">
            <div className="max-w-3xl mx-auto p-6 pb-12">
                {/* Header */}
                <div className="mb-6 animate-fadeIn">
                    <button
                        onClick={() => navigate('/app')}
                        className="flex items-center gap-2 text-gray-600 dark:text-chat-light hover:text-gray-900 dark:hover:text-white transition-colors mb-4 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">User Profile</h1>
                    <p className="text-gray-600 dark:text-chat-light mt-1">Manage your personal information and account settings</p>
                </div>

                {/* Profile Card with Glow */}
                <div className="relative group animate-slideUp">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-chat-light rounded-2xl opacity-20 blur group-hover:opacity-40 transition duration-500"></div>

                    <div className="relative bg-white dark:bg-[#464655] rounded-2xl shadow-2xl mb-6 overflow-hidden border border-chat-grey/20">
                        {/* Avatar Section */}
                        <div className="bg-[#3b3b4d] p-10 text-center border-b border-chat-grey/20 relative">
                            <div className="relative inline-block p-2 bg-white/10 rounded-full mb-4 shadow-2xl">
                                <Avatar
                                    size={140}
                                    name={currentUser.username}
                                    variant="beam"
                                    colors={['#00D1FF', '#6366f1', '#a855f7', '#ec4899', '#f43f5e']}
                                />
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-[#3b3b4d] rounded-full"></div>
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">{currentUser.username}</h2>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <span className="px-3 py-1 bg-chat-light/20 text-chat-light text-[10px] font-bold uppercase tracking-widest rounded-full border border-chat-light/30">
                                    {currentUser.platformRole || 'USER'}
                                </span>
                                {age && (
                                    <span className="px-3 py-1 bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                        {age} Years Old
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Form Section */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    label="Username"
                                    icon={<User size={18} />}
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                                <FormInput
                                    label="Email Address"
                                    icon={<Mail size={18} />}
                                    name="email"
                                    value={formData.email}
                                    disabled
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-sm mb-2">
                                        <User size={18} className="text-chat-light" />
                                        Gender
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full bg-gray-100 dark:bg-chat-dark/30 border border-gray-300 dark:border-chat-grey/20 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-chat-light transition-all"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-sm mb-2">
                                        <Calendar size={18} className="text-chat-light" />
                                        Birthdate
                                    </label>
                                    <div className="flowbite-datepicker-container">
                                        <Datepicker
                                            value={formData.birthdate ? new Date(formData.birthdate) : null}
                                            onSelectedDateChanged={(date) => {
                                                const formattedDate = date.toISOString().split('T')[0];
                                                setFormData(prev => ({ ...prev, birthdate: formattedDate }));
                                                setSaved(false);
                                            }}
                                            maxDate={new Date()}
                                            theme={{
                                                root: { base: "relative w-full" },
                                                popup: { root: { base: "absolute top-10 z-50 block pt-2" } }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <FormInput
                                label="Location (Galaxy/Sector)"
                                icon={<MapPin size={18} />}
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Milky Way, Earth"
                            />

                            {/* Save Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] ${saved
                                        ? 'bg-green-500 text-white'
                                        : 'bg-chat-light hover:bg-white text-chat-dark hover:shadow-chat-light/20 '
                                        }`}
                                >
                                    {saved ? <CheckCircle size={22} /> : <Save size={22} />}
                                    {saved ? 'IDENTITY UPDATED' : 'SAVE CHANGES'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slideUp { animation: slideUp 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

const FormInput = ({ label, icon, name, value, onChange, required, disabled, placeholder }) => (
    <div>
        <label className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-sm mb-2">
            {icon && <span className="text-chat-light">{icon}</span>}
            {label}
            {required && <span className="text-red-400">*</span>}
        </label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full bg-gray-100 dark:bg-chat-dark/30 border border-gray-300 dark:border-chat-grey/20 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-chat-light transition-all ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''
                }`}
            required={required}
        />
    </div>
);

export default Profile;
