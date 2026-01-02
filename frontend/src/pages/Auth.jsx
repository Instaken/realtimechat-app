import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Loader2, Eye, EyeOff, Moon, Sun, Calendar } from 'lucide-react';
import { authService } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        birthdate: '2000-01-01', // Default for now
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                // Backend 'identifier' beklentisini karşılamak için username alanını gönderiyoruz
                await authService.login(formData.username, formData.password);
            } else {
                await authService.register(formData);
                setIsLogin(true);
                setError('Registration successful! Please login.');
                setLoading(false);
                return;
            }

            navigate('/app');
        } catch (err) {
            console.error("Auth Error:", err.response?.data);
            // Hata objesinde 'path' veya 'message' alanlarının varlığını kontrol ederek hata mesajını oluşturur
            const msg = err.response?.data?.errors
                ? err.response.data.errors.map(e => `${e.path ? e.path.join('.') : 'Error'}: ${e.message}`).join(' | ')
                : (err.response?.data?.message || err.message || 'An error occurred');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-chat-dark flex items-center justify-center p-4 relative">
            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 p-3 text-gray-600 dark:text-chat-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-chat-grey/20 rounded-lg transition-colors shadow-md"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            <div className="bg-white dark:bg-[#565666] p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-chat-grey/30">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-gray-600 dark:text-chat-light">
                        {isLogin ? 'Enter your credentials to access the chat' : 'Join the community today'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-600 dark:text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-chat-light" size={20} />
                        <input
                            type="text"
                            name="username"
                            placeholder={isLogin ? "Username or E-mail" : "Username"}
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full bg-gray-100 dark:bg-chat-dark/50 border border-gray-300 dark:border-chat-grey/50 rounded-lg py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-chat-grey focus:outline-none focus:border-gray-500 dark:focus:border-chat-light transition-colors"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-chat-light" size={20} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-gray-100 dark:bg-chat-dark/50 border border-gray-300 dark:border-chat-grey/50 rounded-lg py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-chat-grey focus:outline-none focus:border-gray-500 dark:focus:border-chat-light transition-colors"
                                required
                            />
                        </div>
                    )}

                    {!isLogin && (
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-chat-light" size={20} />
                            <input
                                type="date"
                                name="birthdate"
                                value={formData.birthdate}
                                onChange={handleChange}
                                className="w-full bg-gray-100 dark:bg-chat-dark/50 border border-gray-300 dark:border-chat-grey/50 rounded-lg py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-chat-grey focus:outline-none focus:border-gray-500 dark:focus:border-chat-light transition-colors"
                                required
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-chat-light" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-gray-100 dark:bg-chat-dark/50 border border-gray-300 dark:border-chat-grey/50 rounded-lg py-3 pl-10 pr-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-chat-grey focus:outline-none focus:border-gray-500 dark:focus:border-chat-light transition-colors"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-chat-light hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-700 hover:bg-gray-800 dark:bg-[#6a6a7a] dark:hover:bg-[#7a7a8a] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6 active:scale-[0.98] transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 dark:text-chat-light">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-gray-900 dark:text-white font-medium hover:underline focus:outline-none"
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
