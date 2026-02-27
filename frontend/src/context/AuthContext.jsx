import { createContext, useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to validate token with backend
    const validateToken = async (token) => {
        try {
            console.log('Validating token with backend...');
            const response = await fetch(`${API_URL}/validate-token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Token validation response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Token is valid');
                return true;
            } else {
                console.log('Token validation failed');
                return false;
            }
        } catch (err) {
            console.error('Token validation error:', err);
            return false;
        }
    };

    useEffect(() => {
        // Check if user is already logged in by validating token
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        console.log('AuthContext initializing...');
        console.log('Stored Token:', storedToken ? 'Present' : 'Missing');
        console.log('Stored User:', storedUser ? 'Present' : 'Missing');

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log('Parsed user:', parsedUser);
                
                // Validate token with backend
                validateToken(storedToken).then((isValid) => {
                    if (isValid) {
                        console.log('User restored from localStorage:', parsedUser);
                        setUser(parsedUser);
                    } else {
                        console.log('Stored token is invalid, clearing localStorage');
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        setUser(null);
                        setError('Session expired. Please login again.');
                    }
                    setLoading(false);
                });
            } catch (err) {
                console.error('Error parsing stored user:', err);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setUser(null);
                setLoading(false);
            }
        } else {
            console.log('No stored token or user found, showing login page');
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        try {
            setError(null);
            console.log('Logging in with:', credentials.username);
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            console.log('Login response status:', response.status);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Login failed');
            }

            const data = await response.json();
            console.log('Login successful, storing user:', data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            setUser(data.user);
            setError(null);
            return data;
        } catch (err) {
            console.error('Login error:', err.message);
            setError(err.message);
            throw err;
        }
    };

    const register = async (credentials) => {
        try {
            setError(null);
            console.log('Registering user:', credentials.username);
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            console.log('Register response status:', response.status);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Registration failed');
            }

            const data = await response.json();
            console.log('Registration successful');
            setError(null);
            return data;
        } catch (err) {
            console.error('Register error:', err.message);
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        console.log('Logging out user');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setError(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
};
