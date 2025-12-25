import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { login, register } from '../services/mockData';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let user;
            if (isLogin) {
                user = await login(formData.email, formData.password);
            } else {
                user = await register(formData.username, formData.email, formData.password);
            }

            // Save to local storage
            localStorage.setItem('chat_user', JSON.stringify(user));
            navigate('/');
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-chat-dark flex items-center justify-center p-4">
            <div className="bg-[#565666] p-8 rounded-xl shadow-2xl w-full max-w-md border border-chat-grey/30">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-chat-light">
                        {isLogin ? 'Enter your credentials to access the chat' : 'Join the community today'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-chat-light" size={20} />
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-chat-dark/50 border border-chat-grey/50 rounded-lg py-3 pl-10 pr-4 text-white placeholder-chat-grey focus:outline-none focus:border-chat-light transition-colors"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-chat-light" size={20} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-chat-dark/50 border border-chat-grey/50 rounded-lg py-3 pl-10 pr-4 text-white placeholder-chat-grey focus:outline-none focus:border-chat-light transition-colors"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-chat-light" size={20} />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-chat-dark/50 border border-chat-grey/50 rounded-lg py-3 pl-10 pr-4 text-white placeholder-chat-grey focus:outline-none focus:border-chat-light transition-colors"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#6a6a7a] hover:bg-[#7a7a8a] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6 active:scale-[0.98] transform"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-chat-light">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-white font-medium hover:underline focus:outline-none"
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
