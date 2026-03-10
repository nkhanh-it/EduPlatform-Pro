import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token: string | null) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('auth_token', token);
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
        localStorage.removeItem('auth_token');
    }
};

// Initialize token from storage across reloads
const token = localStorage.getItem('auth_token');
if (token) {
    setAuthToken(token);
}

export default apiClient;
import { User } from "./apiTypes";
export const fetchUser = async () => {};
