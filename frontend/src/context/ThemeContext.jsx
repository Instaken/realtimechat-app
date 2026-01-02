import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('chat_theme');
        const initialTheme = saved || 'light';

        // Apply theme class immediately on mount
        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }

        return initialTheme;
    });

    useEffect(() => {
        console.log('Theme changed to:', theme);
        localStorage.setItem('chat_theme', theme);

        // Add or remove 'dark' class based on theme
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
            console.log('Added dark class to html and body');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
            console.log('Removed dark class from html and body');
        }
        console.log('HTML classes:', document.documentElement.className);
    }, [theme]);

    const toggleTheme = () => {
        console.log('Toggle theme clicked, current:', theme);
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
