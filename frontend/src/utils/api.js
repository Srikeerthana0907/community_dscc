const PRIMARY_URL = import.meta.env.VITE_API_PRIMARY_URL || 'https://community-dscc.onrender.com/api';
const SECONDARY_URL = import.meta.env.VITE_API_SECONDARY_URL || 'https://community-dscc.vercel.app/api';

export const getApiUrl = async () => {
    try {
        const response = await fetch(`${PRIMARY_URL}/health`, { method: 'HEAD', timeout: 3000 });
        if (response.ok) return PRIMARY_URL;
    } catch (error) {
        console.warn('Primary server unreachable, falling back to secondary');
    }
    return SECONDARY_URL;
};

export const fetchWithFallback = async (endpoint, options = {}) => {
    // Try primary
    try {
        const res = await fetch(`${PRIMARY_URL}${endpoint}`, options);
        if (res.ok || res.status < 500) return res;
    } catch (err) {
        console.warn(`Primary server failed for ${endpoint}, trying secondary...`);
    }

    // Try secondary
    return fetch(`${SECONDARY_URL}${endpoint}`, options);
};

export const API_BASE_URL = PRIMARY_URL; // Default for static references if needed
export const SECONDARY_BASE_URL = SECONDARY_URL;
