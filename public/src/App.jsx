'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// =================================================================================
// ICONS (using lucide-react for modern, clean icons)
// =================================================================================

const Home = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const PawPrint = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="4" r="2" /><circle cx="18" cy="8" r="2" /><circle cx="20" cy="16" r="2" /><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-7 0V15a5 5 0 0 1 5-5z" /><path d="M12 14v6" /><path d="M8 14v6" /><path d="M16 14v6" />
    </svg>
);

const LayoutDashboard = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
);

const User = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);


const LogOut = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
    </svg>
);

const Briefcase = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);

const CalendarDays = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

const ClipboardList = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
);

const ShieldCheck = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

const PlusCircle = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg>
);

const Edit = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);

const Trash2 = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

const Dog = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-2.434 2.344-4.5z"/>
        <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-2.434-2.344-4.5z"/>
        <path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75z"/><path d="M4.42 11.247A5 5 0 0 1 9 10h6a5 5 0 0 1 4.58 1.247"/><path d="M2 17h20"/>
    </svg>
);

const Search = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const DollarSign = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

const Building = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
);

const Send = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);

const ChevronLeft = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>
);

const ChevronRight = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
);

const Clock = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const CreditCard = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
);

const ExternalLink = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
);

const MapPin = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

const Phone = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);

const RefreshCw = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

const Star = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const Flag = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
);

const LifeBuoy = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>
);

const Utensils = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/></svg>
);

const Footprints = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4 16v-2.38c0-.94.84-1.68 1.76-1.58 1.41.15 2.24.88 2.24 2.43V16"/>
        <path d="M4.78 12.12a2.5 2.5 0 0 1 0-4.24c.95-.95 2.5-1.41 3.72-.28 1.22 1.13 1.05 3.21-.28 4.24"/>
        <path d="M10 20v-2.38c0-.94.84-1.68 1.76-1.58 1.41.15 2.24.88 2.24 2.43V20"/>
        <path d="M10.78 16.12a2.5 2.5 0 0 1 0-4.24c.95-.95 2.5-1.41 3.72-.28 1.22 1.13 1.05 3.21-.28 4.24"/>
        <path d="M16 12V9.62c0-.94.84-1.68 1.76-1.58 1.41.15 2.24.88 2.24 2.43V12"/>
        <path d="M16.78 8.12a2.5 2.5 0 0 1 0-4.24c.95-.95 2.5-1.41 3.72-.28 1.22 1.13 1.05 3.21-.28 4.24"/>
    </svg>
);

const Info = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
);

const Bell = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);

const X = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const MessageSquare = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

// =================================================================================
// UTILITY FUNCTIONS
// =================================================================================

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

// Helper function to format any date to YYYY-MM-DD format for HTML date inputs
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};


// =================================================================================
// LIVE API SERVICE
// =================================================================================

// Use environment-aware API URL
const API_BASE_URL = import.meta.env.PROD 
    ? 'https://pet-care-service-1.onrender.com/api'  // Your actual backend URL + /api
    : '/api'; // Use Vite proxy in development

// Helper function to handle fetch requests and responses
const fetchApi = async (url, options = {}) => {
    const token = localStorage.getItem('pet_care_token');
    
    // Default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add authorization token if it exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, { ...options, headers });
        
        // Parse JSON response
        let jsonData;
        try {
            jsonData = await response.json();
        } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            throw new Error(`Server returned invalid JSON. Status: ${response.status}`);
        }
        
        // If response is not ok (status 400, 401, 500, etc.), log the error details
        if (!response.ok) {
            console.error('API Error Response:', {
                url,
                status: response.status,
                statusText: response.statusText,
                data: jsonData
            });
            
            // Check for deleted account or authentication issues
            if (response.status === 401 || response.status === 403 || response.status === 404) {
                const errorMessage = jsonData.message || '';
                if (errorMessage.includes('User not found') || 
                    errorMessage.includes('not found') ||
                    errorMessage.includes('unauthorized') ||
                    errorMessage.includes('token')) {
                    
                    console.warn('User account may have been deleted or token expired. Clearing session.');
                    // Clear the invalid session data
                    localStorage.removeItem('pet_care_user');
                    localStorage.removeItem('pet_care_token');
                    
                    // Force page reload to redirect to login
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                }
            }
            
            // Return the error data from server for proper error handling
            return {
                success: false,
                ...jsonData // This includes error, message, details, etc.
            };
        }
        
        return jsonData;
    } catch (error) {
        console.error('API Fetch Error:', error);
        return { success: false, error: 'Network error or server is unreachable.' };
    }
};


const api = {
    auth: {
        login: (email, password) => fetchApi(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),
        startVerification: (formData) => fetchApi(`${API_BASE_URL}/auth/start-verification`, {
            method: 'POST',
            body: JSON.stringify(formData)
        }),
        verifyRegistrationEmail: (sessionId, emailCode) => fetchApi(`${API_BASE_URL}/auth/verify-registration-email`, {
            method: 'POST',
            body: JSON.stringify({ sessionId, emailCode })
        }),
        completeRegistration: (sessionId) => fetchApi(`${API_BASE_URL}/auth/complete-registration`, {
            method: 'POST',
            body: JSON.stringify({ sessionId })
        }),
        logout: (token) => fetchApi(`${API_BASE_URL}/auth/logout`, { method: 'POST' }),
        forgotPassword: (email) => fetchApi(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            body: JSON.stringify({ email })
        }),
        resetPassword: (data) => fetchApi(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    },

    profile: {
        get: () => fetchApi(`${API_BASE_URL}/profile`),
        update: (data) => fetchApi(`${API_BASE_URL}/profile`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: () => fetchApi(`${API_BASE_URL}/profile`, { method: 'DELETE' }),
        getProviderProfile: (providerId) => fetchApi(`${API_BASE_URL}/profile/provider/${providerId}`),
        getProviders: (filters = {}) => {
            const query = new URLSearchParams(filters).toString();
            return fetchApi(`${API_BASE_URL}/profile/providers?${query}`);
        },
    },

    pets: {
        getAll: () => fetchApi(`${API_BASE_URL}/pets`),
        getById: (id) => fetchApi(`${API_BASE_URL}/pets/${id}`),
        create: (petData) => fetchApi(`${API_BASE_URL}/pets`, {
            method: 'POST',
            body: JSON.stringify(petData)
        }),
        update: (petId, petData) => fetchApi(`${API_BASE_URL}/pets/${petId}`, {
            method: 'PUT',
            body: JSON.stringify(petData)
        }),
        delete: (petId) => fetchApi(`${API_BASE_URL}/pets/${petId}`, { method: 'DELETE' }),
    },
    
    diet: {
        getForPet: (petId) => fetchApi(`${API_BASE_URL}/diet/pet/${petId}`),
        add: (petId, dietData) => fetchApi(`${API_BASE_URL}/diet/pet/${petId}`, {
            method: 'POST',
            body: JSON.stringify(dietData)
        }),
        update: (dietId, dietData) => fetchApi(`${API_BASE_URL}/diet/${dietId}`, {
            method: 'PUT',
            body: JSON.stringify(dietData)
        }),
        delete: (dietId) => fetchApi(`${API_BASE_URL}/diet/${dietId}`, { method: 'DELETE' })
    },
    
    activity: {
        getForPet: (petId) => fetchApi(`${API_BASE_URL}/activity/pet/${petId}`),
        add: (petId, activityData) => fetchApi(`${API_BASE_URL}/activity/pet/${petId}`, {
            method: 'POST',
            body: JSON.stringify(activityData)
        }),
        update: (activityId, activityData) => fetchApi(`${API_BASE_URL}/activity/${activityId}`, {
            method: 'PUT',
            body: JSON.stringify(activityData)
        }),
        delete: (activityId) => fetchApi(`${API_BASE_URL}/activity/${activityId}`, { method: 'DELETE' })
    },

    petSchedule: {
        get: () => fetchApi(`${API_BASE_URL}/pet-schedule`),
        getForPet: (petId) => fetchApi(`${API_BASE_URL}/pet-schedule/pet/${petId}`),
        add: (scheduleData) => fetchApi(`${API_BASE_URL}/pet-schedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scheduleData)
        }),
        update: (scheduleId, scheduleData) => fetchApi(`${API_BASE_URL}/pet-schedule/${scheduleId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scheduleData)
        }),
        delete: (scheduleId) => fetchApi(`${API_BASE_URL}/pet-schedule/${scheduleId}`, { method: 'DELETE' })
    },
    
    scheduleDashboard: {
        getForOwner: () => fetchApi(`${API_BASE_URL}/schedule/dashboard`),
        getForProvider: () => fetchApi(`${API_BASE_URL}/schedule/provider-dashboard`),
    },

    services: {
        search: (params) => {
            const query = new URLSearchParams(params).toString();
            return fetchApi(`${API_BASE_URL}/services/search?${query}`);
        },
        getById: (id) => fetchApi(`${API_BASE_URL}/services/${id}`),
        getTypes: () => fetchApi(`${API_BASE_URL}/services/types`),
        getByIdForManager: (serviceId) => fetchApi(`${API_BASE_URL}/services/${serviceId}/manager-details`),
        getForProvider: () => fetchApi(`${API_BASE_URL}/services/my-services`),
        create: (serviceData) => fetchApi(`${API_BASE_URL}/services/submit`, {
             method: 'POST',
             body: JSON.stringify(serviceData)
        }),
        update: (serviceId, serviceData) => fetchApi(`${API_BASE_URL}/services/${serviceId}/update`, {
            method: 'PUT',
            body: JSON.stringify(serviceData)
        }),
        updateApproved: (serviceId, serviceData) => fetchApi(`${API_BASE_URL}/services/${serviceId}/update-approved`, {
            method: 'PUT',
            body: JSON.stringify(serviceData)
        }),
        updatePending: (serviceId, serviceData) => fetchApi(`${API_BASE_URL}/services/${serviceId}/update-pending`, {
            method: 'PUT',
            body: JSON.stringify(serviceData)
        }),
        approve: (serviceId) => fetchApi(`${API_BASE_URL}/services/${serviceId}/review`, {
            method: 'POST',
            body: JSON.stringify({ action: 'approve' })
        }),
        reject: (serviceId, reason) => fetchApi(`${API_BASE_URL}/services/${serviceId}/review`, {
            method: 'POST',
            body: JSON.stringify({ action: 'reject', rejectionReason: reason })
        }),
        delete: (serviceId) => fetchApi(`${API_BASE_URL}/services/${serviceId}`, {
            method: 'DELETE'
        }),
    },

    bookings: {
        create: (bookingData) => fetchApi(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            body: JSON.stringify(bookingData)
        }),
        getForOwner: () => fetchApi(`${API_BASE_URL}/bookings`),
        getForProvider: () => fetchApi(`${API_BASE_URL}/bookings/provider/requests`),
        getById: (id) => fetchApi(`${API_BASE_URL}/bookings/${id}`),
        getRequestDetails: (bookingId) => fetchApi(`${API_BASE_URL}/bookings/provider/requests/${bookingId}`),
        updateStatus: (bookingId, status) => fetchApi(`${API_BASE_URL}/bookings/provider/requests/${bookingId}/${status}`, {
            method: 'POST'
        }),
        cancel: (bookingId) => fetchApi(`${API_BASE_URL}/bookings/${bookingId}`, { method: 'DELETE' }),
    },
    
    reviews: {
        getForService: (serviceId) => fetchApi(`${API_BASE_URL}/reviews/service/${serviceId}`),
        getForProvider: (providerId) => fetchApi(`${API_BASE_URL}/reviews/provider/${providerId}`),
        add: (serviceId, userId, userName, reviewData) => fetchApi(`${API_BASE_URL}/reviews/booking/${reviewData.bookingId}`, {
            method: 'POST',
            body: JSON.stringify({ stars: reviewData.rating, comment: reviewData.comment })
        }),
    },
    
    reports: {
        create: (reportData) => fetchApi(`${API_BASE_URL}/reports/booking/${reportData.bookingId}`, {
            method: 'POST',
            body: JSON.stringify({ text: reportData.reason, image: reportData.image })
        }),
        getSummary: () => fetchApi(`${API_BASE_URL}/reports/admin/summary`),
        getForProvider: (providerId) => fetchApi(`${API_BASE_URL}/reports/provider/${providerId}`),
    },
    
    helpdesk: {
        create: (ticketData, user) => fetchApi(`${API_BASE_URL}/ticket/booking/${ticketData.bookingId}/open`, {
            method: 'POST',
            body: JSON.stringify(ticketData)
        }),
        getForUser: (userId) => fetchApi(`${API_BASE_URL}/ticket/archived`),
        getAll: () => fetchApi(`${API_BASE_URL}/ticket/archived`), // No manager specific endpoint for all tickets
        getReplies: (ticketId) => fetchApi(`${API_BASE_URL}/ticket/${ticketId}/replies`),
        addManagerReply: (ticketId, message, user) => fetchApi(`${API_BASE_URL}/ticket/${ticketId}/reply-manager`, {
            method: 'POST',
            body: JSON.stringify({ message })
        }),
        addUserReply: (ticketId, message, user) => fetchApi(`${API_BASE_URL}/ticket/${ticketId}/reply-user`, {
            method: 'POST',
            body: JSON.stringify({ message })
        }),
    },
    
    notifications: {
        getAll: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return fetchApi(`${API_BASE_URL}/notifications?${query}`);
        },
        getStats: () => fetchApi(`${API_BASE_URL}/notifications/stats`),
        markAsRead: (id) => fetchApi(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' }),
        markAllAsRead: () => fetchApi(`${API_BASE_URL}/notifications/read-all`, { method: 'PUT' }),
        delete: (id) => fetchApi(`${API_BASE_URL}/notifications/${id}`, { method: 'DELETE' }),
    },
    
    chat: {
        getConversations: () => fetchApi(`${API_BASE_URL}/chat/conversations`),
        getChatUpdates: (bookingId) => fetchApi(`${API_BASE_URL}/chat/booking/${bookingId}`),
        sendMessage: (bookingId, messageText, user) => fetchApi(`${API_BASE_URL}/chat/booking/${bookingId}/message`, {
            method: 'POST',
            body: JSON.stringify({ text: messageText })
        }),
        getMessageImage: (bookingId, updateNumber) => fetchApi(`${API_BASE_URL}/chat/message/${bookingId}/${updateNumber}/image`),
    }
};

// =================================================================================
// AUTHENTICATION CONTEXT
// =================================================================================

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // const [user, setUser] = useState(null);
    // const [isAuthenticated, setIsAuthenticated] = useState(false);
    // const [loading, setLoading] = useState(true);

    // const login = async (email, password) => {
    //     setLoading(true);
    //     const response = await api.auth.login(email, password);
    //     if (response.success) {
    //         setUser(response.user);
    //         setIsAuthenticated(true);
    //         localStorage.setItem('pet_care_user', JSON.stringify(response.user));
    //     }
    //     setLoading(false);
    //     return response;
    // };

    // const logout = async () => {
    //     setLoading(true);
    //     await api.auth.logout();
    //     setUser(null);
    //     setIsAuthenticated(false);
    //     localStorage.removeItem('pet_care_user');
    //     setLoading(false);
    // };

    // useEffect(() => {
    //     const storedUser = localStorage.getItem('pet_care_user');
    //     if (storedUser) {
    //         setUser(JSON.parse(storedUser));
    //         setIsAuthenticated(true);
    //     }
    //     setLoading(false);
    // }, []);

    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const login = async (email, password) => {
        setLoading(true);
        const response = await api.auth.login(email, password);
        if (response.success && response.token) {
            // Store both user object and the token
            localStorage.setItem('pet_care_user', JSON.stringify(response.user));
            localStorage.setItem('pet_care_token', response.token); // STORE THE TOKEN
            setUser(response.user);
            setIsAuthenticated(true);
        }
        setLoading(false);
        return response;
    };

    const logout = async () => {
        setLoading(true);
        // Pass token to backend logout if needed for blacklisting
        const token = localStorage.getItem('pet_care_token');
        await api.auth.logout(token);
        
        // Clear user data and token from storage
        localStorage.removeItem('pet_care_user');
        localStorage.removeItem('pet_care_token'); // REMOVE THE TOKEN
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('pet_care_user');
        const storedToken = localStorage.getItem('pet_care_token');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);


    const value = useMemo(() => ({
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        setUser, // Expose setUser to update user info after profile edit
    }), [user, isAuthenticated, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

// =================================================================================
// REUSABLE UI COMPONENTS
// =================================================================================

const TimeSlotManager = ({ slots, onChange }) => {
    const [newTime, setNewTime] = useState('09:00');

    const handleAddTime = () => {
        if (newTime && !slots.includes(newTime)) {
            const newSlots = [...slots, newTime].sort();
            onChange(newSlots);
        }
    };

    const handleRemoveTime = (timeToRemove) => {
        const newSlots = slots.filter(slot => slot !== timeToRemove);
        onChange(newSlots);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Time Slots</label>
            <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900/50 dark:border-gray-600 min-h-[80px]">
                {slots.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {slots.map(slot => (
                            <span key={slot} className="flex items-center gap-2 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                {slot}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTime(slot)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No time slots added yet.</p>
                )}
            </div>
            <div className="flex gap-2 mt-2">
                <Input
                    label=""
                    name="newTime"
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                />
                <Button type="button" onClick={handleAddTime} className="self-end">Add</Button>
            </div>
        </div>
    );
};

const NotificationIcon = ({ type, className = "h-6 w-6" }) => {
    const iconMap = {
        booking_accepted: <ShieldCheck className={className} />,
        booking_request: <ClipboardList className={className} />,
        diet: <Utensils className={className} />,
        activity: <Footprints className={className} />,
        service_approved: <Briefcase className={className} />,
        service_rejected: <Briefcase className={className} />,
        service_pending: <Briefcase className={className} />,
        review: <Star className={className} />,
        chat: <MessageSquare className={className} />,
        report: <Flag className={className} />,
        ticket_new: <LifeBuoy className={className} />,
        general: <Info className={className} />,
    };

    const colors = {
        booking_accepted: "text-green-500",
        booking_request: "text-cyan-500",
        diet: "text-purple-500",
        activity: "text-pink-500",
        service_approved: "text-blue-500",
        service_rejected: "text-red-500",
        service_pending: "text-yellow-500",
        review: "text-yellow-400",
        chat: "text-indigo-500",
        report: "text-red-600",
        ticket_new: "text-orange-500",
        general: "text-gray-500",
    }

    return React.cloneElement(iconMap[type] || <Bell className={className} />, { className: `${className} ${colors[type] || 'text-gray-500'}` });
};

const Card = ({ children, className = '', ...props }) => (
    <div {...props} className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
        {children}
    </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) => {
    const baseClasses = 'px-4 py-2 rounded-md font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';
    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };
    return (
        <button type={type} onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`} disabled={disabled}>
            {children}
        </button>
    );
};

const Input = ({ label, type = 'text', value, onChange, placeholder, name, disabled = false, min, error, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <div className="relative">
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                required={required}
                className={`w-full pl-3 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border rounded-md shadow-sm focus:outline-none sm:text-sm text-gray-900 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-600 ${
                    error 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }`}
            />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

const TextArea = ({ label, value, onChange, placeholder, name, rows="3" }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
        />
    </div>
);

const Select = ({ label, value, onChange, name, children, disabled=false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
        >
            {children}
        </select>
    </div>
);

const Checkbox = ({ label, checked, onChange, name }) => (
    <div className="flex items-center">
        <input
            id={name}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={name} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            {label}
        </label>
    </div>
)

const Spinner = () => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl leading-none">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

const StarRating = ({ rating, className }) => {
    return (
        <div className={`flex items-center ${className}`}>
            {[...Array(5)].map((_, index) => (
                <Star key={index} className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
            ))}
        </div>
    );
};

const ProgressBar = ({ currentStep, totalSteps }) => {
    const percentage = ((currentStep - 1) / (totalSteps -1)) * 100;
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
        </div>
    )
};

const ChatMessageImage = ({ bookingId, updateNumber }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImage = async () => {
            setLoading(true);
            const res = await api.chat.getMessageImage(bookingId, updateNumber);
            if (res.success) {
                // Construct the data URL from the received Base64 string
                const url = `data:${res.content_type};base64,${res.image}`;
                setImageUrl(url);
            }
            setLoading(false);
        };
        fetchImage();
    }, [bookingId, updateNumber]);

    if (loading) {
        return <div className="w-48 h-32 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center"><Spinner /></div>;
    }

    if (!imageUrl) {
        return <div className="w-48 h-32 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center text-xs text-red-500">Image not found</div>;
    }

    return <img src={imageUrl} alt={`Update for booking ${bookingId}`} className="mb-2 rounded-lg max-w-xs" />;
};

// In REUSABLE UI COMPONENTS section, update TypeaheadInput

const TypeaheadInput = ({ label, value, onChange, placeholder, name, suggestions, suggestionKey, onSelect }) => {
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleChange = (e) => {
        const userInput = e.target.value;
        onChange(e); // Propagate the change up to the form's state

        if (userInput) {
            const filtered = suggestions.filter(
                suggestion => {
                    const suggestionText = suggestionKey ? suggestion[suggestionKey] : suggestion;
                    return suggestionText.toLowerCase().indexOf(userInput.toLowerCase()) > -1
                }
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
            onSelect(null); // Clear selection when input is empty
        }
    };

    const onSuggestionClick = (suggestion) => {
        const suggestionText = suggestionKey ? suggestion[suggestionKey] : suggestion;
        const syntheticEvent = { target: { name, value: suggestionText } };
        onChange(syntheticEvent); // Update the text in the input box
        onSelect(suggestion); // Pass the whole suggestion object to the parent
        setFilteredSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="relative">
            <Input
                label={label}
                name={name}
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                autoComplete="off"
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // Hide on blur
                onFocus={handleChange} // Show suggestions on focus if there's text
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {filteredSuggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onMouseDown={() => onSuggestionClick(suggestion)} // Use onMouseDown to prevent blur event firing first
                            className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                            {suggestionKey ? suggestion[suggestionKey] : suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// ===== NEW FEATURE: ADD REVIEWS =====
// A reusable star rating input component for forms.
const StarRatingInput = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
        <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <Star
                        key={index}
                        className={`w-8 h-8 cursor-pointer transition-colors ${
                            (hoverRating || rating) >= starValue
                                ? 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                        }`}
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                    />
                );
            })}
        </div>
    );
};

// ===== NEW FEATURE: ADD REVIEWS =====
// A modal form for submitting a new review.
const ReviewFormModal = ({ isOpen, onClose, onSubmit, serviceName, reviewToEdit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a star rating.");
            return;
        }
        setIsSubmitting(true);
        await onSubmit({ rating, comment });
        setIsSubmitting(false);
        onClose();
    };

    // Reset form when modal opens
    useEffect(() => {
        if(isOpen) {
            if (reviewToEdit) {
                setRating(reviewToEdit.stars);
                setComment(reviewToEdit.comment);
            } else {
                setRating(0);
                setComment('');
            }
            setIsSubmitting(false);
        }
    }, [isOpen, reviewToEdit]);


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${reviewToEdit ? 'Edit' : 'Write a'} Review for "${serviceName}"`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overall Rating</label>
                    <StarRatingInput rating={rating} setRating={setRating} />
                </div>
                <TextArea
                    label="Your Comment"
                    name="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="5"
                    placeholder="Tell us about your experience..."
                />
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting || rating === 0}>
                        {isSubmitting ? <Spinner/> : 'Submit Review'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

// Add this new component to your file, near other modal components

const UserTicketDetailModal = ({ isOpen, onClose, ticket }) => {
    const { user } = useAuth();
    const [replies, setReplies] = useState([]);
    const [newReply, setNewReply] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && ticket) {
            const fetchReplies = async () => {
                setLoading(true);
                const res = await api.helpdesk.getReplies(ticket.id);
                if (res.success) {
                    setReplies(res.replies);
                }
                setLoading(false);
            };
            fetchReplies();
        }
    }, [isOpen, ticket]);

    const handleSendReply = async () => {
        if (!newReply.trim() || !ticket) return;
        await api.helpdesk.addUserReply(ticket.id, newReply, user);
        setNewReply("");
        // Refresh replies after sending
        const res = await api.helpdesk.getReplies(ticket.id);
        if (res.success) setReplies(res.replies);
    };

    if (!isOpen || !ticket) return null;

    const allMessages = [
        { isOriginal: true, message: ticket.description, created_at: ticket.date, role: user.role },
        ...replies
    ].sort((a,b) => new Date(a.created_at) - new Date(b.created_at));


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Ticket #${ticket.id}: ${ticket.subject}`}>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {loading ? <Spinner/> : allMessages.map((msg, index) => {
                    const isMyMessage = msg.role === user.role;
                    return (
                        <div key={index} className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-md rounded-lg px-3 py-2 ${isMyMessage ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <p className="text-sm">{msg.message}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 px-1">
                                {msg.role} &bull; {new Date(msg.created_at).toLocaleString()}
                            </p>
                        </div>
                    )
                })}
            </div>
            {ticket.status === 'open' ? (
                <div className="pt-4 border-t mt-2">
                    <TextArea label="Your Reply" value={newReply} onChange={(e) => setNewReply(e.target.value)} rows="3" />
                    <div className="mt-2 flex justify-end">
                        <Button onClick={handleSendReply}>Send Reply</Button>
                    </div>
                </div>
            ) : (
                <p className="text-center font-semibold text-green-600 dark:text-green-400 pt-4 border-t mt-2">This ticket has been resolved.</p>
            )}
        </Modal>
    );
};

// --- Booking Form Modal ---

const BookingFormModal = ({ isOpen, onClose, onSubmit, service, pets }) => {
    const [selectedPetIds, setSelectedPetIds] = useState([]);
    const [selectedDate, setSelectedDate] = useState(getCurrentDate());
    const [selectedSlot, setSelectedSlot] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if(service?.timeslots?.length > 0) {
            setSelectedSlot(service.timeslots[0]);
        }
    }, [service]);

    const handlePetSelection = (petId) => {
        setSelectedPetIds(prev =>
            prev.includes(petId)
                ? prev.filter(id => id !== petId)
                : [...prev, petId]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedPetIds.length === 0) {
            alert("Please select at least one pet.");
            return;
        }
        if (!selectedDate || !selectedSlot) {
            alert("Please select a date and time slot.");
            return;
        }
        onSubmit({
            serviceid: service.serviceid,
            petids: selectedPetIds,
            servedate: selectedDate,
            slot: selectedSlot,
            notes: notes
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Book: ${service?.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <h4 className="font-semibold text-lg">${service?.price}</h4>
                    <p className="text-sm text-gray-500">{service?.description}</p>
                </div>

                <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Pet(s)</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                        {pets.length > 0 ? pets.map(pet => (
                            <Checkbox
                                key={pet.petid}
                                name={`pet-${pet.petid}`}
                                label={pet.name}
                                checked={selectedPetIds.includes(pet.petid)}
                                onChange={() => handlePetSelection(pet.petid)}
                            />
                        )) : <p className="text-sm text-gray-500">No pets found. Please add a pet first.</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Date" type="date" name="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={getCurrentDate()} />
                    <Select label="Time Slot" name="slot" value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
                        {service?.timeslots?.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                    </Select>
                </div>

                <TextArea label="Notes for Provider (optional)" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" />

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={selectedPetIds.length === 0}>Request Booking</Button>
                </div>
            </form>
        </Modal>
    );
}

// Add this new component to your file, near other modal components

const BookingRequestDetailModal = ({ isOpen, onClose, onAction, bookingId }) => {
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && bookingId) {
            const fetchDetails = async () => {
                setLoading(true);
                const res = await api.bookings.getRequestDetails(bookingId);
                if (res.success) {
                    setRequest(res.booking);
                }
                setLoading(false);
            };
            fetchDetails();
        }
    }, [isOpen, bookingId]);

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Booking Request Details">
            {loading ? <Spinner /> : !request ? <p>Could not load request details.</p> : (
                <div className="space-y-4 text-sm">
                    {/* CONFLICT WARNING */}
                    {request.hasConflicts && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 text-red-700 dark:text-red-300">
                            <h4 className="font-bold">Schedule Conflict Detected!</h4>
                            <p className="text-sm mt-1">
                                Accepting this request will conflict with another confirmed booking at the same time:
                            </p>
                            <ul className="list-disc pl-5 mt-2">
                                {request.conflicts.map(c => <li key={c.bookid}>Booking for "{c.other_service_name}"</li>)}
                            </ul>
                        </div>
                    )}

                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">Customer Information</h3>
                        <p>{request.pet_owner_name}</p>
                        <p>{request.customer_email}</p>
                        <p>{request.customer_phone}</p>
                    </div>

                    <div className="pt-2 border-t">
                        <h3 className="font-semibold text-gray-800 dark:text-white">Booking Details</h3>
                        <p><strong>Service:</strong> {request.service_name}</p>
                        <p><strong>Date:</strong> {new Date(request.servedate).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {request.slot}</p>
                    </div>

                    <div className="pt-2 border-t">
                        <h3 className="font-semibold text-gray-800 dark:text-white">Pet(s) for this Service</h3>
                        {request.pets.map(pet => (
                            <div key={pet.petid} className="p-2 mt-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                                <p className="font-medium">{pet.name} <span className="font-normal text-gray-500 dark:text-gray-400">({pet.breed})</span></p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="secondary" onClick={() => onAction(request.bookid, 'rejected')}>Reject</Button>
                        <Button onClick={() => onAction(request.bookid, 'confirmed')} disabled={request.hasConflicts}>
                            {request.hasConflicts ? "Conflict" : "Accept"}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

// --- NEW COMPONENT: ServiceFilter ---

const ServiceFilter = ({ filters, setFilters, serviceTypes }) => {

    const [typeaheadValue, setTypeaheadValue] = useState('');


    const handleTypeaheadChange = (e) => {
        const { value } = e.target;
        setFilters(prev => ({
            ...prev,
            serviceTypeName: value,
            typeids: value ? prev.typeids : []
        }));
    };

    const handleSuggestionSelect = (suggestion) => {
        if (suggestion) {
            setFilters(prev => ({
                ...prev,
                typeids: [suggestion.typeid],
                serviceTypeName: suggestion.type   // Set the name for display
            }));
        } else {
            // This handles clearing the selection
            setFilters(prev => ({ ...prev, typeids: [], serviceTypeName: '' }));
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    }

    return (
        <Card className="w-full lg:w-80 flex-shrink-0">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold mb-2">Service Type</h3>
                    <TypeaheadInput
                        label=""
                        name="service_type_filter"
                        value={filters.serviceTypeName} // Binds to parent state
                        onChange={handleTypeaheadChange}
                        placeholder="Search by service type..."
                        suggestions={serviceTypes}
                        suggestionKey="type"
                        onSelect={handleSuggestionSelect}
                    />
                </div>
                <div className="border-t pt-6">
                    <h3 className="font-semibold mb-2">Price Range</h3>
                    <div className="flex gap-2 items-center">
                        <Input name="minPrice" type="number" placeholder="Min" value={filters.minPrice} onChange={handleFilterChange} />
                        <span>-</span>
                        <Input name="maxPrice" type="number" placeholder="Max" value={filters.maxPrice} onChange={handleFilterChange} />
                    </div>
                </div>
                <div className="border-t pt-6">
                    <h3 className="font-semibold mb-2">Sort By</h3>
                    <div className="flex gap-2 items-center">
                        <Select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                            <option value="name">Name</option>
                            <option value="price">Price</option>
                        </Select>
                        <Select name="sortOrder" value={filters.sortOrder} onChange={handleFilterChange}>
                            <option value="asc">Asc</option>
                            <option value="desc">Desc</option>
                        </Select>
                    </div>
                </div>
            </div>
        </Card>
    );
};


// =================================================================================
// LAYOUT COMPONENTS
// =================================================================================

const MainLayout = ({ children, setPage }) => {
    const { isAuthenticated } = useAuth();
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <a href="#" onClick={(e) => { e.preventDefault(); setPage('home'); }} className="flex-shrink-0 flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400">
                                <PawPrint />
                                PetCare
                            </a>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <a href="#" onClick={(e) => { e.preventDefault(); setPage('services'); }} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Browse Services</a>
                                { !isAuthenticated && <a href="#" onClick={(e) => { e.preventDefault(); setPage('login'); }} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Login</a>}
                                { !isAuthenticated && <Button onClick={() => setPage('register')}>Register</Button>}
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
            <main>
                {children}
            </main>
        </div>
    )
};

const DashboardLayout = ({ children, setPage, page }) => {
    const { user, logout } = useAuth();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const notifDropdownRef = React.useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notifDropdownRef]);

    // A map to convert page keys to friendly titles
    const pageTitles = {
        ownerDashboard: "Dashboard",
        myPets: "My Pets",
        petDetail: "Pet Details",
        schedule: "My Schedule",
        services: "Browse Services",
        serviceDetail: "Service Details",
        profile: "My Profile",
        helpDesk: "Help Desk",
        providerDashboard: "Provider Dashboard",
        myServices: "My Services",
        bookingRequests: "Booking Requests",
        managerDashboard: "Manager Dashboard",
        serviceApprovals: "Service Approvals",
        supportTickets: "Support Tickets",
        notifications: "Notifications",
    };

    // NEW: Fetch notification stats periodically
    useEffect(() => {
        const fetchStats = async () => {
            const res = await api.notifications.getStats();
            if (res.success) {
                setUnreadCount(res.stats.unread);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const ownerNav = [
        { name: 'Dashboard', icon: LayoutDashboard, page: 'ownerDashboard' },
        { name: 'My Pets', icon: Dog, page: 'myPets' },
        { name: 'Schedule', icon: CalendarDays, page: 'schedule' },
        { name: 'Browse Services', icon: Search, page: 'services' },
        { name: 'Browse Providers', icon: Building, page: 'browseProviders' },
        { name: 'Profile', icon: User, page: 'profile' },
        { name: 'Help Desk', icon: LifeBuoy, page: 'helpDesk' },
        { name: 'Messages', icon: MessageSquare, page: 'conversations' },
    ];

    const providerNav = [
        { name: 'Dashboard', icon: LayoutDashboard, page: 'providerDashboard' },
        { name: 'My Schedule', icon: CalendarDays, page: 'providerSchedule' },
        { name: 'My Services', icon: Briefcase, page: 'myServices' },
        { name: 'Booking Requests', icon: ClipboardList, page: 'bookingRequests' },
        { name: 'My Reports', icon: Flag, page: 'providerReports' },
        { name: 'Profile', icon: User, page: 'profile' },
        { name: 'Help Desk', icon: LifeBuoy, page: 'helpDesk' },
        { name: 'Messages', icon: MessageSquare, page: 'conversations' },
        { name: 'My Reviews', icon: Star, page: 'providerReviews' },
    ];

    const managerNav = [
        { name: 'Dashboard', icon: LayoutDashboard, page: 'managerDashboard' },
        { name: 'Service Approvals', icon: ShieldCheck, page: 'serviceApprovals' },
        { name: 'Support Tickets', icon: LifeBuoy, page: 'supportTickets' },
        { name: 'User Reports', icon: Flag, page: 'managerReports' },
        { name: 'Browse Providers', icon: Building, page: 'browseProviders' },
        { name: 'Profile', icon: User, page: 'profile' },
    ];

    const navItems = user?.role === 'Pet owner' ? ownerNav :
        user?.role === 'Service provider' ? providerNav :
            managerNav;

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
                <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700">
                    <a href="#" onClick={(e) => { e.preventDefault(); setPage(navItems[0].page); }} className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400">
                        <PawPrint />
                        PetCare
                    </a>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {navItems.map((item) => (
                        <a
                            key={item.name}
                            href="#"
                            onClick={(e) => { e.preventDefault(); setPage(item.page); }}
                            className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${page === item.page ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            <item.icon className="h-6 w-6 mr-3" />
                            {item.name}
                        </a>
                    ))}
                </nav>
                <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center px-2 py-2">
                        <User className="h-8 w-8 mr-3 rounded-full bg-gray-200 p-1 text-gray-600 dark:bg-gray-700 dark:text-gray-300" />
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
                        </div>
                    </div>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); logout(); }}
                        className="mt-2 w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <LogOut className="h-6 w-6 mr-3" />
                        Logout
                    </a>
                </div>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white dark:bg-gray-800 shadow-sm">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="h-16 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl font-semibold text-gray-800 dark:text-white truncate">{pageTitles[page] || "PetCare"}</h1>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative" ref={notifDropdownRef}>
                                    <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <Bell />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                                            </span>
                                        )}
                                    </button>
                                    {isNotifOpen && <NotificationsDropdown setPage={setPage} navigate={setPage} closeDropdown={() => setIsNotifOpen(false)} />}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

const ChatPanel = ({ conversation }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = React.useRef(null);
    const { user } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            if (!conversation) return;
            setLoading(true);
            const res = await api.bookings.getChatUpdates(conversation.bookid);
            if (res.success) {
                setMessages(res.updates);
            }
            setLoading(false);
        };
        fetchMessages();
    }, [conversation]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const res = await api.chat.sendMessage(conversation.bookid, newMessage, user);
        if(res.success) {
            setMessages(prev => [...prev, res.update]);
            setNewMessage("");
        }
    };

    if (!conversation) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <MessageSquare className="w-16 h-16 text-gray-400 mb-4"/>
                <h3 className="text-lg font-semibold">Select a conversation</h3>
                <p className="text-sm text-gray-500">Your chat history will appear here.</p>
            </div>
        );
    }

    const otherPartyName = user.role === 'Pet owner' ? conversation.provider_name : conversation.owner_name;

    const canChat = conversation && ['confirmed', 'in-progress', 'completed'].includes(conversation.status);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold">Chat with {otherPartyName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Regarding: {conversation.service_name}</p>
            </header>
            <main className="flex-1 p-4 space-y-4 overflow-y-auto">
                {loading ? <Spinner /> : messages.map((msg, i) => {
                    const isMyMessage = (user.role === 'Pet owner' && msg.from === 'owner') || (user.role === 'Service provider' && msg.from === 'provider');
                    return (
                        <div key={i} className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                            {!isMyMessage && <User className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 p-1"/>}
                            <div className={`max-w-xs lg:max-w-md rounded-lg px-3 py-2 ${isMyMessage ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>

                                {/* UPDATED: Replaced img tag with the new component */}
                                {msg.image && (
                                    <ChatMessageImage bookingId={conversation.bookid} updateNumber={msg.no_update} />
                                )}

                                {msg.text && <p className="text-sm">{msg.text}</p>}
                                <p className={`text-xs mt-1 opacity-70 ${isMyMessage ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>{msg.timestamp}</p>
                            </div>
                            {isMyMessage && <User className="h-8 w-8 rounded-full bg-blue-500 text-white p-1"/>}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </main>
            {canChat ? (
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSendMessage} className="relative">
                        <Input name="chat" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                        <Button type="submit" className="!p-2 absolute right-1 top-1/2 -translate-y-1/2"><Send size={18}/></Button>
                    </form>
                </footer>
            ) : (
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500">
                    Messaging is disabled for this booking status.
                </footer>
            )}
        </div>
    )
}


const AppointmentCard = ({ booking, navigate, setSelectedBookingId }) => {
    const statusConfig = {
        pending: { color: 'yellow', icon: <Clock size={16}/> },
        confirmed: { color: 'blue', icon: <CalendarDays size={16}/> },
        'in-progress': { color: 'green', icon: <PawPrint size={16}/> },
        completed: { color: 'gray', icon: <ShieldCheck size={16}/> },
        cancelled: { color: 'red', icon: <X size={16}/> },
    };

    const currentStatus = statusConfig[booking.status] || statusConfig.completed;

    const handleCardClick = () => {
        setSelectedBookingId(booking.bookid);
        navigate('bookingDetail');
    }

    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg">{booking.service_name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">with {booking.provider_name}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize bg-${currentStatus.color}-100 text-${currentStatus.color}-800 dark:bg-${currentStatus.color}-900/50 dark:text-${currentStatus.color}-300`}>
                        {booking.status}
                    </span>
                </div>
                <div className="flex-grow my-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                        <CalendarDays size={16}/>
                        <span>{new Date(booking.servedate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {booking.slot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Dog size={16}/>
                        <span>For: {booking.pets.map(p => p.name).join(', ')}</span>
                    </div>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 text-right">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">${booking.price}</span>
                </div>
            </div>
        </Card>
    )
}

// =================================================================================
// PAGE COMPONENTS
// =================================================================================

const ProviderBookingDetailPage = ({ bookingId, goBack, onAction }) => {
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            setLoading(true);
            const res = await api.bookings.getForProviderById(bookingId);
            if (res.success) {
                setBooking(res.booking);
            }
            setLoading(false);
        };
        if (bookingId) {
            fetchBookingDetails();
        }
    }, [bookingId]);

    if (loading) return <div className="p-8"><Spinner/></div>;
    if (!booking) return <div className="p-8 text-center">Booking details could not be loaded.</div>;

    const { owner, service, pets, status } = booking;
    const canTakeAction = status === 'pending';
    const isConfirmed = status === 'confirmed' || status === 'in-progress' || status === 'completed';

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Button onClick={goBack} variant="secondary" className="mb-6 flex items-center gap-2">
                <ChevronLeft size={16} /> Back to Schedule
            </Button>

            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{service.name}</h1>
                <p className="text-md text-gray-500 dark:text-gray-400">Booking Request from {owner.name}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">Customer Information</h2>
                        <p><strong>Name:</strong> {owner.name}</p>
                        <p><strong>Email:</strong> {owner.email}</p>
                        <p><strong>Phone:</strong> {owner.phone}</p>
                    </Card>
                    <Card>
                        <h2 className="text-xl font-bold mb-4">Pet(s) for this Service</h2>
                        {pets.map(pet => {
                            const placeholderImage = "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100' height='100' fill='%23e5e7eb'/%3e%3ctext x='50' y='50' font-size='12' text-anchor='middle' dy='.3em' fill='%23374151'%3eNo Image%3c/text%3e%3c/svg%3e";
                            return (
                                <div key={pet.petid} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg not-last:mb-2">
                                    <img 
                                        src={pet.picture || placeholderImage} 
                                        alt={pet.name} 
                                        className="h-16 w-16 rounded-full object-cover"
                                        onError={(e) => { e.target.src = placeholderImage; }}
                                    />
                                    <div>
                                        <h3 className="font-bold">{pet.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{pet.breed}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </Card>
                </div>

                <aside className="lg:col-span-1 sticky top-24">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">Booking Status: <span className="capitalize">{status}</span></h2>
                        <div className="space-y-4">
                            <div className="border-b pb-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Date</span>
                                    <span>{new Date(booking.servedate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Time</span>
                                    <span>{booking.slot}</span>
                                </div>
                            </div>
                            {canTakeAction && (
                                <div className="space-y-2">
                                    <Button onClick={() => onAction(booking.bookid, 'confirmed')} className="w-full">Accept Request</Button>
                                    <Button onClick={() => onAction(booking.bookid, 'rejected')} variant="danger" className="w-full">Reject Request</Button>
                                </div>
                            )}
                            {isConfirmed && (
                                <Button onClick={() => alert('Feature to initiate chat from here is coming soon!')} className="w-full">Chat with Owner</Button>
                            )}
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    );
};

const ServiceApprovalDetailPage = ({ serviceId, goBack, onDecision }) => {
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const res = await api.services.getByIdForManager(serviceId);
            if (res.success) {
                setService(res.service);
            }
            setLoading(false);
        };
        fetchDetails();
    }, [serviceId]);

    const handleApprove = () => {
        if (window.confirm(`Are you sure you want to approve the service "${service.name}"?`)) {
            onDecision(service.serviceid, 'approve');
        }
    };

    const openRejectModal = () => {
        setIsRejectModalOpen(true);
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }
        onDecision(service.serviceid, 'reject', rejectionReason);
        setIsRejectModalOpen(false);
    };

    if (loading) return <div className="p-8"><Spinner/></div>;
    if (!service) return <div className="p-8 text-center">Service details could not be loaded.</div>;

    const { provider } = service;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Button onClick={goBack} variant="secondary" className="mb-6 flex items-center gap-2">
                <ChevronLeft size={16} /> Back to Approvals List
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">Service Details</h2>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{service.name}</h3>
                        <p className="text-md text-gray-500 dark:text-gray-400 mb-4">{service.service_type}</p>
                        <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div><strong className="block text-gray-500">Price</strong> ${service.price}</div>
                            <div><strong className="block text-gray-500">Duration</strong> {service.duration}</div>
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-bold mb-4">Provider Information</h2>
                        <p><strong>Business Name:</strong> {provider?.business_name}</p>
                        <p><strong>Contact Name:</strong> {provider?.name}</p>
                        <p><strong>Address:</strong> {provider?.address}</p>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-bold mb-4">License Information</h2>
                        {service.license ? (
                            <img src={service.license} alt="Service License" className="max-h-80 rounded-lg"/>
                        ) : (
                            <p className="text-gray-500">No license was provided for this service.</p>
                        )}
                    </Card>
                </div>

                <aside className="lg:col-span-1 sticky top-24">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">Actions</h2>
                        <div className="space-y-3">
                            <Button onClick={handleApprove} className="w-full">Approve Service</Button>
                            <Button onClick={openRejectModal} variant="danger" className="w-full">Reject Service</Button>
                        </div>
                    </Card>
                </aside>
            </div>

            <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Reject Service">
                <div className="space-y-4">
                    <p>Please provide a clear reason for rejecting this service.</p>
                    <TextArea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows="4" placeholder="e.g., Incomplete description, pricing unclear..."/>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleReject}>Confirm Rejection</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const HomePage = ({ setPage }) => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white">
                The Best Care for Your <span className="text-blue-600 dark:text-blue-400">Best Friend</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                Find trusted and verified pet sitters, walkers, and groomers near you. All in one place.
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <Button onClick={() => setPage('services')} className="px-8 py-3 text-lg">Browse Services</Button>
                <Button onClick={() => setPage('register')} variant="secondary" className="px-8 py-3 text-lg">Become a Provider</Button>
            </div>
        </div>

        <div className="mt-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6">
                    <ShieldCheck className="mx-auto h-12 w-12 text-green-500"/>
                    <h3 className="mt-6 text-lg font-medium text-gray-900 dark:text-white">Verified & Trusted</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-400">Every service provider is carefully vetted for your peace of mind.</p>
                </div>
                <div className="p-6">
                    <CalendarDays className="mx-auto h-12 w-12 text-blue-500"/>
                    <h3 className="mt-6 text-lg font-medium text-gray-900 dark:text-white">Flexible Scheduling</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-400">Book services that fit your schedule, from one-time walks to daily daycare.</p>
                </div>
                <div className="p-6">
                    <PawPrint className="mx-auto h-12 w-12 text-yellow-500"/>
                    <h3 className="mt-6 text-lg font-medium text-gray-900 dark:text-white">Comprehensive Care</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-400">From walking and sitting to grooming and training, find it all here.</p>
                </div>
            </div>
        </div>
    </div>
);

const LoginPage = ({ setPage }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showVerificationError, setShowVerificationError] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setShowVerificationError(false);

        try {
            console.log('Attempting login for:', email);
            const res = await login(email, password);
            console.log('Login response:', res);

            if (!res.success) {
                // Check for the specific verification error
                if (res.error === 'Account verification required') {
                    setShowVerificationError(true);
                } else {
                    const errorMessage = res.error || res.message || 'Login failed. Please check your credentials.';
                    console.log('Setting error message:', errorMessage);
                    setError(errorMessage);
                }
            }
            // On success, the AuthProvider handles the redirect and loading state
        } catch (error) {
            console.error('Login error:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            // Always set loading to false, regardless of success or failure
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Sign in to your account
                    </h2>
                </div>
                <Card className="mt-8 space-y-6">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input label="Email address" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="owner@test.com" />
                        <Input label="Password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        {showVerificationError && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300">
                                <h4 className="font-bold">Verification Required</h4>
                                <p className="text-sm mt-1">
                                    You must verify your email before you can log in. Please check your inbox for a verification code or link.
                                </p>
                                <button className="font-bold text-sm mt-2 hover:underline">Resend Verification</button>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                {/* UPDATED: This link now navigates to the new page */}
                                <a href="#" onClick={(e) => { e.preventDefault(); setPage('forgotPassword'); }} className="font-medium text-blue-600 hover:text-blue-500">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <Button type="submit" className="w-full justify-center" disabled={loading}>
                                {loading ? <Spinner /> : 'Sign in'}
                            </Button>
                        </div>
                    </form>
                    <p className="text-center text-sm">
                        Don't have an account?{' '}
                        <a href="#" onClick={(e) => { e.preventDefault(); setPage('register'); }} className="font-medium text-blue-600 hover:text-blue-500">
                            Register here
                        </a>
                    </p>
                </Card>
            </div>
        </div>
    );
};

const RegisterPage = ({ setPage }) => {
    const { login } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
    email: '', password: '', role: 'Pet owner', username: '', gender: 'Other',
    phone: '', city: '', address: '', business_name: '', license: '', website: '', description: '', logo: ''
});

    const [sessionId, setSessionId] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({}); 

    const isProvider = formData.role === 'Service provider';
    const totalSteps = isProvider ? 5 : 4;

    const handleChange = (e) => {
        const { name, value } = e.target;

        // --- DEBUGGING: See what is being updated ---
        console.log(`Updating field: ${name}, New value: ${value}`);
        // -------------------------------------------

        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Set the base64 string to the logo field in formData
                setFormData(prev => ({ ...prev, logo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNextStep = () => setStep(s => s + 1);
    const handlePrevStep = () => setStep(s => s - 1);

    const handleStartVerification = async () => {
      console.log("Data being sent to backend:", formData); 
    setLoading(true);
    setError('');
    setValidationErrors({}); // Clear previous validation errors

    const res = await api.auth.startVerification(formData);
    setLoading(false);

    if (res.success) {
        setSessionId(res.sessionId);
        handleNextStep();
    } else {
        // Handle detailed validation errors from the backend
        if (res.details && Array.isArray(res.details)) {
            const newErrors = {};
            res.details.forEach(detail => {
                if (detail.toLowerCase().includes('username')) newErrors.username = detail;
                if (detail.toLowerCase().includes('email')) newErrors.email = detail;
                if (detail.toLowerCase().includes('password')) newErrors.password = detail;
                if (detail.toLowerCase().includes('phone')) newErrors.phone = detail;
                if (detail.toLowerCase().includes('business name')) newErrors.business_name = detail;
            });
            setValidationErrors(newErrors);
            setError('Please fix the errors below.');
        } else {
            setError(res.error || 'Registration failed.');
        }
    }
};

    const handleComplete = async () => {
        setLoading(true);
        setError('');
        if (!sessionId) {
            setError("Session is invalid. Please start over.");
            setLoading(false);
            return;
        }
        const verifyRes = await api.auth.verifyRegistrationEmail(sessionId, verificationCode);

        if (verifyRes.success) {
            const completeRes = await api.auth.completeRegistration(sessionId);
            if (completeRes.success) {
                await login(formData.email, formData.password);
            } else {
                setError(completeRes.error || 'Could not complete registration.');
                setLoading(false);
            }
        } else {
            setError(verifyRes.error || 'Verification failed.');
            setLoading(false);
        }
    };

    // This function correctly determines which action the "Next/Submit" button should take.
    const getButtonAction = () => {
        const isLastInfoStep = (isProvider && step === 4) || (!isProvider && step === 3);

        if (isLastInfoStep) return handleStartVerification;
        if (step === totalSteps) return handleComplete;
        return handleNextStep;
    };

    const renderStep = () => {
        switch(step) {
            case 1: // Role Selection
                return (
                    <div className="space-y-6 text-center">
                        <h3 className="text-xl font-bold">What brings you to PetCare?</h3>
                        <div className="flex gap-4 justify-center">
                            {/* FIX: Changed nextStep() to handleNextStep() */}
                            <button onClick={() => {setFormData({...formData, role: 'Pet owner'}); handleNextStep();}} className="p-8 border-2 border-blue-500 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 w-48">
                                <Dog className="mx-auto h-12 w-12"/>
                                <span className="font-semibold mt-2 block">I'm a Pet Owner</span>
                            </button>
                            <button onClick={() => {setFormData({...formData, role: 'Service provider'}); handleNextStep();}} className="p-8 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 dark:border-gray-600 w-48">
                                <Briefcase className="mx-auto h-12 w-12"/>
                                <span className="font-semibold mt-2 block">I'm a Provider</span>
                            </button>
                        </div>
                    </div>
                );
            case 2: // Account Credentials
                return (
                  <div className="space-y-6">
                      <h3 className="text-lg font-medium">Step 2: Account Credentials</h3>
                      <div>
                          <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
                          {/* THIS LINE DISPLAYS THE ERROR */}
                          {validationErrors.email && <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>}
                      </div>
                      <div>
                          <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
                          {/* THIS LINE DISPLAYS THE ERROR */}
                          {validationErrors.password && <p className="text-sm text-red-600 mt-1">{validationErrors.password}</p>}
                          <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters and contain letters and numbers.</p>
                      </div>
                  </div>
                );
            case 3: // Personal Details
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium">Step 3: Tell Us About Yourself</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input label="Full Name" name="username" value={formData.username} onChange={handleChange} />
                                {/* THIS LINE DISPLAYS THE ERROR */}
                                {validationErrors.username && <p className="text-sm text-red-600 mt-1">{validationErrors.username}</p>}
                            </div>
                            <div>
                                <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                                {/* THIS LINE DISPLAYS THE ERROR */}
                                {validationErrors.phone && <p className="text-sm text-red-600 mt-1">{validationErrors.phone}</p>}
                            </div>
                        </div>
                        <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                            <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </Select>
                        </div>
                    </div>
                );
            case 4: // Provider Details OR Verification
                if (isProvider) {
                    return (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium">Step 4: Provider Information</h3>
                            <div>
                                <Input 
                                    label="Business Name" 
                                    name="business_name"  // <-- VERIFY THIS NAME IS EXACTLY "business_name"
                                    value={formData.business_name} 
                                    onChange={handleChange} 
                                />
                                {validationErrors.business_name && <p className="text-sm text-red-600 mt-1">{validationErrors.business_name}</p>}
                            </div>
                            <div>
                                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Logo</label>
                                <input
                                    type="file"
                                    id="logo"
                                    name="logo"
                                    accept="image/png, image/jpeg"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {formData.logo && typeof formData.logo === 'string' && (
                                    <div className="mt-4">
                                        <img src={formData.logo} alt="Logo preview" className="w-24 h-24 object-cover rounded-lg" />
                                    </div>
                                )}
                            </div>

                            {/* REMOVED: Business License input field */}

                            <Input label="Website (optional)" name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com"/>
                            <TextArea label="Business Description" name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Tell pet owners about your services..."/>
                        </div>
                    )
                }
                // Fallthrough for Pet Owners to the verification step
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium">Final Step: Verify Your Email</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">We've sent a 6-digit verification code to <span className="font-medium text-gray-800 dark:text-white">{formData.email}</span>. Please enter it below.</p>
                        <Input label="Verification Code" name="verificationCode" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} />
                        <a href="#" onClick={(e) => e.preventDefault()} className="text-sm font-medium text-blue-600 hover:text-blue-500 block text-center mt-2">Resend Code</a>
                    </div>
                );
            case 5: // Verification for Providers
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium">Final Step: Verify Your Email</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">We've sent a 6-digit verification code to <span className="font-medium text-gray-800 dark:text-white">{formData.email}</span>. Please enter it below.</p>
                        <Input label="Verification Code" name="verificationCode" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} />
                        <a href="#" onClick={(e) => e.preventDefault()} className="text-sm font-medium text-blue-600 hover:text-blue-500 block text-center mt-2">Resend Code</a>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">Create your account</h2>
                <p className="text-center mt-2 text-gray-500 dark:text-gray-400">Join our community of pet lovers and providers!</p>

                <div className="mt-8 space-y-4">
                    <ProgressBar currentStep={step} totalSteps={totalSteps} />
                    <Card className="mt-8">
                        {/* FIX: Changed renderStepContent() to renderStep() */}
                        {renderStep()}
                        {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}

                        {/* FIX: Removed the flawed handleNext function and simplified the button logic */}
                        <div className="flex justify-between mt-8 pt-4 border-t">
                            <Button onClick={handlePrevStep} variant="secondary" disabled={loading || step === 1}>
                                Back
                            </Button>
                            <Button onClick={getButtonAction()} disabled={loading}>
                                {loading ? <Spinner/> : (step === totalSteps ? "Verify & Complete" : "Next")}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
// --- Pet Owner Pages ---

const PetOwnerDashboard = ({ setPage, setSelectedBookingId, openReviewModal }) => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', serviceType: '', startDate: '', endDate: '' });

    const fetchDashboard = async () => {
        setLoading(true);
        // This now uses the new, more powerful dashboard endpoint
        const res = await api.scheduleDashboard.getForOwner(filters);
        if (res.success) {
            setDashboardData(res.dashboard);
        }
        setLoading(false);
    }

    useEffect(() => {
        if(user) {
            fetchDashboard();
        }
    }, [user, filters]); // Refetch when filters change

    if (loading) return <div className="p-8"><Spinner /></div>;
    if (!dashboardData) return <div className="p-8">Could not load dashboard.</div>;

    const { statistics, appointments } = dashboardData;

    const statCards = [
        { label: "Total Appointments", value: statistics.totalAppointments, icon: <ClipboardList/> },
        { label: "Upcoming", value: statistics.upcomingAppointments, icon: <CalendarDays/> },
        { label: "Completed", value: statistics.completedAppointments, icon: <ShieldCheck/> },
        { label: "Total Spent", value: `$${statistics.totalSpent.toFixed(2)}`, icon: <DollarSign/> },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name?.split(' ')[0]}!</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map(stat => (
                    <Card key={stat.label}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                                {React.cloneElement(stat.icon, { size: 24 })}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card>
                <h2 className="text-xl font-bold mb-4">All Appointments</h2>
                {/* Future filter controls can be added here */}
                {appointments.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {appointments.map(booking => (
                            <AppointmentCard key={booking.bookid} booking={booking} navigate={setPage} setSelectedBookingId={setSelectedBookingId} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No appointments found.</p>
                        <Button onClick={() => setPage('services')} className="mt-4">Book Your First Service</Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

// --- My Pets Page ---

const PetFormModal = ({ isOpen, onClose, onSave, pet }) => {
    const [formData, setFormData] = useState({ name: '', breed: '', age: '', dob: '', description: '', picture: '' });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (pet) {
            setFormData({
                name: pet.name || '',
                breed: pet.breed || '',
                age: pet.age || '',
                dob: formatDateForInput(pet.dob) || '',
                description: pet.description || '',
                picture: pet.picture || ''
            });
        } else {
            setFormData({ name: '', breed: '', age: '', dob: '', description: '', picture: '' });
        }
        setErrors({}); // Clear errors when modal opens/closes
        setIsSubmitting(false); // Reset submitting state when modal opens/closes
    }, [pet, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, picture: reader.result });
                
                // Clear picture error when image is uploaded
                if (errors.picture) {
                    setErrors({ ...errors, picture: '' });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isSubmitting) return;
        
        // Validate required fields
        const newErrors = {};
        
        if (!formData.name || !formData.name.trim()) {
            newErrors.name = 'Pet name is required';
        }
        
        if (!formData.breed || !formData.breed.trim()) {
            newErrors.breed = 'Pet breed is required';
        }
        
        if (!formData.picture) {
            newErrors.picture = 'Pet picture is required';
        }
        
        // If there are validation errors, show them and don't submit
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        // Clear errors and submit
        setErrors({});
        setIsSubmitting(true);
        
        try {
            await onSave(formData);
        } catch (error) {
            console.error('Error saving pet:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={pet ? 'Edit Pet' : 'Add a New Pet'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    label="Pet Name *" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Buddy" 
                    required
                    error={errors.name}
                />
                <Input 
                    label="Breed *" 
                    name="breed" 
                    value={formData.breed} 
                    onChange={handleChange} 
                    placeholder="Golden Retriever" 
                    required
                    error={errors.breed}
                />
                <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="5" />
                <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                <TextArea label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Loves walks and belly rubs..."/>

                <div>
                    <label htmlFor="picture" className={`block text-sm font-medium mb-1 ${errors.picture ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                        Pet Picture *
                        <span className="text-xs text-gray-500 ml-1">(JPG/PNG, max 5MB)</span>
                    </label>
                    <input
                        type="file"
                        id="picture"
                        name="picture"
                        accept="image/png, image/jpeg"
                        onChange={handleImageUpload}
                        className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                            errors.picture ? 'border border-red-500 rounded-md' : ''
                        }`}
                        required={!pet} // Only required for new pets
                    />
                    {errors.picture && <p className="mt-1 text-sm text-red-600">{errors.picture}</p>}
                    {formData.picture && <img src={formData.picture} alt="Pet preview" className="mt-2 h-24 w-24 object-cover rounded-md" />}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Pet'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

const PetCard = ({ pet, onEdit, onDelete, navigate, setSelectedPetId, isDeleting = false }) => {
    // Placeholder image for pets without pictures
    const placeholderImage = "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100' height='100' fill='%23e5e7eb'/%3e%3ctext x='50' y='50' font-size='12' text-anchor='middle' dy='.3em' fill='%23374151'%3eNo Image%3c/text%3e%3c/svg%3e";
    
    return (
        <Card className="flex flex-col text-center cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setSelectedPetId(pet.petid); navigate('petDetail'); }}>
            <img 
                src={pet.picture || placeholderImage} 
                alt={pet.name} 
                className="w-full h-48 object-cover rounded-lg mb-4" 
                onError={(e) => { e.target.src = placeholderImage; }}
            />
            <h3 className="text-xl font-bold">{pet.name}</h3>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-2">
                <Button variant="secondary" onClick={(e) => { e.stopPropagation(); onEdit(pet); }} disabled={isDeleting}>Edit</Button>
                <Button variant="danger" onClick={(e) => { e.stopPropagation(); onDelete(pet.petid); }} disabled={isDeleting}>
                    {isDeleting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        'Delete'
                    )}
                </Button>
            </div>
        </Card>
    );
};

const MyPetsPage = ({ navigate, setSelectedPetId }) => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [deletingPets, setDeletingPets] = useState(new Set()); // Track pets being deleted

    const fetchPets = async () => {
        setLoading(true);
        try {
            const res = await api.pets.getAll();
            console.log('Fetch pets response:', res); // Debug log
            if (res && res.pets) {
                console.log('Setting pets:', res.pets); // Debug log
                setPets(res.pets);
            } else if (res && res.success === false) {
                console.error('Failed to fetch pets:', res.error || res.message);
                setPets([]);
            } else {
                console.warn('Unexpected response format:', res);
                setPets([]);
            }
        } catch (error) {
            console.error('Error fetching pets:', error);
            setPets([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPets();
    }, []);

    const handleAddPet = () => {
        setSelectedPet(null);
        setIsModalOpen(true);
    };

    const handleEditPet = (pet) => {
        setSelectedPet(pet);
        setIsModalOpen(true);
    };

    const handleDeletePet = async (petId) => {
        // Prevent multiple deletions of the same pet
        if (deletingPets.has(petId)) {
            console.log('🛑 Pet deletion already in progress for ID:', petId);
            return;
        }

        if(window.confirm("Are you sure you want to delete this pet?")) {
            // Add to deleting set
            setDeletingPets(prev => new Set(prev).add(petId));
            
            try {
                console.log('🗑️ Deleting pet with ID:', petId);
                await api.pets.delete(petId);
                console.log('✅ Pet deleted successfully');
                fetchPets();
            } catch (error) {
                console.error('❌ Error deleting pet:', error);
                // You could show an error toast here
            } finally {
                // Remove from deleting set
                setDeletingPets(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(petId);
                    return newSet;
                });
            }
        }
    };

    const handleSavePet = async (formData) => {
        try {
            console.log('Saving pet with data:', formData); // Debug log
            let result;
            if (selectedPet) {
                result = await api.pets.update(selectedPet.petid, formData);
            } else {
                result = await api.pets.create(formData);
            }
            
            console.log('Save pet result:', result); // Debug log
            
            // Check if the API call was successful
            if (result && result.success === false) {
                // Handle API error response
                let errorMessage = 'Failed to save pet. Please try again.';
                
                if (result.error) {
                    errorMessage = result.error;
                } else if (result.message) {
                    errorMessage = result.message;
                }
                
                alert('Error: ' + errorMessage);
                return;
            }
            
            console.log('Pet saved successfully, refreshing pets list...'); // Debug log
            fetchPets();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving pet:', error);
            alert('Error: Network error or server is unreachable.');
        }
    };

    if (loading) return <div className="p-8"><Spinner /></div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Pets</h1>
                <Button onClick={handleAddPet} className="flex items-center gap-2"><PlusCircle size={16} /> Add Pet</Button>
            </div>
            {pets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {pets.map(pet => (
                        <PetCard key={pet.petid} pet={pet} onEdit={handleEditPet} onDelete={handleDeletePet} navigate={navigate} setSelectedPetId={setSelectedPetId} isDeleting={deletingPets.has(pet.petid)}/>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-16">
                    <Dog className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No pets found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding your first furry (or scaly) friend!</p>
                    <div className="mt-6">
                        <Button onClick={handleAddPet}>Add a Pet</Button>
                    </div>
                </Card>
            )}
            <PetFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSavePet} pet={selectedPet} />
        </div>
    );
};

// --- Pet Detail Page ---

const DietFormModal = ({ isOpen, onClose, onSave, itemToEdit = null }) => {
    const [formData, setFormData] = useState({
        name: '', 
        amount: '', 
        description: '',
        // Schedule fields
        startdate: '',
        repeat_option: 'never',
        hour: 8,
        minute: 0
    });
    const [errors, setErrors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Repeat options from the database enum
    const repeatOptions = [
        { value: 'never', label: 'Never (One-time)' },
        { value: 'hourly', label: 'Every Hour' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'biweekly', label: 'Bi-weekly (Every 2 weeks)' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'every 3 months', label: 'Every 3 months' },
        { value: 'every 6 months', label: 'Every 6 months' },
        { value: 'yearly', label: 'Yearly' }
    ];

    useEffect(() => {
        if (isOpen) {
            if (itemToEdit) {
                setFormData({
                    name: itemToEdit.name || '',
                    amount: itemToEdit.amount || '',
                    description: itemToEdit.description || '',
                    // If schedule exists, populate it
                    startdate: itemToEdit.startdate || new Date().toISOString().split('T')[0],
                    repeat_option: itemToEdit.repeat_option || 'never',
                    hour: itemToEdit.hour || 8,
                    minute: itemToEdit.minute || 0
                });
            } else {
                setFormData({
                    name: '', 
                    amount: '', 
                    description: '',
                    startdate: new Date().toISOString().split('T')[0], // Default to today
                    repeat_option: 'daily', // Default to daily for feeding
                    hour: 8,
                    minute: 0
                });
            }
            setErrors([]);
        }
    }, [isOpen, itemToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear errors when user starts typing
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    const validateForm = () => {
        const newErrors = [];
        
        if (!formData.name || formData.name.trim().length === 0) {
            newErrors.push('Food name is required');
        } else if (formData.name.trim().length > 100) {
            newErrors.push('Food name must be 100 characters or less');
        }
        
        if (formData.amount && formData.amount.trim().length > 50) {
            newErrors.push('Amount must be 50 characters or less');
        }
        
        if (formData.description && formData.description.trim().length > 500) {
            newErrors.push('Description must be 500 characters or less');
        }

        // Schedule validation
        if (!formData.startdate) {
            newErrors.push('Start date is required');
        }

        if (formData.hour < 0 || formData.hour > 23) {
            newErrors.push('Hour must be between 0 and 23');
        }

        if (formData.minute < 0 || formData.minute > 59) {
            newErrors.push('Minute must be between 0 and 59');
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving diet:', error);
            setErrors([error.message || 'Failed to save diet']);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={itemToEdit ? "Edit Diet Schedule" : "Add Diet Schedule"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                        <h4 className="text-red-800 font-medium mb-1">Please fix the following errors:</h4>
                        <ul className="text-red-700 text-sm space-y-1">
                            {errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        label="Food Name/Type *" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="e.g., Dry Kibble, Wet Food, Treats"
                        required
                    />
                    <Input 
                        label="Amount/Quantity" 
                        name="amount" 
                        value={formData.amount} 
                        onChange={handleChange} 
                        placeholder="e.g., 2 cups, 100g, 1 can"
                    />
                </div>

                <TextArea 
                    label="Description / Notes" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="e.g., Mix with warm water, Give with medication"
                    rows="3"
                />

                {/* Schedule Section */}
                <div className="border-t pt-4">
                    <h4 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Feeding Schedule</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Start Date *" 
                            name="startdate" 
                            type="date"
                            value={formData.startdate} 
                            onChange={handleChange} 
                            required
                        />
                        
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Repeat Option *
                            </label>
                            <select 
                                name="repeat_option" 
                                value={formData.repeat_option} 
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            >
                                {repeatOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <Input 
                            label="Hour (0-23) *" 
                            name="hour" 
                            type="number"
                            min="0"
                            max="23"
                            value={formData.hour} 
                            onChange={handleChange} 
                            required
                        />
                        <Input 
                            label="Minute (0-59) *" 
                            name="minute" 
                            type="number"
                            min="0"
                            max="59"
                            value={formData.minute} 
                            onChange={handleChange} 
                            required
                        />
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Feeding time: {String(formData.hour).padStart(2, '0')}:{String(formData.minute).padStart(2, '0')}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : (itemToEdit ? "Save Changes" : "Add Diet Schedule")}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

const ActivityFormModal = ({ isOpen, onClose, onSave, itemToEdit = null }) => {
    const [formData, setFormData] = useState({
        name: '', 
        description: '',
        // Schedule fields
        startdate: '',
        repeat_option: 'never',
        hour: 8,
        minute: 0
    });
    const [errors, setErrors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Repeat options from the database enum
    const repeatOptions = [
        { value: 'never', label: 'Never (One-time)' },
        { value: 'hourly', label: 'Every Hour' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'biweekly', label: 'Bi-weekly (Every 2 weeks)' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'every 3 months', label: 'Every 3 months' },
        { value: 'every 6 months', label: 'Every 6 months' },
        { value: 'yearly', label: 'Yearly' }
    ];

    useEffect(() => {
        if (isOpen) {
            if (itemToEdit) {
                setFormData({
                    name: itemToEdit.name || '',
                    description: itemToEdit.description || '',
                    // If schedule exists, populate it
                    startdate: itemToEdit.startdate || new Date().toISOString().split('T')[0],
                    repeat_option: itemToEdit.repeat_option || 'never',
                    hour: itemToEdit.hour || 8,
                    minute: itemToEdit.minute || 0
                });
            } else {
                setFormData({
                    name: '', 
                    description: '',
                    startdate: new Date().toISOString().split('T')[0], // Default to today
                    repeat_option: 'daily', // Default to daily for activities
                    hour: 8,
                    minute: 0
                });
            }
            setErrors([]);
        }
    }, [isOpen, itemToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear errors when user starts typing
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    const validateForm = () => {
        const newErrors = [];
        
        if (!formData.name || formData.name.trim().length === 0) {
            newErrors.push('Activity name is required');
        } else if (formData.name.trim().length > 20) {
            newErrors.push('Activity name must be 20 characters or less');
        }
        
        if (formData.description && formData.description.trim().length > 500) {
            newErrors.push('Description must be 500 characters or less');
        }

        // Schedule validation
        if (!formData.startdate) {
            newErrors.push('Start date is required');
        }

        if (formData.hour < 0 || formData.hour > 23) {
            newErrors.push('Hour must be between 0 and 23');
        }

        if (formData.minute < 0 || formData.minute > 59) {
            newErrors.push('Minute must be between 0 and 59');
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving activity:', error);
            setErrors([error.message || 'Failed to save activity']);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={itemToEdit ? "Edit Activity Schedule" : "Schedule New Activity"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                        <h4 className="text-red-800 font-medium mb-1">Please fix the following errors:</h4>
                        <ul className="text-red-700 text-sm space-y-1">
                            {errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <Input 
                    label="Activity Name *" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="e.g., Morning walk, Playing fetch, Grooming"
                    required
                />
                <TextArea 
                    label="Description / Notes" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="Any extra details about the activity..."
                    rows="3"
                />

                {/* Schedule Section */}
                <div className="border-t pt-4">
                    <h4 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Activity Schedule</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Start Date *" 
                            name="startdate" 
                            type="date"
                            value={formData.startdate} 
                            onChange={handleChange} 
                            required
                        />
                        
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Repeat Option *
                            </label>
                            <select 
                                name="repeat_option" 
                                value={formData.repeat_option} 
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            >
                                {repeatOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <Input 
                            label="Hour (0-23) *" 
                            name="hour" 
                            type="number"
                            min="0"
                            max="23"
                            value={formData.hour} 
                            onChange={handleChange} 
                            required
                        />
                        <Input 
                            label="Minute (0-59) *" 
                            name="minute" 
                            type="number"
                            min="0"
                            max="59"
                            value={formData.minute} 
                            onChange={handleChange} 
                            required
                        />
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Activity time: {String(formData.hour).padStart(2, '0')}:{String(formData.minute).padStart(2, '0')}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : (itemToEdit ? "Save Changes" : "Schedule Activity")}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

const PetDetailPage = ({ petId, navigate, goBack }) => {
    const [pet, setPet] = useState(null);
    const [diet, setDiet] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingItems, setDeletingItems] = useState(new Set()); // Track items being deleted

    console.log('🔄 Frontend: PetDetailPage render - Current state:', {
        petId,
        pet: pet?.name || 'null',
        dietLength: diet.length,
        activitiesLength: activities.length,
        loading,
        deletingItems: Array.from(deletingItems)
    });

    const [isDietModalOpen, setIsDietModalOpen] = useState(false);
    const [editingDiet, setEditingDiet] = useState(null);

    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);

    const fetchData = async () => {
        console.log('📥 Frontend: Fetching data for pet ID:', petId);
        setLoading(true);
        
        try {
            const [petRes, dietRes, activityRes, scheduleRes] = await Promise.all([
                api.pets.getById(petId),
                api.diet.getForPet(petId),
                api.activity.getForPet(petId),
                api.petSchedule.getForPet(petId).catch(err => {
                    console.error('❌ Frontend: Error fetching schedules:', err);
                    return { error: err.message };
                }),
            ]);

            console.log('📥 Frontend: API responses:', {
                petRes: petRes,
                dietRes: dietRes,
                activityRes: activityRes,
                scheduleRes: scheduleRes
            });

            if (petRes.success) setPet(petRes.pet);
            
            if (dietRes.diets) {
                console.log('🍽️ Frontend: Setting diet data:', dietRes.diets);
                
                // Merge schedule data with diet data
                let dietWithSchedules = dietRes.diets;
                if (scheduleRes && scheduleRes.schedules && !scheduleRes.error) {
                    console.log('📅 Frontend: Merging schedule data with diet data');
                    console.log('📅 Frontend: Schedule data:', scheduleRes.schedules);
                    dietWithSchedules = dietRes.diets.map(diet => {
                        const schedule = scheduleRes.schedules.find(s => s.dietid === diet.dietid);
                        if (schedule) {
                            console.log(`🔗 Frontend: Found schedule for diet ${diet.dietid}:`, schedule);
                            return { ...diet, ...schedule };
                        }
                        console.log(`❌ Frontend: No schedule found for diet ${diet.dietid}`);
                        return diet;
                    });
                } else {
                    console.log('❌ Frontend: No schedule data available:', scheduleRes);
                }
                
                setDiet(dietWithSchedules);
                console.log('🍽️ Frontend: Final diet data with schedules:', dietWithSchedules);
            }
            
            if (activityRes.activities) {
                console.log('🏃 Frontend: Setting activity data:', activityRes.activities);
                
                // Merge schedule data with activity data
                let activitiesWithSchedules = activityRes.activities;
                if (scheduleRes && scheduleRes.schedules && !scheduleRes.error) {
                    console.log('📅 Frontend: Merging schedule data with activity data');
                    console.log('📅 Frontend: Schedule data:', scheduleRes.schedules);
                    activitiesWithSchedules = activityRes.activities.map(activity => {
                        const schedule = scheduleRes.schedules.find(s => s.activityid === activity.activityid);
                        if (schedule) {
                            console.log(`🔗 Frontend: Found schedule for activity ${activity.activityid}:`, schedule);
                            return { ...activity, ...schedule };
                        }
                        console.log(`❌ Frontend: No schedule found for activity ${activity.activityid}`);
                        return activity;
                    });
                } else {
                    console.log('❌ Frontend: No schedule data available:', scheduleRes);
                }
                
                setActivities(activitiesWithSchedules);
                console.log('🏃 Frontend: Final activity data with schedules:', activitiesWithSchedules);
            }
            setLoading(false);
        } catch (error) {
            console.error('❌ Frontend: Error in fetchData:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [petId]);

    // --- Diet Handlers ---
    const handleSaveDiet = async (formData) => {
        console.log('🍽️ Frontend: Saving diet with data:', formData);
        console.log('🍽️ Frontend: Pet ID:', petId);
        console.log('🍽️ Frontend: Editing diet:', editingDiet);
        
        try {
            // Separate diet data from schedule data
            const dietData = {
                name: formData.name,
                amount: formData.amount,
                description: formData.description
            };
            
            const scheduleData = {
                startdate: formData.startdate,
                repeat_option: formData.repeat_option,
                hour: parseInt(formData.hour),
                minute: parseInt(formData.minute)
            };

            let dietResult;
            if (editingDiet) {
                console.log('🍽️ Frontend: Updating existing diet');
                dietResult = await api.diet.update(editingDiet.dietid, dietData);
                
                // Update existing schedule if it exists
                if (editingDiet.petscheduleid) {
                    console.log('🍽️ Frontend: Updating existing diet schedule:', {
                        ...scheduleData,
                        dietid: editingDiet.dietid
                    });
                    const scheduleResult = await api.petSchedule.update(editingDiet.petscheduleid, {
                        ...scheduleData,
                        dietid: editingDiet.dietid
                    });
                    console.log('🍽️ Frontend: Schedule update result:', scheduleResult);
                } else {
                    // Create new schedule for existing diet
                    console.log('🍽️ Frontend: Creating schedule for existing diet:', {
                        ...scheduleData,
                        dietid: editingDiet.dietid
                    });
                    try {
                        const scheduleResult = await api.petSchedule.add({
                            ...scheduleData,
                            dietid: editingDiet.dietid
                        });
                        console.log('🍽️ Frontend: Schedule creation result:', scheduleResult);
                    } catch (scheduleError) {
                        console.error('❌ Frontend: Error creating schedule for existing diet:', scheduleError);
                    }
                }
            } else {
                console.log('🍽️ Frontend: Creating new diet');
                dietResult = await api.diet.add(petId, dietData);
                console.log('🍽️ Frontend: Diet creation result:', dietResult);
                
                // Create schedule for new diet
                if (dietResult.success && dietResult.diet) {
                    console.log('🍽️ Frontend: Diet result check - success:', dietResult.success, 'diet:', dietResult.diet);
                    console.log('🍽️ Frontend: Creating schedule for new diet:', {
                        ...scheduleData,
                        dietid: dietResult.diet.dietid
                    });
                    try {
                        const scheduleResult = await api.petSchedule.add({
                            ...scheduleData,
                            dietid: dietResult.diet.dietid
                        });
                        console.log('🍽️ Frontend: Schedule creation result:', scheduleResult);
                    } catch (scheduleError) {
                        console.error('❌ Frontend: Error creating schedule for diet:', scheduleError);
                    }
                } else {
                    console.log('❌ Frontend: Diet creation condition failed - success:', dietResult.success, 'diet:', dietResult.diet);
                }
            }
            console.log('🍽️ Frontend: Diet and schedule saved successfully, fetching updated data');
            fetchData();
            setIsDietModalOpen(false);
            setEditingDiet(null);
        } catch (error) {
            console.error('❌ Frontend: Error saving diet:', error);
            throw error; // Re-throw to show in form
        }
    };

    const openDietModal = (item = null) => {
        setEditingDiet(item);
        setIsDietModalOpen(true);
    };

    const handleDeleteDiet = async (dietId) => {
        // Prevent multiple deletions of the same item
        if (deletingItems.has(`diet-${dietId}`)) {
            console.log('🛑 Diet deletion already in progress for ID:', dietId);
            return;
        }

        if (window.confirm("Are you sure you want to delete this diet item?")) {
            // Add to deleting set
            setDeletingItems(prev => new Set(prev).add(`diet-${dietId}`));
            
            try {
                console.log('🗑️ Deleting diet with ID:', dietId);
                await api.diet.delete(dietId);
                console.log('✅ Diet deleted successfully');
                fetchData();
            } catch (error) {
                console.error('❌ Error deleting diet:', error);
                // You could show an error toast here
            } finally {
                // Remove from deleting set
                setDeletingItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(`diet-${dietId}`);
                    return newSet;
                });
            }
        }
    };

    // --- Activity Handlers ---
    const handleSaveActivity = async (formData) => {
        console.log('🏃 Frontend: Saving activity with data:', formData);
        console.log('🏃 Frontend: Pet ID:', petId);
        console.log('🏃 Frontend: Editing activity:', editingActivity);
        
        try {
            // Separate activity data from schedule data
            const activityData = {
                name: formData.name,
                description: formData.description
            };
            
            const scheduleData = {
                startdate: formData.startdate,
                repeat_option: formData.repeat_option,
                hour: parseInt(formData.hour),
                minute: parseInt(formData.minute)
            };

            let activityResult;
            if (editingActivity) {
                console.log('🏃 Frontend: Updating existing activity');
                activityResult = await api.activity.update(editingActivity.activityid, activityData);
                
                // Update existing schedule if it exists
                if (editingActivity.petscheduleid) {
                    console.log('🏃 Frontend: Updating existing activity schedule:', {
                        ...scheduleData,
                        activityid: editingActivity.activityid
                    });
                    const scheduleResult = await api.petSchedule.update(editingActivity.petscheduleid, {
                        ...scheduleData,
                        activityid: editingActivity.activityid
                    });
                    console.log('🏃 Frontend: Schedule update result:', scheduleResult);
                } else {
                    // Create new schedule for existing activity
                    console.log('🏃 Frontend: Creating schedule for existing activity:', {
                        ...scheduleData,
                        activityid: editingActivity.activityid
                    });
                    try {
                        const scheduleResult = await api.petSchedule.add({
                            ...scheduleData,
                            activityid: editingActivity.activityid
                        });
                        console.log('🏃 Frontend: Schedule creation result:', scheduleResult);
                    } catch (scheduleError) {
                        console.error('❌ Frontend: Error creating schedule for existing activity:', scheduleError);
                    }
                }
            } else {
                console.log('🏃 Frontend: Creating new activity');
                activityResult = await api.activity.add(petId, activityData);
                console.log('🏃 Frontend: Activity creation result:', activityResult);
                
                // Create schedule for new activity
                if (activityResult.success && activityResult.activity) {
                    console.log('🏃 Frontend: Activity result check - success:', activityResult.success, 'activity:', activityResult.activity);
                    console.log('🏃 Frontend: Creating schedule for new activity:', {
                        ...scheduleData,
                        activityid: activityResult.activity.activityid
                    });
                    try {
                        const scheduleResult = await api.petSchedule.add({
                            ...scheduleData,
                            activityid: activityResult.activity.activityid
                        });
                        console.log('🏃 Frontend: Schedule creation result:', scheduleResult);
                    } catch (scheduleError) {
                        console.error('❌ Frontend: Error creating schedule for activity:', scheduleError);
                    }
                } else {
                    console.log('❌ Frontend: Activity creation condition failed - success:', activityResult.success, 'activity:', activityResult.activity);
                }
            }
            console.log('🏃 Frontend: Activity and schedule saved successfully, fetching updated data');
            fetchData();
            setIsActivityModalOpen(false);
            setEditingActivity(null);
        } catch (error) {
            console.error('❌ Frontend: Error saving activity:', error);
            throw error; // Re-throw to show in form
        }
    };

    const openActivityModal = (item = null) => {
        setEditingActivity(item);
        setIsActivityModalOpen(true);
    };

    const handleDeleteActivity = async (activityId) => {
        // Prevent multiple deletions of the same item
        if (deletingItems.has(`activity-${activityId}`)) {
            console.log('🛑 Activity deletion already in progress for ID:', activityId);
            return;
        }

        if (window.confirm("Are you sure you want to delete this activity?")) {
            // Add to deleting set
            setDeletingItems(prev => new Set(prev).add(`activity-${activityId}`));
            
            try {
                console.log('🗑️ Deleting activity with ID:', activityId);
                await api.activity.delete(activityId);
                console.log('✅ Activity deleted successfully');
                fetchData();
            } catch (error) {
                console.error('❌ Error deleting activity:', error);
                // You could show an error toast here
            } finally {
                // Remove from deleting set
                setDeletingItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(`activity-${activityId}`);
                    return newSet;
                });
            }
        }
    };

    if (loading) return <div className="p-8"><Spinner/></div>;
    if (!pet) return <div className="p-8">Pet not found.</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Button onClick={goBack} variant="secondary" className="mb-6 flex items-center gap-2">
                <ChevronLeft size={16} /> Back to My Pets
            </Button>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 text-center">
                    {(() => {
                        const placeholderImage = "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100' height='100' fill='%23e5e7eb'/%3e%3ctext x='50' y='50' font-size='12' text-anchor='middle' dy='.3em' fill='%23374151'%3eNo Image%3c/text%3e%3c/svg%3e";
                        return (
                            <img 
                                src={pet.picture || placeholderImage} 
                                alt={pet.name} 
                                className="w-48 h-48 mx-auto rounded-full object-cover mb-4 shadow-lg" 
                                onError={(e) => { e.target.src = placeholderImage; }}
                            />
                        );
                    })()}
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{pet.name}</h1>
                </div>
                <div className="w-full md:w-2/3">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">Pet Information</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong className="block text-gray-500">Breed</strong> {pet.breed}</div>
                            <div><strong className="block text-gray-500">Age</strong> {pet.age} years</div>
                            <div className="col-span-2"><strong className="block text-gray-500">Birthday</strong> {new Date(pet.dob).toLocaleDateString()}</div>
                            <div className="col-span-2"><strong className="block text-gray-500">Description</strong> {pet.description}</div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Utensils /> Diet Schedule</h2>
                        <Button onClick={() => openDietModal(null)} className="!px-3 !py-1 text-xs">Schedule Diet</Button>
                    </div>
                    <div className="space-y-3">
                        {diet.length > 0 ? diet.map(d => (
                            <div key={d.dietid} className="group p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-semibold">{d.name}</p>
                                        {d.amount && <p className="text-sm text-gray-600 dark:text-gray-300">Amount: {d.amount}</p>}
                                        {d.description && <p className="text-sm text-gray-500 dark:text-gray-400 italic">"{d.description}"</p>}
                                        
                                        {/* Schedule Information */}
                                        {d.startdate && (
                                            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    <span>
                                                        {String(d.hour || 0).padStart(2, '0')}:{String(d.minute || 0).padStart(2, '0')} • {d.repeat_option}
                                                        {d.repeat_option !== 'never' && ` • Starting ${new Date(d.startdate).toLocaleDateString()}`}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 ml-4">
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => openDietModal(d)} 
                                            className="!p-2"
                                            disabled={deletingItems.has(`diet-${d.dietid}`)}
                                        >
                                            <Edit size={14}/>
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            onClick={() => handleDeleteDiet(d.dietid)} 
                                            className="!p-2"
                                            disabled={deletingItems.has(`diet-${d.dietid}`)}
                                        >
                                            {deletingItems.has(`diet-${d.dietid}`) ? (
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                            ) : (
                                                <Trash2 size={14}/>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-gray-500 dark:text-gray-400">No diet schedules set up.</p>}
                    </div>
                </Card>
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Footprints /> Activity Schedule</h2>
                        <Button onClick={() => openActivityModal(null)} className="!px-3 !py-1 text-xs">Schedule Activity</Button>
                    </div>
                    <div className="space-y-3">
                        {activities.length > 0 ? activities.map(a => (
                            <div key={a.activityid} className="group p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-semibold">{a.name}</p>
                                        {a.description && <p className="text-sm text-gray-500 dark:text-gray-400 italic">"{a.description}"</p>}
                                        
                                        {/* Schedule Information */}
                                        {a.startdate && (
                                            <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    <span>
                                                        {String(a.hour || 0).padStart(2, '0')}:{String(a.minute || 0).padStart(2, '0')} • {a.repeat_option}
                                                        {a.repeat_option !== 'never' && ` • Starting ${new Date(a.startdate).toLocaleDateString()}`}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 ml-4">
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => openActivityModal(a)} 
                                            className="!p-2"
                                            disabled={deletingItems.has(`activity-${a.activityid}`)}
                                        >
                                            <Edit size={14}/>
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            onClick={() => handleDeleteActivity(a.activityid)} 
                                            className="!p-2"
                                            disabled={deletingItems.has(`activity-${a.activityid}`)}
                                        >
                                            {deletingItems.has(`activity-${a.activityid}`) ? (
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                            ) : (
                                                <Trash2 size={14}/>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-gray-500 dark:text-gray-400">No activity schedules set up.</p>}
                    </div>
                </Card>
            </div>

            <DietFormModal isOpen={isDietModalOpen} onClose={() => setIsDietModalOpen(false)} onSave={handleSaveDiet} itemToEdit={editingDiet} />
            <ActivityFormModal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} onSave={handleSaveActivity} itemToEdit={editingActivity} />

        </div>
    );
};

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
    const [confirmText, setConfirmText] = useState("");
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Account">
            <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 text-red-700 dark:text-red-300">
                    <h4 className="font-bold">Warning: This action is irreversible.</h4>
                    <p className="text-sm mt-1">
                        All your data, including your profile, pets, bookings, and services, will be permanently deleted.
                    </p>
                    <p className="text-sm mt-1 font-semibold">
                        You will be immediately logged out and redirected to the login page.
                    </p>
                </div>
                <p>To confirm, please type "DELETE" in the box below.</p>
                <Input 
                    name="confirm" 
                    value={confirmText} 
                    onChange={(e) => setConfirmText(e.target.value)} 
                    disabled={isDeleting}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose} disabled={isDeleting}>Cancel</Button>
                    <Button 
                        variant="danger" 
                        onClick={onConfirm} 
                        disabled={confirmText !== 'DELETE' || isDeleting}
                    >
                        {isDeleting ? 'Deleting Account...' : 'I understand, delete my account'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// --- Service Provider Pages ---

const ProviderDashboard = ({ setPage }) => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            // This now uses the new, more powerful provider dashboard endpoint
            const res = await api.scheduleDashboard.getForProvider();
            if (res && res.dashboard) {
                setDashboardData(res.dashboard);
            } else if (res && res.error) {
                console.error('Dashboard API error:', res.error);
            }
            setLoading(false);
        };
        fetchData();
    }, [user]);

    if (loading) return <div className="p-8"><Spinner /></div>;
    if (!dashboardData) return <div className="p-8">Could not load dashboard data.</div>;

    const { statistics, workAppointments } = dashboardData;

    const statCards = [
        { label: "Pending Requests", value: statistics.pendingRequests, icon: <ClipboardList />, page: 'bookingRequests' },
        { label: "Active Services", value: statistics.activeServices, icon: <Briefcase />, page: 'myServices' },
        { label: "Total Revenue", value: `$${statistics.totalRevenue.toFixed(2)}`, icon: <DollarSign />, page: 'providerDashboard' }, // Stays on page for now
    ];

    // Filter for only pending requests to show in the summary list
    const pendingRequests = workAppointments.filter(r => r.status === 'pending');

    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}!</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map(stat => (
                    <Card key={stat.label} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setPage(stat.page)}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                                {React.cloneElement(stat.icon, { size: 24 })}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Recent Booking Requests</h2>
                    {pendingRequests.length > 3 && (
                        <Button variant="secondary" onClick={() => setPage('bookingRequests')}>View All</Button>
                    )}
                </div>
                <div className="space-y-3">
                    {pendingRequests.length > 0 ? pendingRequests.slice(0, 3).map(req => (
                        <div key={req.bookid} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div>
                                <p className="font-semibold">{req.service_name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    From: {req.pet_owner_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {new Date(req.servedate).toLocaleDateString()} at {req.slot}
                                </p>
                            </div>
                            <Button onClick={() => setPage('bookingRequests')} className="!text-xs !py-1 !px-2 self-start sm:self-center">
                                View Request
                            </Button>
                        </div>
                    )) : (
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">No new booking requests.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

const ServiceFormModal = ({ isOpen, onClose, onSave, service }) => {
    // Ensure the initial state includes `typeid: null`
    const [formData, setFormData] = useState({ name: '', price: '', description: '', duration: '', service_type: '', typeid: null, timeSlots: [], license: '' });
    const [serviceTypes, setServiceTypes] = useState([]);
    const [licensePreview, setLicensePreview] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const isCreating = !service;
    const isEditingApproved = service && service.status === 'approved';

    useEffect(() => {
        if (isOpen) {
            setValidationErrors([]); // Clear validation errors when modal opens
            setLoading(false); // Reset loading state when modal opens
            const fetchTypes = async () => {
                console.log('Fetching service types...');
                const res = await api.services.getTypes();
                console.log('Service types response:', res);
                if (res.serviceTypes && Array.isArray(res.serviceTypes)) {
                    setServiceTypes(res.serviceTypes);
                    console.log('Service types loaded:', res.serviceTypes);
                } else {
                    console.error('Failed to load service types:', res);
                    setServiceTypes([]); // Set empty array as fallback
                }
            };
            fetchTypes();

            if (service) {
                setFormData({
                    name: service.name || '',
                    price: service.price || '',
                    description: service.description || '',
                    duration: service.duration || '',
                    service_type: service.service_type || '',
                    typeid: service.typeid || null,
                    timeSlots: service.timeslots || ['09:00'],
                    license: service.license || ''
                });
                setLicensePreview(service.license || null);
            } else {
                setFormData({ name: '', price: '', description: '', duration: '', service_type: '', typeid: null, timeSlots: ['09:00'], license: '' });
                setLicensePreview(null);
            }
        }
    }, [service, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleLicenseChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (file.type !== 'application/pdf') {
                setValidationErrors(['License must be a PDF file']);
                e.target.value = ''; // Clear the file input
                return;
            }
            
            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                setValidationErrors(['License file size cannot exceed 10MB']);
                e.target.value = ''; // Clear the file input
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData(prev => ({ ...prev, license: base64String }));
                setLicensePreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors([]); // Clear any previous errors
        setLoading(true);
        
        // Frontend validation before submitting
        const frontendErrors = [];
        
        if (!formData.name || formData.name.trim().length < 3) {
            frontendErrors.push('Service name must be at least 3 characters long');
        }
        
        if (!formData.price || Number(formData.price) <= 0) {
            frontendErrors.push('Service price must be a positive number');
        }
        
        if (!formData.description || formData.description.trim().length < 10) {
            frontendErrors.push('Service description must be at least 10 characters long');
        }
        
        if (!formData.duration || formData.duration.trim().length === 0) {
            frontendErrors.push('Service duration is required (e.g., "60 minutes")');
        } else {
            // Check for common typos in duration
            const duration = formData.duration.toLowerCase().trim();
            const hasValidFormat = /^\d+\s*(minute|minutes|hour|hours|min|hr|hrs)s?$/.test(duration);
            
            if (!hasValidFormat) {
                frontendErrors.push('Duration must be in format like "60 minutes", "1 hour", "30 min", etc.');
            }
            
            // Check for common typos
            if (duration.includes('minites') || duration.includes('minuts')) {
                frontendErrors.push('Did you mean "minutes"? Please check the spelling.');
            }
        }
        
        if (!formData.service_type || formData.service_type.trim().length === 0) {
            frontendErrors.push('Service type is required');
        }
        
        // Validate license for new services (required and must be PDF)
        if (isCreating) {
            if (!formData.license || formData.license.trim().length === 0) {
                frontendErrors.push('License is required for new services');
            } else if (!formData.license.startsWith('data:application/pdf;base64,')) {
                frontendErrors.push('License must be a PDF file');
            }
        }
        
        if (frontendErrors.length > 0) {
            setValidationErrors(frontendErrors);
            setLoading(false);
            return;
        }
        
        try {
            // 1. Convert price to a number to match backend validation
            const submissionData = { 
                ...formData, 
                price: Number(formData.price), // Ensure price is a number
                timeSlots: formData.timeSlots 
            };

            // 2. Correctly handle the creation of a new service type
            // If we are creating a new service AND a custom service_type name was entered
            if (isCreating && submissionData.service_type && !submissionData.typeid) {
                // The backend expects `serviceType` for new types, not `service_type`
                submissionData.serviceType = submissionData.service_type;
                delete submissionData.service_type; // Clean up the old key to avoid confusion
            }

            // Debug logging
            console.log('Submitting service data:', JSON.stringify(submissionData, null, 2));
            console.log('Form state before submission:', {
                formDataRaw: formData,
                isCreating,
                serviceTypes,
                typeidValue: submissionData.typeid,
                serviceTypeValue: submissionData.serviceType
            });

            let result;
            if (service) {
                if (service.status === 'approved') {
                    result = await api.services.updateApproved(service.serviceid, submissionData);
                } else {
                    result = await api.services.update(service.serviceid, submissionData);
                }
            } else {
                result = await api.services.create(submissionData);
            }

            // Check if the API call was successful
            if (result.success === false) {
                // If there are validation details, show them
                if (result.details && Array.isArray(result.details)) {
                    setValidationErrors(result.details);
                } else if (result.error) {
                    setValidationErrors([result.error]);
                } else if (result.message) {
                    setValidationErrors([result.message]);
                } else {
                    setValidationErrors(['An error occurred while saving the service.']);
                }
                setLoading(false);
                return; // Don't close the modal if there are errors
            }

            // Success - call the parent's callback and close modal
            onSave();
        } catch (error) {
            console.error('Error saving service:', error);
            // Better error handling for different types of errors
            if (error.message && error.message.includes('Failed to fetch')) {
                setValidationErrors(['Network error: Unable to connect to server. Please check if the server is running.']);
            } else if (error.message && error.message.includes('401')) {
                setValidationErrors(['Authentication error: Please log in again.']);
            } else if (error.message && error.message.includes('403')) {
                setValidationErrors(['Access denied: Only service providers can submit services.']);
            } else if (error.message && error.message.includes('400')) {
                setValidationErrors(['Validation error: Please check your input data.']);
            } else {
                setValidationErrors([error.message || 'An unexpected error occurred. Please try again.']);
            }
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isCreating ? 'Add a New Service' : 'Edit Service'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {isEditingApproved && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300 text-sm">
                        <p>You are editing an approved service. Key details like name, price, and type cannot be changed.</p>
                    </div>
                )}

                <Input label="Service Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Premium Dog Walking" disabled={isEditingApproved} />
                
                {/* --- THIS IS THE CORRECTED CODE --- */}
                <TypeaheadInput
                    label="Service Type"
                    name="service_type"
                    value={formData.service_type}
                    onChange={(e) => {
                        // When a user types a new service type, clear the ID
                        handleChange(e);
                        setFormData(prev => ({ ...prev, typeid: null }));
                    }}
                    placeholder="e.g., Walking or create new"
                    suggestions={serviceTypes.map(st => st.type)} // Pass only the names as suggestions
                    onSelect={(selectedTypeName) => {
                        // When a user selects a type from the dropdown
                        const selectedType = serviceTypes.find(t => t.type === selectedTypeName);
                        if (selectedType) {
                            // Update the state with both the name and the crucial ID
                            setFormData(prev => ({
                                ...prev,
                                service_type: selectedType.type,
                                typeid: selectedType.typeid 
                            }));
                        }
                    }}
                    disabled={isEditingApproved}
                />
                {/* --- END OF FIX --- */}

                <Input label="Price ($)" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="25" disabled={isEditingApproved} />
                <Input label="Duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 60 minutes" disabled={isEditingApproved}/>
                <TextArea label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="A detailed description of the service offered..."/>
                <TimeSlotManager
                    slots={formData.timeSlots}
                    onChange={(newSlots) => setFormData(prev => ({ ...prev, timeSlots: newSlots }))}
                />

                {/* License field... */}
                <div>
                    <label htmlFor="license-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        License {isCreating && <span className="text-red-500">*</span>}
                    </label>
                    {isCreating ? (
                        <>
                            <input
                                type="file"
                                id="license-upload"
                                name="license-upload"
                                accept="application/pdf"
                                onChange={handleLicenseChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                PDF files only, maximum 10MB
                            </p>
                            {licensePreview && (
                                <div className="mt-4">
                                    <p className="text-sm text-green-600">✓ PDF license uploaded successfully</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">The license cannot be changed after a service has been submitted.</p>
                            {formData.license && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">License document on file</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Display validation errors */}
                {validationErrors.length > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 text-red-700 dark:text-red-300">
                        <h4 className="font-bold mb-2">Please fix the following errors:</h4>
                        <ul className="text-sm space-y-1">
                            {validationErrors.map((error, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-red-500 mt-0.5">•</span>
                                    <span>{error}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? <Spinner /> : 'Save Service'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
// Add this new component within the PAGE COMPONENTS section

const ProviderSchedulePage = ({ navigate, setSelectedBookingId }) => {
    const [scheduleItems, setScheduleItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchProviderSchedule = async () => {
            setLoading(true);
            const res = await api.scheduleDashboard.getForProvider();
            if (res.success && res.dashboard.workAppointments) {
                const formattedBookings = res.dashboard.workAppointments.map(b => ({
                    ...b,
                    id: `b-${b.bookid}`,
                    type: 'booking',
                    title: b.service_name,
                    startdate: b.servedate,
                    time: b.slot,
                    petName: b.pets, // The mock data has pet names as a string
                    repeat_option: 'none'
                }));
                setScheduleItems(formattedBookings);
            }
            setLoading(false);
        };
        fetchProviderSchedule();
    }, []);

    const handleItemClick = (item) => {
        console.log('🔍 Frontend: Item clicked:', item);
        console.log('🔍 Frontend: Current selected item:', selectedItem);
        setSelectedItem(item);
    };

    const getBookingColor = (item) => {
        const statusColors = {
            'in-progress': 'bg-green-500',
            'confirmed': 'bg-blue-500',
            'completed': 'bg-gray-400',
            'pending': 'bg-yellow-500',
        };
        return statusColors[item.status] || 'bg-gray-500';
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">My Work Schedule</h1>
            <div className="flex flex-col md:flex-row gap-6 flex-1">
                <div className="flex-1 flex flex-col">
                    {loading ? <Spinner/> :
                        <Calendar
                            key="provider-calendar"
                            scheduleItems={scheduleItems}
                            onDateClick={handleItemClick}
                            currentDate={currentDate}
                            setCurrentDate={setCurrentDate}
                            itemColorClass={getBookingColor}
                        />
                    }
                </div>
                <EventDetailPanel
                    item={selectedItem}
                    navigate={navigate}
                    setSelectedBookingId={setSelectedBookingId}
                />
            </div>
        </div>
    );
};

// Add this new component within the PAGE COMPONENTS section

const ProviderProfilePage = ({ providerId, goBack, navigate, setSelectedServiceId }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const res = await api.profile.getProviderProfile(providerId);
            if (res.success) {
                setProfile(res.profile);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [providerId]);

    if (loading) return <div className="p-8"><Spinner /></div>;
    if (!profile) return <div className="p-8 text-center">Provider profile not found.</div>;

    const { statistics } = profile;

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <Button onClick={goBack} variant="secondary" className="mb-2 flex items-center gap-2">
                <ChevronLeft size={16} /> Back
            </Button>

            <header className="flex flex-col md:flex-row items-start gap-6">
                <img src={profile.logo} alt={`${profile.businessName} logo`} className="w-32 h-32 rounded-lg object-cover bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{profile.businessName}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">{profile.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1.5"><MapPin size={16} /> {profile.address}</span>
                        <span className="flex items-center gap-1.5"><Phone size={16} /> {profile.phone}</span>
                        {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-500 hover:underline"><ExternalLink size={16} /> Website</a>}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <Card><p className="text-3xl font-bold">{statistics.approvedServices}</p><p className="text-sm text-gray-500">Services Offered</p></Card>
                <Card><p className="text-3xl font-bold flex items-center justify-center gap-2">{statistics.averageRating.toFixed(1)} <Star className="text-yellow-400" size={24}/></p><p className="text-sm text-gray-500">{statistics.totalReviews} Reviews</p></Card>
                <Card><p className="text-3xl font-bold">{new Date(profile.joinedDate).getFullYear()}</p><p className="text-sm text-gray-500">Serving Since</p></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-xl font-bold mb-4">Services</h2>
                    <div className="space-y-3">
                        {profile.services.map(service => (
                            <div key={service.serviceid} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{service.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">${service.price} &bull; {service.duration}</p>
                                </div>
                                <Button onClick={() => { setSelectedServiceId(service.serviceid); navigate('serviceDetail'); }} variant="secondary" className="!text-xs !py-1 !px-2">View</Button>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card>
                    <h2 className="text-xl font-bold mb-4">Recent Reviews</h2>
                    <div className="space-y-4">
                        {profile.recentReviews.map(review => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const MyServicesPage = ({}) => {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [activeTab, setActiveTab] = useState('All');
    const [deletingServices, setDeletingServices] = useState(new Set());

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await api.services.getForProvider(user.id);
            
            // Backend returns {message, services, statistics} without a success property
            if (res.services && Array.isArray(res.services)) {
                console.log('Services loaded:', res.services.length, 'services');
                console.log('Service IDs:', res.services.map(s => `${s.serviceid}:${s.name}`));
                setServices(res.services);
            } else {
                console.error('Failed to fetch services:', res);
                setServices([]); // Set empty array as fallback
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            setServices([]); // Set empty array on error
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchServices();
    }, [user.id]);


    const filteredServices = services.filter(service => {
        if (activeTab === 'All') return true;
        return service.status === activeTab.toLowerCase();
    });

    const handleAdd = () => {
        setSelectedService(null);
        setIsModalOpen(true);
    };

    const handleEdit = (service) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleDelete = async (serviceId) => {
        console.log('Attempting to delete service ID:', serviceId);
        console.log('Current services in state:', services.map(s => ({ id: s.serviceid, name: s.name })));
        
        // Prevent multiple delete requests for the same service
        if (deletingServices.has(serviceId)) {
            console.log('Delete already in progress for service ID:', serviceId);
            return;
        }
        
        // Check if the service exists in our current state
        const serviceExists = services.find(s => s.serviceid === serviceId);
        if (!serviceExists) {
            alert('Service not found in current list. Refreshing...');
            fetchServices();
            return;
        }
        
        if(window.confirm(`Are you sure you want to delete "${serviceExists.name}"? This action cannot be undone.`)) {
            try {
                // Mark service as being deleted
                setDeletingServices(prev => new Set([...prev, serviceId]));
                
                console.log('Making DELETE request for service ID:', serviceId);
                const result = await api.services.delete(serviceId);
                console.log('Delete successful:', result);
                alert('Service deleted successfully!');
                fetchServices(); // Refresh the list
            } catch (error) {
                console.error('Delete error:', error);
                if (error.status === 404) {
                    alert('Service not found. It may have already been deleted. Refreshing the list...');
                    fetchServices(); // Refresh to show current state
                } else if (error.message && error.message.includes('existing bookings')) {
                    alert('Cannot delete service with existing bookings. Please wait for all bookings to be completed or contact support.');
                } else if (error.status === 403) {
                    alert('Access denied. You can only delete your own services.');
                } else {
                    alert('Failed to delete service: ' + (error.message || error.data?.message || 'Unknown error'));
                }
            } finally {
                // Remove service from deleting set
                setDeletingServices(prev => {
                    const next = new Set(prev);
                    next.delete(serviceId);
                    return next;
                });
            }
        }
    };

    const handleSave = async () => {
        // This is now just a callback to refresh the services list
        fetchServices();
        setIsModalOpen(false);
    };
    const StatusBadge = ({ status }) => {
        const colors = {
            'approved': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        return <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${colors[status] || colors.pending}`}>{status}</span>;
    }

    if (loading) return <div className="p-8"><Spinner /></div>;
    const tabs = ['All', 'Approved', 'Pending', 'Rejected'];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Services</h1>
                <div className="flex gap-2">
                    <Button onClick={fetchServices} variant="secondary" className="flex items-center gap-2">
                        <RefreshCw size={16} /> Refresh
                    </Button>
                    <Button onClick={handleAdd} className="flex items-center gap-2">
                        <PlusCircle size={16} /> Add Service
                    </Button>
                </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map(service => (
                        <Card key={service.serviceid} className="flex flex-col">
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{service.name}</h3>
                                    <StatusBadge status={service.status} />
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{service.service_type}</p>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{service.description}</p>

                                {service.status === 'rejected' && service.rejection_reason && (
                                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300 text-sm">
                                        <p className="font-bold">Reason for Rejection:</p>
                                        <p>{service.rejection_reason}</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center"><DollarSign size={18} className="mr-1"/>{service.price}</p>
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={() => handleEdit(service)}>Edit</Button>
                                    <Button 
                                        variant="danger" 
                                        onClick={() => handleDelete(service.serviceid)}
                                        disabled={deletingServices.has(service.serviceid)}
                                    >
                                        {deletingServices.has(service.serviceid) ? 'Deleting...' : 'Delete'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-16">
                    <Briefcase className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No services in this category</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {activeTab === 'All' ? "Get started by offering your first service!" : `You have no ${activeTab.toLowerCase()} services.`}
                    </p>
                    {activeTab === 'All' && <div className="mt-6"><Button onClick={handleAdd}>Add a Service</Button></div>}
                </Card>
            )}
            <ServiceFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} service={selectedService} />
        </div>
    )
};

const BookingRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        const res = await api.bookings.getForProvider();
        if (res.success) {
            setRequests(res.bookings.filter(r => r.status === 'pending'));
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (bookid, status) => {
        await api.bookings.updateStatus(bookid, status);
        setIsModalOpen(false); // Close modal after action
        setSelectedRequestId(null);
        fetchRequests(); // Refresh the list
    };

    const openDetailModal = (bookid) => {
        setSelectedRequestId(bookid);
        setIsModalOpen(true);
    };

    if (loading) return <div className="p-8"><Spinner /></div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Booking Requests</h1>
            {requests.length > 0 ? (
                <Card>
                    <div className="space-y-4">
                        {requests.map(req => (
                            <div key={req.bookid} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold text-lg">{req.service_name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">From: <span className="font-medium text-gray-700 dark:text-gray-300">{req.pet_owner_name}</span></p>
                                    <p className="mt-1 text-sm font-semibold">{new Date(req.servedate).toLocaleDateString()} at {req.slot}</p>
                                </div>
                                <Button onClick={() => openDetailModal(req.bookid)} variant="secondary">
                                    View Details
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            ) : (
                <Card className="text-center py-16">
                    <ClipboardList className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No new requests</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You have no pending booking requests at this time.</p>
                </Card>
            )}

            <BookingRequestDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAction={handleAction}
                bookingId={selectedRequestId}
            />
        </div>
    )
};

// Add this new component to your PAGE COMPONENTS section

const ProviderReviewsPage = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchReviews = async () => {
            setLoading(true);
            const res = await api.reviews.getForProvider(user.id);
            if (res.success) {
                setReviews(res.reviews);
                setStats(res.statistics);
            }
            setLoading(false);
        };
        fetchReviews();
    }, [user]);

    if (loading) return <div className="p-8"><Spinner /></div>;
    if (!stats) return <div className="p-8">Could not load review data.</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Reviews</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="flex flex-col items-center justify-center text-center">
                    <p className="text-gray-500 dark:text-gray-400">Overall Average Rating</p>
                    <p className="text-5xl font-bold my-2">{stats.averageRating.toFixed(1)}</p>
                    <StarRating rating={stats.averageRating} />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">from {stats.totalReviews} reviews</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-bold mb-3">Rating by Service</h3>
                    <div className="space-y-2">
                        {stats.serviceBreakdown.map(service => (
                            <div key={service.serviceName}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">{service.serviceName}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{service.averageRating.toFixed(1)} stars ({service.reviewCount} reviews)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div className="bg-yellow-400 h-2.5 rounded-full" style={{width: `${(service.averageRating / 5) * 100}%`}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <Card>
                <h2 className="text-xl font-bold mb-4">All Reviews</h2>
                <div className="space-y-4">
                    {reviews.length > 0 ? (
                        reviews.map(review => <ReviewCard key={review.id} review={review} />)
                    ) : (
                        <p className="text-center py-8 text-gray-500">You have not received any reviews yet.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

// =================================================================================
// NEW PAGE COMPONENT: ConversationsPage
// =================================================================================
const ConversationsPage = ({ navigate, setSelectedBookingId }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [selectedConversation, setSelectedConversation] = useState(null);

    useEffect(() => {
        const fetchConversations = async () => {
            if (!user) return; // Don't fetch if user isn't loaded
            setLoading(true);
            // MODIFIED: Pass the user object to the API call
            const res = await api.chat.getConversations(user);
            if (res.success) {
                // Sort conversations to show active ones first
                const sorted = res.conversations.sort((a, b) => {
                    const statusOrder = { 'in-progress': 1, 'confirmed': 2, 'pending': 3, 'completed': 4, 'cancelled': 5 };
                    return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
                });
                setConversations(sorted);
                if (sorted.length > 0) {
                    setSelectedConversation(sorted[0]);
                }
            }
            setLoading(false);
        };
        fetchConversations();
    }, [user]);


    return (
        <div className="flex h-full">
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">All Conversations</h1>
                </div>
                {loading ? <Spinner /> : conversations.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {conversations.map(convo => (
                            <div
                                key={convo.bookid}
                                className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedConversation?.bookid === convo.bookid ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                                onClick={() => setSelectedConversation(convo)}
                            >
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold text-gray-800 dark:text-white truncate pr-2">{convo.service_name}</p>
                                    <span className={`text-xs font-bold capitalize px-2 py-0.5 rounded-full ${
                                        {
                                            'in-progress': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                                            'confirmed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
                                            'completed': 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
                                        }[convo.status] || 'bg-gray-100 text-gray-500'
                                    }`}>{convo.status}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Chat with: {user.role === 'Pet owner' ? convo.provider_name : convo.owner_name}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{convo.message_count > 0 ? `${convo.message_count} messages` : 'No messages yet'}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400"/>
                        <p className="mt-2 text-sm text-gray-500">No conversations found.</p>
                    </div>
                )}
            </div>
            <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-900">
                <ChatPanel conversation={selectedConversation} />
            </div>
        </div>
    );
};


// --- Manager Pages ---

const ServiceApprovalsPage = ({ navigate, setSelectedServiceId }) => {
    const [pendingServices, setPendingServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingServices = async () => {
        setLoading(true);
        const res = await api.services.getPending();
        if (res.success) {
            setPendingServices(res.services);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPendingServices();
    }, []);

    const handleViewDetails = (serviceId) => {
        setSelectedServiceId(serviceId);
        navigate('serviceApprovalDetail');
    };

    if (loading) return <div className="p-8"><Spinner /></div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Service Approvals</h1>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Service Name</th>
                            <th scope="col" className="px-6 py-3">Provider</th>
                            <th scope="col" className="px-6 py-3">Price</th>
                            <th scope="col" className="px-6 py-3">Submitted</th>
                            {/* MODIFIED: Changed Actions column header */}
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pendingServices.map(s => (
                            <tr key={s.serviceid} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{s.name}</th>
                                <td className="px-6 py-4">{s.provider_name}</td>
                                <td className="px-6 py-4">${s.price}</td>
                                <td className="px-6 py-4">{new Date(s.submission_date).toLocaleDateString()}</td>
                                {/* MODIFIED: Actions cell now has a single "View Details" button */}
                                <td className="px-6 py-4">
                                    <Button onClick={() => handleViewDetails(s.serviceid)} className="!px-3 !py-1 text-xs">
                                        View Details
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {pendingServices.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">No services are currently pending approval.</p>}
            </Card>
            {/* The Reject Modal is now handled on the detail page, so it's removed from here. */}
        </div>
    );
};

const ManagerReportsPage = ({ navigate, setSelectedBookingId }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            const res = await api.reports.getSummary();
            if (res.success) {
                setSummary(res.summary);
            }
            setLoading(false);
        };
        fetchReports();
    }, []);

    const handleViewBooking = (report) => {
        setSelectedBookingId(report.bookid);
        navigate('managerBookingDetail'); // UPDATED: Navigates to the new manager-specific page
    };

    if (loading) return <div className="p-8"><Spinner /></div>;
    if (!summary) return <div className="p-8 text-center">Could not load report data.</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">User Reports</h1>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">All Filed Reports ({summary.totalReports})</h2>
                </div>
                {summary.recentReports.length > 0 ? (
                    <div className="space-y-4">
                        {summary.recentReports.map(report => (
                            <div key={report.bookid} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <p className="text-sm">
                                            Report against <span className="font-semibold">{report.provider_name}</span> for service <span className="font-semibold">"{report.service_name}"</span>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Filed by: {report.reporter_name} on {new Date(report.servedate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Button onClick={() => handleViewBooking(report)} variant="secondary" className="!text-xs !py-1 !px-2">
                                        View Booking
                                    </Button>
                                </div>
                                <blockquote className="mt-3 p-3 border-l-4 border-red-400 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                                    {report.text}
                                </blockquote>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <ShieldCheck className="mx-auto h-16 w-16 text-green-500" />
                        <h3 className="mt-2 text-lg font-medium">No Reports Found</h3>
                        <p className="mt-1 text-sm text-gray-500">There are currently no customer reports filed against any services.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

const ManagerDashboard = ({ setPage }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummaries = async () => {
            setLoading(true);
            const [serviceRes, reportRes, ticketRes] = await Promise.all([
                api.services.getReviewSummary(),
                api.reports.getSummary(),
                api.helpdesk.getAll() // Re-use existing ticket API
            ]);

            setSummary({
                services: serviceRes.success ? serviceRes.summary : null,
                reports: reportRes.success ? reportRes.summary : null,
                tickets: ticketRes.success ? ticketRes.tickets : [],
            });
            setLoading(false);
        };
        fetchSummaries();
    }, []);

    if (loading) return <div className="p-8"><Spinner /></div>;
    if (!summary) return <div className="p-8">Could not load dashboard data.</div>;

    const openTicketsCount = summary.tickets.filter(t => t.status === 'open').length;

    const statCards = [
        { label: "Services Pending Approval", value: summary.services?.statistics?.pending_count || 0, icon: <Briefcase />, page: 'serviceApprovals' },
        { label: "Open Support Tickets", value: openTicketsCount, icon: <LifeBuoy />, page: 'supportTickets' },
        { label: "Total User Reports", value: summary.reports?.totalReports || 0, icon: <Flag />, page: 'managerDashboard' }, // Stays on page for now
    ];

    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manager Dashboard</h1>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map(stat => (
                    <Card key={stat.label} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setPage(stat.page)}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                                {React.cloneElement(stat.icon, { size: 24 })}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Detailed Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Pending Services</h2>
                        {/* This button now correctly navigates to the dedicated page */}
                        <Button variant="secondary" onClick={() => setPage('serviceApprovals')}>View All</Button>
                    </div>
                    {summary.services && summary.services.statistics.pending_count > 0 ? (
                        <p>{summary.services.statistics.pending_count} service(s) currently awaiting review.</p>
                    ) : (
                        <p className="text-gray-500">There are no services pending approval.</p>
                    )}
                </Card>

                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Recent User Reports</h2>
                    </div>
                    <div className="space-y-3 text-sm">
                        {(summary.reports?.recentReports || []).map(report => (
                            <div key={report.bookid} className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                                <p className="font-semibold truncate">{report.text}</p>
                                <p className="text-xs text-red-600 dark:text-red-400">on service "{report.service_name}"</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

// --- Browse Services Page ---

const ServiceCard = ({ service, navigate, setSelectedServiceId }) => (
    <Card className="flex flex-col">
        <div className="flex-grow">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{service.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <Building size={16}/>
                <span>{service.provider_name}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{service.description}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center"><DollarSign size={18} className="mr-1"/>{service.price}</p>
            <Button onClick={() => {setSelectedServiceId(service.serviceid); navigate('serviceDetail');}}>View Details</Button>
        </div>
    </Card>
);

const BrowseServicesPage = ({navigate, setSelectedServiceId}) => {
    const { isAuthenticated } = useAuth();
    const [services, setServices] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        q: '',
        typeids: [],
        minPrice: '',
        maxPrice: '',
        sortBy: 'name',
        sortOrder: 'asc',
        serviceTypeName: '',
    });


    const [userPets, setUserPets] = useState([]);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);

    useEffect(() => {
        const fetchTypes = async () => {
            const res = await api.services.getTypes();
            if (res.success) setServiceTypes(res.serviceTypes);
        };
        fetchTypes();
    }, []);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            const res = await api.services.search(filters);
            if (res.success) {
                setServices(res.services);
            }
            setLoading(false);
        };

        const timerId = setTimeout(() => {
            fetchServices();
        }, 300); // Debounce API calls

        return () => clearTimeout(timerId);
    }, [filters]);


    const handleOpenBookingModal = async (service) => {
        if (!isAuthenticated) {
            navigate('login');
            return;
        }
        const res = await api.pets.getAll();
        if (res.success) {
            setUserPets(res.pets);
            setSelectedServiceForBooking(service);
            setIsBookingModalOpen(true);
        } else {
            alert("Could not load your pets. Please try again.");
        }
    };

    const handleBookingSubmit = async (bookingData) => {
        await api.bookings.create(bookingData);
        setIsBookingModalOpen(false);
        alert("Booking request sent! You can view its status in your schedule.");
        navigate('schedule');
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Browse Pet Services</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Find the perfect service for your furry friend.</p>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <ServiceFilter filters={filters} setFilters={setFilters} serviceTypes={serviceTypes} />

                <div className="flex-1">
                    <div className="mb-6 relative">
                        <Input
                            label="Search by keyword"
                            name="search"
                            value={filters.q}
                            onChange={(e) => setFilters(prev => ({...prev, q: e.target.value}))}
                            placeholder="e.g., 'dog walking', 'grooming', 'Happy Paws'..."
                        />
                        <div className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {loading ? <Spinner /> : services.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {services.map(service => (
                                <Card key={service.serviceid} className="flex flex-col">
                                    <div className="flex-grow cursor-pointer" onClick={() => {setSelectedServiceId(service.serviceid); navigate('serviceDetail');}}>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{service.name}</h3>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            <Building size={16}/>
                                            <span>{service.provider_name}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{service.description}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center"><DollarSign size={18} className="mr-1"/>{service.price}</p>
                                        <Button onClick={() => handleOpenBookingModal(service)}>Book Now</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-16 text-gray-500 dark:text-gray-400">No services found matching your criteria.</p>
                    )}
                </div>
            </div>

            {selectedServiceForBooking &&
                <BookingFormModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    onSubmit={handleBookingSubmit}
                    service={selectedServiceForBooking}
                    pets={userPets}
                />
            }
        </div>
    );
};

// --- Schedule Page (Formerly My Bookings) ---

const Calendar = ({ scheduleItems, onDateClick, currentDate, setCurrentDate, itemColorClass, allowDateClick = false }) => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());
    const endDate = new Date(endOfMonth);
    if(endOfMonth.getDay() !== 6) {
        endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));
    }

    const dates = [];
    let date = new Date(startDate);
    while (date <= endDate) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    const getEventsForDate = (date, items) => {
        const events = [];
        const today = new Date(date);
        today.setHours(0,0,0,0);

        const checkEndDate = (item, date) => {
            if (!item.enddate) return true;
            const endDate = new Date(item.enddate);
            endDate.setHours(23, 59, 59, 999);
            return date <= endDate;
        };

        const isRecurringMatch = (startDate, today, repeatOption) => {
            const timeDiff = today.getTime() - startDate.getTime();
            const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            
            switch (repeatOption) {
                case 'never':
                case 'none':
                    return startDate.getTime() === today.getTime();
                
                case 'hourly':
                    // For calendar view, show daily (since we can't show hourly granularity)
                    return daysDiff >= 0;
                
                case 'daily':
                    return daysDiff >= 0;
                
                case 'weekly':
                    return daysDiff >= 0 && today.getDay() === startDate.getDay();
                
                case 'biweekly':
                    return daysDiff >= 0 && today.getDay() === startDate.getDay() && Math.floor(daysDiff / 7) % 2 === 0;
                
                case 'monthly':
                    if (daysDiff < 0) return false;
                    
                    // Check if it's the same day of the month
                    const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                                     (today.getMonth() - startDate.getMonth());
                    
                    // Create a date for this month's occurrence
                    const thisMonthDate = new Date(startDate.getFullYear(), startDate.getMonth() + monthsDiff, startDate.getDate());
                    
                    // Handle cases where the day doesn't exist in the current month (e.g., Feb 31st)
                    if (thisMonthDate.getDate() !== startDate.getDate()) {
                        // Use the last day of the month instead
                        thisMonthDate.setDate(0);
                    }
                    
                    return thisMonthDate.getTime() === today.getTime();
                
                case 'every 3 months':
                    if (daysDiff < 0) return false;
                    
                    const months3Diff = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                                       (today.getMonth() - startDate.getMonth());
                    
                    if (months3Diff % 3 !== 0) return false;
                    
                    const thisQuarterDate = new Date(startDate.getFullYear(), startDate.getMonth() + months3Diff, startDate.getDate());
                    if (thisQuarterDate.getDate() !== startDate.getDate()) {
                        thisQuarterDate.setDate(0);
                    }
                    
                    return thisQuarterDate.getTime() === today.getTime();
                
                case 'every 6 months':
                    if (daysDiff < 0) return false;
                    
                    const months6Diff = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                                       (today.getMonth() - startDate.getMonth());
                    
                    if (months6Diff % 6 !== 0) return false;
                    
                    const thisSemiAnnualDate = new Date(startDate.getFullYear(), startDate.getMonth() + months6Diff, startDate.getDate());
                    if (thisSemiAnnualDate.getDate() !== startDate.getDate()) {
                        thisSemiAnnualDate.setDate(0);
                    }
                    
                    return thisSemiAnnualDate.getTime() === today.getTime();
                
                case 'yearly':
                    if (daysDiff < 0) return false;
                    
                    // Check if it's the same month and day
                    return today.getMonth() === startDate.getMonth() && 
                           today.getDate() === startDate.getDate();
                
                default:
                    return false;
            }
        };

        items.forEach(item => {
            const startDate = new Date(item.startdate);
            startDate.setHours(0,0,0,0);

            if (today >= startDate && checkEndDate(item, today) && 
                isRecurringMatch(startDate, today, item.repeat_option)) {
                console.log(`📅 Event matched for ${today.toDateString()}:`, {
                    title: item.title,
                    startDate: startDate.toDateString(),
                    repeatOption: item.repeat_option,
                    daysDiff: Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                });
                events.push(item);
            }
        });
        return events;
    };


    return (
        <Card className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <Button variant="secondary" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}><ChevronLeft size={20}/></Button>
                <h2 className="text-xl font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <Button variant="secondary" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}><ChevronRight size={20}/></Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-500 dark:text-gray-400">
                {daysOfWeek.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 gap-1 flex-1">
                {dates.map((d, i) => {
                    const dayItems = getEventsForDate(d, scheduleItems);
                    const isToday = d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                    const isCurrentMonth = d.getMonth() === currentDate.getMonth();

                    return (
                        <div 
                            key={i} 
                            className={`border border-gray-200 dark:border-gray-700 rounded-md p-1.5 flex flex-col ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'} ${allowDateClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
                            onClick={allowDateClick ? () => onDateClick({ date: d }) : undefined}
                        >
                            <span className={`font-medium mb-1 ${isToday ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'text-gray-900 dark:text-white'}`}>{d.getDate()}</span>
                            <div className="flex-1 overflow-y-auto text-xs space-y-1">
                                {dayItems.map(item => (
                                    <div 
                                        key={item.id} 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDateClick(item);
                                        }} 
                                        className={`p-1.5 rounded-md text-white cursor-pointer text-xs ${itemColorClass(item)}`}
                                    >
                                        <p className="font-bold truncate"><span className="font-mono">{item.time}</span> - {item.title}</p>
                                        <p className="truncate opacity-80">{item.petName || (item.pets && item.pets.map(p => p.name).join(', '))}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

// Personal Schedule Detail Panel for pet-specific schedule view
const PersonalScheduleDetailPanel = ({ clickedDate, personalSchedule, pets, loading }) => {
    const [selectedPetForDetails, setSelectedPetForDetails] = useState(null);
    
    if (!clickedDate) {
        return (
            <Card className="w-full md:w-1/3 lg:w-96 flex flex-col">
                <div className="flex-1 flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
                    <p>Click on a calendar date to view pet schedules.</p>
                </div>
            </Card>
        );
    }

    // Show loading if schedule data is still being fetched
    if (loading?.personal) {
        return (
            <Card className="w-full md:w-1/3 lg:w-96 flex flex-col">
                <div className="flex-1 flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
                    <Spinner />
                </div>
            </Card>
        );
    }

    // Find all schedule items for the clicked date (including recurring events)
    const dateString = clickedDate.toISOString().split('T')[0];
    const clickedDateObj = new Date(clickedDate);
    clickedDateObj.setHours(0,0,0,0);
    
    const isRecurringMatch = (startDate, targetDate, repeatOption) => {
        const timeDiff = targetDate.getTime() - startDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        switch (repeatOption) {
            case 'never':
            case 'none':
                return startDate.getTime() === targetDate.getTime();
            
            case 'hourly':
            case 'daily':
                return daysDiff >= 0;
            
            case 'weekly':
                return daysDiff >= 0 && targetDate.getDay() === startDate.getDay();
            
            case 'biweekly':
                return daysDiff >= 0 && targetDate.getDay() === startDate.getDay() && Math.floor(daysDiff / 7) % 2 === 0;
            
            case 'monthly':
                if (daysDiff < 0) return false;
                
                const monthsDiff = (targetDate.getFullYear() - startDate.getFullYear()) * 12 + 
                                 (targetDate.getMonth() - startDate.getMonth());
                
                const thisMonthDate = new Date(startDate.getFullYear(), startDate.getMonth() + monthsDiff, startDate.getDate());
                
                if (thisMonthDate.getDate() !== startDate.getDate()) {
                    thisMonthDate.setDate(0);
                }
                
                return thisMonthDate.getTime() === targetDate.getTime();
            
            case 'every 3 months':
                if (daysDiff < 0) return false;
                
                const months3Diff = (targetDate.getFullYear() - startDate.getFullYear()) * 12 + 
                                   (targetDate.getMonth() - startDate.getMonth());
                
                if (months3Diff % 3 !== 0) return false;
                
                const thisQuarterDate = new Date(startDate.getFullYear(), startDate.getMonth() + months3Diff, startDate.getDate());
                if (thisQuarterDate.getDate() !== startDate.getDate()) {
                    thisQuarterDate.setDate(0);
                }
                
                return thisQuarterDate.getTime() === targetDate.getTime();
            
            case 'every 6 months':
                if (daysDiff < 0) return false;
                
                const months6Diff = (targetDate.getFullYear() - startDate.getFullYear()) * 12 + 
                                   (targetDate.getMonth() - startDate.getMonth());
                
                if (months6Diff % 6 !== 0) return false;
                
                const thisSemiAnnualDate = new Date(startDate.getFullYear(), startDate.getMonth() + months6Diff, startDate.getDate());
                if (thisSemiAnnualDate.getDate() !== startDate.getDate()) {
                    thisSemiAnnualDate.setDate(0);
                }
                
                return thisSemiAnnualDate.getTime() === targetDate.getTime();
            
            case 'yearly':
                if (daysDiff < 0) return false;
                
                return targetDate.getMonth() === startDate.getMonth() && 
                       targetDate.getDate() === startDate.getDate();
            
            default:
                return false;
        }
    };

    const checkEndDate = (item, date) => {
        if (!item.enddate) return true;
        const endDate = new Date(item.enddate);
        endDate.setHours(23, 59, 59, 999);
        return date <= endDate;
    };
    
    const itemsForDate = personalSchedule.filter(item => {
        const itemStartDate = new Date(item.startdate);
        itemStartDate.setHours(0,0,0,0);
        
        return clickedDateObj >= itemStartDate && 
               checkEndDate(item, clickedDateObj) && 
               isRecurringMatch(itemStartDate, clickedDateObj, item.repeat_option);
    });

    // Group items by pet - now we can be sure pets data is available
    const petGroups = itemsForDate.reduce((groups, item) => {
        const petId = item.petId;
        if (!groups[petId]) {
            const pet = pets.find(p => p.petid === petId);
            if (pet) {
                groups[petId] = {
                    pet: pet,
                    items: []
                };
            } else {
                // Only create fallback if pet really doesn't exist in the database
                console.warn(`Schedule item references pet ID ${petId} that doesn't exist in user's pets`);
                return groups; // Skip this item since the pet doesn't belong to this user
            }
        }
        if (groups[petId]) {
            groups[petId].items.push(item);
        }
        return groups;
    }, {});

    const petsWithSchedules = Object.values(petGroups);

    if (selectedPetForDetails) {
        const petGroup = petGroups[selectedPetForDetails.petid];
        if (petGroup) {
            return (
                <Card className="w-full md:w-1/3 lg:w-96 flex flex-col">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setSelectedPetForDetails(null)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold">{petGroup.pet.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{clickedDate.toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        {petGroup.items.map((item, index) => (
                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    {item.type === 'diet' ? <Utensils size={16} className="text-purple-500" /> : <Footprints size={16} className="text-pink-500" />}
                                    <h3 className="font-semibold">{item.title}</h3>
                                </div>
                                <div className="text-sm space-y-1">
                                    <p><strong>Time:</strong> {item.time}</p>
                                    <p><strong>Repeat:</strong> {item.repeat_option}</p>
                                    {item.type === 'diet' && item.quantity && (
                                        <p><strong>Quantity:</strong> {item.quantity}</p>
                                    )}
                                    {item.description && (
                                        <p><strong>Notes:</strong> {item.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            );
        }
    }

    return (
        <Card className="w-full md:w-1/3 lg:w-96 flex flex-col">
            <h2 className="text-xl font-bold mb-4">Schedules for {clickedDate.toLocaleDateString()}</h2>
            
            {petsWithSchedules.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
                    <p>No schedules found for this date.</p>
                </div>
            ) : (
                <div className="flex-1 space-y-3">
                    {petsWithSchedules.map(({ pet, items }) => (
                        <button
                            key={pet.petid || `missing-${items[0]?.petId}`}
                            onClick={() => setSelectedPetForDetails(pet)}
                            className="w-full p-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{pet.name}</h3>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        {items.length} schedule{items.length !== 1 ? 's' : ''} ({items.filter(i => i.type === 'diet').length} diet, {items.filter(i => i.type === 'activity').length} activity)
                                    </p>
                                </div>
                                <ChevronRight size={16} className="text-gray-400" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </Card>
    );
};

const EventDetailPanel = ({ item, navigate, setSelectedBookingId }) => {
    if (!item) {
        return (
            <Card className="w-full md:w-1/3 lg:w-96 flex flex-col">
                <div className="flex-1 flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
                    <p>Select an item from the calendar to view details.</p>
                </div>
            </Card>
        )
    }

    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState("");
    const [chatUpdates, setChatUpdates] = useState([]);
    const [loadingChat, setLoadingChat] = useState(false);

    useEffect(() => {
        if (item?.type === 'booking' && ['confirmed', 'in-progress', 'completed'].includes(item.status)) {
            const fetchChat = async () => {
                setLoadingChat(true);
                const res = await api.bookings.getChatUpdates(item.bookid);
                if(res.success) setChatUpdates(res.updates);
                setLoadingChat(false);
            };
            fetchChat();
        } else {
            setChatUpdates([]);
        }
    }, [item]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !item) return;

        const res = await api.chat.sendMessage(item.bookid, newMessage, user);
        if(res.success) {
            setChatUpdates(prev => [...prev, res.update]);
            setNewMessage("");
        }
    };

    const handleViewBookingDetails = () => {
        if (!item || item.type !== 'booking') return;

        setSelectedBookingId(item.bookid);

        // A simple check to see if this is being rendered in a provider context.
        // A more robust solution might use a prop passed down from the parent page.
        if (item.provider_name) { // This item has provider_name, so it's an owner's booking
            navigate('bookingDetail');
        } else { // This is a provider's view of a booking
            navigate('providerBookingDetail');
        }
    };

    const isBooking = item.type === 'booking';
    const isDiet = item.type === 'diet';
    const isActivity = item.type === 'activity';
    const canChat = isBooking && ['confirmed', 'in-progress', 'completed'].includes(item.status);

    return (
        <Card className="w-full md:w-1/3 lg:w-96 flex flex-col">
            <h2 className="text-xl font-bold mb-4">Event Details</h2>
            <div className="flex-1 flex flex-col">

                <div className="border-b pb-4 mb-4 border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold">{item.title}</h3>
                    {isBooking && <p className="text-sm text-gray-500 dark:text-gray-400">{item.provider_name}</p>}
                    <p className="text-sm text-gray-500 dark:text-gray-400">For: {item.petName || (item.pets && item.pets.map(p => p.name).join(', '))}</p>
                    {(isDiet || isActivity) && (
                        <>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Time: {item.time}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Date: {new Date(item.startdate).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Repeat: {item.repeat_option}</p>
                        </>
                    )}
                    {isBooking && (

                        <Button variant="secondary" className="!text-xs !py-1 !px-2 mt-2" onClick={handleViewBookingDetails}>
                            View Full Booking
                        </Button>
                    )}
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto p-1 text-sm">
                    {isDiet && (<>
                        <p><strong>Quantity:</strong> {item.quantity}</p>
                        {item.description && <p><strong>Notes:</strong> {item.description}</p>}
                    </>)}
                    {isActivity && (<>
                        <p><strong>Duration:</strong> {item.duration}</p>
                        {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
                    </>)}
                    {/* Live Chat Section */}
                    {canChat && loadingChat && <Spinner/>}
                    {canChat && !loadingChat && chatUpdates.map((update, i) => {
                        const isMyMessage = (user.role === 'Pet owner' && update.from === 'owner') || (user.role === 'Service provider' && update.from === 'provider');
                        return (
                            <div key={i} className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                {!isMyMessage && <User className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 p-1"/>}
                                <div className={`max-w-xs lg:max-w-md rounded-lg px-3 py-2 ${isMyMessage ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                    {update.image && <img src={update.image} alt="Update" className="mb-2 rounded-lg"/>}
                                    {update.text && <p className="text-sm">{update.text}</p>}
                                    <p className={`text-xs mt-1 opacity-70 ${isMyMessage ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>{update.timestamp}</p>
                                </div>
                                {isMyMessage && <User className="h-8 w-8 rounded-full bg-blue-500 text-white p-1"/>}
                            </div>
                        )
                    })}
                </div>
            </div>
            {/* Chat Input */}
            {canChat && (
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSendMessage} className="relative">
                        <Input name="chat" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)}/>
                        <Button type="submit" className="!p-2 absolute right-1 top-1/2 -translate-y-1/2"><Send size={18}/></Button>
                    </form>
                </div>
            )}
        </Card>
    );
};

// Add this new component within the PAGE COMPONENTS section

const ProviderReportsPage = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchReports = async () => {
            setLoading(true);
            const res = await api.reports.getForProvider(user.id);
            if (res.success) {
                setReports(res.reports);
            }
            setLoading(false);
        };
        fetchReports();
    }, [user]);

    if (loading) return <div className="p-8"><Spinner /></div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Customer Reports</h1>
            <Card>
                {reports.length > 0 ? (
                    <div className="space-y-6">
                        {reports.map(report => (
                            <div key={report.bookid} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-100">{report.service_name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Report for service on {new Date(report.servedate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">REPORT FILED</span>
                                </div>
                                <blockquote className="mt-4 p-4 border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
                                    {report.text}
                                </blockquote>
                                {report.image && (
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">An image was included with this report.</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <ShieldCheck className="mx-auto h-16 w-16 text-green-500" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No Reports Found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You have no active customer reports against your services. Keep up the great work!</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

// Add these two new components in the PAGE COMPONENTS section

const ForgotPasswordPage = ({ setPage }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await api.auth.forgotPassword(email);
        setLoading(false);
        if (res.success) {
            setMessage(res.message);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Forgot Your Password?
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Enter your email and we'll send you a reset code.
                    </p>
                </div>
                <Card>
                    {!message ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <Input label="Email address" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your-email@example.com" />
                            <Button type="submit" className="w-full justify-center" disabled={loading}>
                                {loading ? <Spinner /> : 'Send Reset Code'}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <p className="text-green-600 dark:text-green-400">{message}</p>
                            <Button onClick={() => setPage('resetPassword')} className="mt-4">
                                Enter Code
                            </Button>
                        </div>
                    )}
                    <p className="text-center text-sm mt-4">
                        Remember your password?{' '}
                        <a href="#" onClick={(e) => { e.preventDefault(); setPage('login'); }} className="font-medium text-blue-600 hover:text-blue-500">
                            Back to Login
                        </a>
                    </p>
                </Card>
            </div>
        </div>
    );
};

const ResetPasswordPage = ({ setPage }) => {
    const [formData, setFormData] = useState({ email: '', code: '', newPassword: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        const res = await api.auth.resetPassword(formData);
        setLoading(false);
        if (res.success) {
            setMessage(res.message);
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <h2 className="mt-6 text-center text-3xl font-extrabold">Reset Your Password</h2>
                <Card>
                    {!message ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <Input label="Email address" name="email" type="email" value={formData.email} onChange={handleChange} />
                            <Input label="6-Digit Code" name="code" value={formData.code} onChange={handleChange} />
                            <Input label="New Password" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} />
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <Button type="submit" className="w-full justify-center" disabled={loading}>
                                {loading ? <Spinner /> : 'Reset Password'}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <p className="text-green-600 dark:text-green-400">{message}</p>
                            <Button onClick={() => setPage('login')} className="mt-4">
                                Proceed to Login
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

// Add this new component to your PAGE COMPONENTS section

const ProviderResultCard = ({ provider, navigate, setSelectedProviderId }) => (
    <Card className="flex flex-col text-center hover:shadow-lg transition-shadow duration-300">
        <div className="flex-grow">
            <img src={provider.logo} alt={provider.business_name} className="w-24 h-24 mx-auto rounded-full object-cover mb-4 shadow-lg border-4 border-white dark:border-gray-700" />
            <h3 className="text-xl font-bold">{provider.business_name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1"><MapPin size={14}/> {provider.city}</p>
            <div className="my-3 text-sm text-gray-600 dark:text-gray-300 min-h-[40px]">
                <p>{provider.description}</p>
            </div>
            {/* ADDED: Service Type Tags */}
            <div className="my-4 flex flex-wrap justify-center gap-2">
                {provider.service_types?.map(type => (
                    <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full dark:bg-blue-900/50 dark:text-blue-300">
                        {type}
                    </span>
                ))}
            </div>
        </div>
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex justify-around text-sm">
                <div className="flex items-center gap-1"><Star className="text-yellow-400" size={16}/> {provider.average_rating.toFixed(1)} ({provider.total_reviews} reviews)</div>
                <div className="flex items-center gap-1"><Briefcase size={16}/> {provider.approved_service_count} Services</div>
            </div>
            {/* ADDED: Explicit "View Profile" button */}
            <Button className="w-full mt-2" onClick={() => { setSelectedProviderId(provider.userid); navigate('providerProfile'); }}>
                View Profile
            </Button>
        </div>
    </Card>
);

const BrowseProvidersPage = ({ navigate, setSelectedProviderId }) => {
    const [providers, setProviders] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]); // To populate the filter
    const [loading, setLoading] = useState(true);

    // State to hold all filter values
    const [filters, setFilters] = useState({
        q: '',
        typeids: [],
        minPrice: '',
        maxPrice: '',
        sortBy: 'name',
        sortOrder: 'asc',
        serviceTypeName: '',
        city: '' // Added city
    });
    // Fetch service types for the filter component
    useEffect(() => {
        const fetchTypes = async () => {
            const res = await api.services.getTypes();
            if (res.success) setServiceTypes(res.serviceTypes);
        };
        fetchTypes();
    }, []);

    useEffect(() => {
        const fetchProviders = async () => {
            setLoading(true);
            // Pass all filters to the API call
            const res = await api.profile.getProviders(filters);
            if (res.success) {
                setProviders(res.providers);
            }
            setLoading(false);
        };

        const timerId = setTimeout(() => fetchProviders(), 300); // Debounce search
        return () => clearTimeout(timerId);
    }, [filters]); // Refetch whenever any filter changes

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Browse Service Providers</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Find trusted and verified professionals for your pet.</p>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* INTEGRATED: The ServiceFilter is now part of this page */}
                <ServiceFilter filters={filters} setFilters={setFilters} serviceTypes={serviceTypes} />

                <div className="flex-1">
                    <div className="mb-6 relative">
                        <Input
                            label="Search by name or description"
                            name="search"
                            value={filters.q}
                            onChange={(e) => setFilters(prev => ({...prev, q: e.target.value}))}
                            placeholder="e.g., 'Happy Paws', 'Daycare', 'Grooming'..."
                        />
                        <div className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {loading ? <Spinner /> : providers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {providers.map(provider => (
                                <ProviderResultCard key={provider.userid} provider={provider} navigate={navigate} setSelectedProviderId={setSelectedProviderId} />
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-16">
                            <p className="text-gray-500">No providers found matching your criteria.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
// =================================================================================
// NEW NOTIFICATION COMPONENTS
// =================================================================================

const NotificationsDropdown = ({ setPage, navigate, closeDropdown }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // This function will handle clicks and navigation
    const handleNotificationClick = (notification) => {
        // Implement navigation logic here based on notification.type and notification.targetId
        // For now, it will just navigate to the main notifications page
        navigate('notifications');
        closeDropdown(); // Close dropdown after click
    };

    useEffect(() => {
        const fetchNotifs = async () => {
            setLoading(true);
            const res = await api.notifications.getAll({ unreadOnly: true, limit: 5 });
            if (res.success) {
                // Filter notifications for the current user
                setNotifications(res.notifications.filter(n => n.userid === user.id).slice(0, 5));
            }
            setLoading(false);
        };
        if(user) fetchNotifs();
    }, [user]);

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-lg">Notifications</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
                {loading ? <Spinner/> : notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div key={notif.notiid} onClick={() => handleNotificationClick(notif)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-start gap-3">
                            <div className="flex-shrink-0 pt-1">
                                <NotificationIcon type={notif.type} />
                            </div>
                            <div>
                                <p className="text-sm">{notif.text}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="p-4 text-sm text-center text-gray-500">No new notifications.</p>
                )}
            </div>
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => { navigate('notifications'); closeDropdown(); }} className="w-full text-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md p-2">
                    View All Notifications
                </button>
            </div>
        </div>
    );
}

const NotificationsPage = ({ navigate, setSelectedBookingId, setSelectedServiceId, setSelectedTicketId /* Add more setters as needed */ }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingNotifications, setDeletingNotifications] = useState(new Set());

    const fetchNotifications = async () => {
        setLoading(true);
        const res = await api.notifications.getAll();
        if (res.success) {
            // Filter notifications for the current user
            setNotifications(res.notifications.filter(n => n.userid === user.id));
        }
        setLoading(false);
    };

    useEffect(() => {
        if(user) fetchNotifications();
    }, [user]);

    const handleNotificationClick = (notif) => {
        // Mark as read when clicked
        api.notifications.markAsRead(notif.notiid);

        // Navigate based on type
        switch (notif.type) {
            case 'booking_accepted':
            case 'chat':
                setSelectedBookingId(notif.targetId);
                navigate('bookingDetail');
                break;
            case 'booking_request':
                navigate('bookingRequests');
                break;
            case 'service_approved':
            case 'service_rejected':
            case 'review':
                setSelectedServiceId(notif.targetId);
                navigate('serviceDetail'); // Provider could be navigated to their service management page
                break;
            case 'service_pending':
                navigate('serviceApprovals');
                break;
            case 'ticket_new':
                // For manager, navigate to the specific ticket, for user, open their ticket list
                navigate(user.role === 'Manager' ? 'supportTickets' : 'helpDesk');
                break;
            case 'report':
                navigate('managerReports');
                break;
            case 'diet':
            case 'activity':
                navigate('schedule');
                break;
            default:
                // No action for general notifications
                break;
        }
        // Refresh the notifications list to update read status visually
        fetchNotifications();
    };

    const handleMarkAsRead = async (id) => {
        await api.notifications.markAsRead(id);
        fetchNotifications();
    };

    const handleMarkAllAsRead = async () => {
        await api.notifications.markAllAsRead();
        fetchNotifications();
    }

    const handleDelete = async (id) => {
        // Prevent multiple delete requests for the same notification
        if (deletingNotifications.has(id)) {
            console.log('Delete already in progress for notification ID:', id);
            return;
        }
        
        try {
            // Mark notification as being deleted
            setDeletingNotifications(prev => new Set([...prev, id]));
            
            await api.notifications.delete(id);
            fetchNotifications();
        } catch (error) {
            console.error('Delete notification error:', error);
            alert('Failed to delete notification: ' + (error.message || 'Unknown error'));
        } finally {
            // Remove notification from deleting set
            setDeletingNotifications(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                <Button onClick={handleMarkAllAsRead} variant="secondary">Mark All as Read</Button>
            </div>
            <Card>
                <div className="space-y-2">
                    {loading ? <Spinner /> : notifications.length > 0 ? (
                        notifications.map(notif => (
                            <div
                                key={notif.notiid}
                                className={`group p-4 rounded-lg flex items-start gap-4 transition-colors cursor-pointer ${notif.read_status === 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                                onClick={() => handleNotificationClick(notif)}
                            >
                                <div className="flex-shrink-0 pt-1">
                                    <NotificationIcon type={notif.type} />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm font-medium">{notif.text}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                                    <Button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(notif.notiid); }} 
                                        variant="danger" 
                                        className="!p-2"
                                        disabled={deletingNotifications.has(notif.notiid)}
                                    >
                                        {deletingNotifications.has(notif.notiid) ? <Spinner size="small" /> : <Trash2 size={16}/>}
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-16 text-gray-500">You have no notifications.</p>
                    )}
                </div>
            </Card>
        </div>
    );
}

const SchedulePage = ({ navigate, setSelectedBookingId }) => {
    const [activeTab, setActiveTab] = useState('services');
    const [bookings, setBookings] = useState([]);
    const [personalSchedule, setPersonalSchedule] = useState([]);
    const [chatUpdates, setChatUpdates] = useState([]);
    const [loading, setLoading] = useState({ bookings: true, personal: true, chat: false });
    const [selectedItem, setSelectedItem] = useState(null);
    const [clickedDate, setClickedDate] = useState(null); // For personal schedule date clicking
    const [currentDate, setCurrentDate] = useState(new Date());
    // Extract pets from schedule data instead of separate API call
    const [pets, setPets] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(prev => ({ ...prev, bookings: true }));
            const res = await api.bookings.getForOwner();
            if (res.success) {
                const formattedBookings = res.bookings.map(b => ({
                    ...b,
                    id: `b-${b.bookid}`,
                    type: 'booking',
                    title: b.service_name,
                    startdate: b.servedate,
                    time: b.slot,
                    repeat_option: 'none'
                }));
                setBookings(formattedBookings);
            }
            setLoading(prev => ({ ...prev, bookings: false }));
        };

        const fetchPersonalSchedule = async () => {
            setLoading(prev => ({...prev, personal: true }));
            const res = await api.petSchedule.get();
            console.log('Personal schedule API response:', res);
            if (res.success && res.schedules) {
                // Transform the schedule data to match Calendar component expectations
                const formattedSchedule = res.schedules.map(schedule => {
                    const isDiet = schedule.dietid != null;
                    const isActivity = schedule.activityid != null;
                    
                    // Format time as HH:MM
                    const timeString = `${schedule.hour.toString().padStart(2, '0')}:${schedule.minute.toString().padStart(2, '0')}`;
                    
                    return {
                        id: `schedule-${schedule.petscheduleid}`,
                        type: isDiet ? 'diet' : 'activity',
                        title: isDiet ? schedule.diet_name : schedule.activity_name,
                        startdate: schedule.startdate,
                        time: timeString,
                        petName: schedule.pet_name,
                        repeat_option: schedule.repeat_option,
                        // Include original data for detail panel
                        dietid: schedule.dietid,
                        activityid: schedule.activityid,
                        quantity: schedule.diet_amount, // For diet items
                        description: isDiet ? schedule.diet_description : schedule.activity_description, // For both types
                        duration: !isDiet ? 'Not specified' : undefined, // For activities (placeholder since we don't have duration in schedule)
                        notes: !isDiet ? schedule.activity_description : undefined, // For activities
                        petId: schedule.petid,
                        scheduleId: schedule.petscheduleid
                    };
                });
                console.log('Formatted personal schedule:', formattedSchedule);
                setPersonalSchedule(formattedSchedule);
                
                // Extract unique pets from schedule data
                const uniquePets = {};
                res.schedules.forEach(schedule => {
                    if (schedule.petid && schedule.pet_name && !uniquePets[schedule.petid]) {
                        uniquePets[schedule.petid] = {
                            petid: schedule.petid,
                            name: schedule.pet_name,
                            breed: 'Unknown', // Not available in schedule data
                            picture: null // Not needed for schedule display
                        };
                    }
                });
                setPets(Object.values(uniquePets));
            }
            setLoading(prev => ({...prev, personal: false }));
        }

        fetchBookings();
        fetchPersonalSchedule();
    }, []);

    useEffect(() => {
        if (selectedItem?.type === 'booking') {
            const fetchChat = async () => {
                setLoading(prev => ({...prev, chat: true}));
                const res = await api.bookings.getChatUpdates(selectedItem.bookid);
                if(res.success) setChatUpdates(res.updates);
                setLoading(prev => ({...prev, chat: false}));
            };
            fetchChat();
        } else {
            setChatUpdates([]);
        }
    }, [selectedItem]);

    const handleItemClick = (item) => {
        if (activeTab === 'services') {
            // For service bookings, show the item details
            setSelectedItem(item);
            setClickedDate(null);
        } else if (activeTab === 'personal') {
            // For personal schedule, when clicking on any schedule item or date, show all pets for that date
            if (item && item.date) {
                // Clicked on a date cell (no specific event)
                setClickedDate(item.date);
                setSelectedItem(null);
            } else if (item && item.startdate) {
                // Clicked on a specific event
                setClickedDate(new Date(item.startdate));
                setSelectedItem(null);
            }
        }
    };

    const getBookingColor = (item) => {
        const statusColors = {
            'in-progress': 'bg-green-500',
            'confirmed': 'bg-blue-500',
            'completed': 'bg-gray-400',
            'pending': 'bg-yellow-500',
        };
        return statusColors[item.status] || 'bg-gray-500';
    };

    const getPersonalScheduleColor = (item) => {
        return item.type === 'diet' ? 'bg-purple-500' : 'bg-pink-500';
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">My Schedule</h1>
            <div className="flex flex-col md:flex-row gap-6 flex-1">
                <div className="flex-1 flex flex-col">
                    <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button onClick={() => {setActiveTab('services'); setSelectedItem(null); setClickedDate(null);}} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'services' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Service Bookings
                            </button>
                            <button onClick={() => {setActiveTab('personal'); setSelectedItem(null); setClickedDate(null);}} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'personal' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Personal Pet Schedule
                            </button>
                        </nav>
                    </div>

                    <div className="flex-1">
                        {activeTab === 'services' && (
                            loading.bookings ? <Spinner/> :
                                <Calendar
                                    key="services-calendar"
                                    scheduleItems={bookings}
                                    onDateClick={handleItemClick}
                                    currentDate={currentDate}
                                    setCurrentDate={setCurrentDate}
                                    itemColorClass={getBookingColor}
                                />
                        )}
                        {activeTab === 'personal' && (
                            loading.personal ? <Spinner/> :
                                <Calendar
                                    key="personal-calendar"
                                    scheduleItems={personalSchedule}
                                    onDateClick={handleItemClick}
                                    currentDate={currentDate}
                                    setCurrentDate={setCurrentDate}
                                    itemColorClass={getPersonalScheduleColor}
                                    allowDateClick={true}
                                />
                        )}
                    </div>
                </div>
                {activeTab === 'services' ? (
                    <EventDetailPanel
                        key={selectedItem?.id || 'no-selection'}
                        item={selectedItem}
                        chatUpdates={chatUpdates}
                        setChatUpdates={setChatUpdates}
                        loading={loading.chat}
                        navigate={navigate}
                        setSelectedBookingId={setSelectedBookingId}
                    />
                ) : (
                    <PersonalScheduleDetailPanel
                        clickedDate={clickedDate}
                        personalSchedule={personalSchedule}
                        pets={pets}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
};

// --- Booking Detail Page ---

const BookingDetailPage = ({ bookingId, navigate, setSelectedBookingId, setSelectedServiceId, openReviewModal, goBack }) => {
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBooking = async () => {
        setLoading(true);
        const res = await api.bookings.getById(bookingId);
        if(res.success) {
            setBooking(res.booking);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchBooking();
    }, [bookingId]);

    const handleBack = () => {
        setSelectedBookingId(null);
        goBack();
    };

    const handleViewService = () => {
        setSelectedServiceId(booking.service.serviceid);
        navigate('serviceDetail');
    };

    // ===== NEW FEATURE: CANCEL BOOKING =====
    const handleCancelBooking = async () => {
        if (window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
            const res = await api.bookings.cancel(bookingId);
            if (res.success) {
                alert("Booking successfully cancelled.");
                setBooking(res.booking); // Update state with the new status
            } else {
                alert(`Error: ${res.error}`);
            }
        }
    };

    if (loading) return <div className="p-8"><Spinner/></div>;
    if (!booking || !booking.service) return <div className="p-8">Booking not found or is missing details.</div>;

    const statusDescriptions = {
        pending: 'Your request has been sent to the provider. You will be notified when they accept or reject it.',
        confirmed: 'Your booking is confirmed! The provider is expecting you and your pet(s) on the scheduled date.',
        'in-progress': 'The service is currently underway. You can check the Schedule page for live updates from your provider.',
        completed: 'This service has been completed. We hope you and your pet had a great experience!',
        cancelled: 'This booking has been cancelled.',
    };

    const StatusBadge = ({status}) => {
        const colors = {
            'in-progress': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            'confirmed': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            'completed': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
        return <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${colors[status] || colors.completed}`}>{status}</span>;
    }

    const canCancel = ['pending', 'confirmed'].includes(booking.status);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Button onClick={handleBack} variant="secondary" className="mb-6 flex items-center gap-2">
                <ChevronLeft size={16} /> Back
            </Button>

            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{booking.service.name}</h1>
                <p className="text-md text-gray-500 dark:text-gray-400">with {booking.service.provider_name}</p>
            </header>

            <div className="grid grid-cols-3 gap-2 mb-8">
                <img src="https://placehold.co/600x400/a0d2eb/ffffff?text=Service" alt="Service" className="col-span-2 row-span-2 rounded-lg object-cover h-full w-full"/>
                <img src={booking.pets[0]?.picture || "https://placehold.co/300x200/e2e8f0/4a5568?text=Pet"} alt="Pet" className="rounded-lg object-cover h-full w-full"/>
                { booking.pets.length > 1 && <img src={booking.pets[1]?.picture || "https://placehold.co/300x200/f8b400/ffffff?text=Pet+2"} alt="Pet" className="rounded-lg object-cover h-full w-full"/>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">

                    <section>
                        <h2 className="text-2xl font-bold border-b pb-4 mb-4 flex items-center gap-2"><Info /> Booking Status</h2>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex items-start gap-4">
                            <div className="flex-shrink-0 pt-1">
                                <StatusBadge status={booking.status}/>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">{statusDescriptions[booking.status]}</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold border-b pb-4 mb-4">Service Details</h2>
                        <p>{booking.service.description}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold border-b pb-4 mb-4">Your Pet(s) for this Service</h2>
                        {booking.pets.map(pet => {
                            const placeholderImage = "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100' height='100' fill='%23e5e7eb'/%3e%3ctext x='50' y='50' font-size='12' text-anchor='middle' dy='.3em' fill='%23374151'%3eNo Image%3c/text%3e%3c/svg%3e";
                            return (
                                <div key={pet.petid} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <img 
                                        src={pet.picture || placeholderImage} 
                                        alt={pet.name} 
                                        className="h-16 w-16 rounded-full object-cover"
                                        onError={(e) => { e.target.src = placeholderImage; }}
                                    />
                                    <div>
                                        <h3 className="font-bold">{pet.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{pet.breed}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold border-b pb-4 mb-4">About Your Provider</h2>
                        <div className="flex items-center gap-4">
                            <User className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 p-2"/>
                            <div>
                                <h3 className="font-bold text-lg">{booking.service.provider_name}</h3>
                                {booking.service.website && <a href={booking.service.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">Visit Website <ExternalLink size={14}/></a>}
                                <Button onClick={handleViewService} variant="secondary" className="!text-xs !py-1 !px-2 mt-2">View Original Service</Button>
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <div className="space-y-4">
                            <div className="border-b pb-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><DollarSign size={16}/> Price</span>
                                    <span className="font-bold text-xl">${booking.service.price}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><CalendarDays size={16}/> Date</span>
                                    <span className="text-right">{new Date(booking.servedate).toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Clock size={16}/> Time</span>
                                    <span>{booking.slot} ({booking.service.duration})</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><CreditCard size={16}/> Payment</span>
                                    <span className="capitalize">{booking.payment_method?.replace('_', ' ') || "Cash"}</span>
                                </div>
                            </div>

                            {booking.status === 'completed' && !booking.hasReviewed && (
                                <Button className="w-full mt-4" onClick={() => openReviewModal(booking.service.serviceid, booking.service.name)}>
                                    Write a Review
                                </Button>
                            )}
                            {booking.status === 'completed' && booking.hasReviewed && (
                                <div className="text-center text-sm text-green-600 dark:text-green-400 pt-2">You've reviewed this service!</div>
                            )}

                            {canCancel && (
                                <Button onClick={handleCancelBooking} variant="danger" className="w-full mt-2">
                                    Cancel Booking
                                </Button>
                            )}

                            <Button className="w-full" variant={booking.status === 'completed' ? 'secondary' : 'primary'} disabled={booking.status !== 'in-progress'} onClick={() => navigate('schedule')}>
                                {booking.status === 'in-progress' ? 'View Live Chat' : 'Chat with Provider'}
                            </Button>
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    )
}

const ManagerBookingDetailPage = ({ bookingId, goBack }) => {
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (bookingId) {
            const fetchBookingDetails = async () => {
                setLoading(true);
                const res = await api.bookings.getForManager(bookingId);
                if (res.success) {
                    setBooking(res.booking);
                }
                setLoading(false);
            };
            fetchBookingDetails();
        }
    }, [bookingId]);

    if (loading) return <div className="p-8"><Spinner/></div>;
    if (!booking) return <div className="p-8">Booking details not found.</div>;

    const { owner, service, pets } = booking;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Button onClick={goBack} variant="secondary" className="mb-6 flex items-center gap-2">
                <ChevronLeft size={16} /> Back to Reports
            </Button>

            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Booking Overview</h1>
                <p className="text-md text-gray-500 dark:text-gray-400">Manager View for Booking #{booking.bookid}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-xl font-bold mb-4">Pet Owner Details</h2>
                    <p><strong>Name:</strong> {owner.name}</p>
                    <p><strong>Email:</strong> {owner.email}</p>
                    <p><strong>Phone:</strong> {owner.phone}</p>
                    <p><strong>Address:</strong> {owner.address}</p>
                </Card>
                <Card>
                    <h2 className="text-xl font-bold mb-4">Provider Details</h2>
                    <p><strong>Business:</strong> {service.provider_name}</p>
                    <p><strong>Phone:</strong> {service.phone}</p>
                    <p><strong>Address:</strong> {service.address}</p>
                </Card>
            </div>
            <Card className="mt-8">
                <h2 className="text-xl font-bold mb-4">Service & Booking Information</h2>
                <p><strong>Service:</strong> {service.name}</p>
                <p><strong>Date & Time:</strong> {new Date(booking.servedate).toLocaleDateString()} at {booking.slot}</p>
                <p><strong>Status:</strong> <span className="font-semibold capitalize">{booking.status}</span></p>
                <p><strong>Pets on Booking:</strong> {pets.map(p => p.name).join(', ')}</p>
            </Card>
        </div>
    )
};

// --- Service Detail Page ---

const ReviewCard = ({ review, isOwnReview, onEdit, onDelete, isDeleting }) => (
    <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 py-4 group">
        <User className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 p-2 text-gray-600 dark:text-gray-300"/>
        <div className="flex-1">
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-bold">{review.reviewer_name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
                </div>
                <StarRating rating={review.stars}/>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{review.comment}</p>
        </div>
        {isOwnReview && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button variant="secondary" onClick={() => onEdit(review)} className="!p-2"><Edit size={14}/></Button>
                <Button 
                    variant="danger" 
                    onClick={() => onDelete(review.id)} 
                    className="!p-2"
                    disabled={isDeleting}
                >
                    {isDeleting ? <Spinner size="small" /> : <Trash2 size={14}/>}
                </Button>
            </div>
        )}
    </div>
);

const ReportServiceModal = ({ isOpen, onClose, onSubmit, serviceName }) => {
    const [reason, setReason] = useState('');
    const [image, setImage] = useState(null); // State for the image file/base64
    const [imagePreview, setImagePreview] = useState(null);
    useEffect(() => {
        // Reset form when modal is opened or closed
        if (!isOpen) {
            setReason('');
            setImage(null);
            setImagePreview(null);
        }
    }, [isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        // Pass an object with both reason and image
        onSubmit({ reason, image: imagePreview });
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Report ${serviceName}`}>
            <div className="space-y-4">
                <p>Please provide a reason for reporting this service. Your report will be reviewed by an administrator.</p>
                <TextArea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows="5"
                    placeholder="e.g., Inappropriate content, fraudulent service, safety concern..."
                />

                <div>
                    <label htmlFor="report-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Add an image (optional)
                    </label>
                    <input
                        type="file"
                        id="report-image"
                        name="report-image"
                        accept="image/png, image/jpeg"
                        onChange={handleImageChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {imagePreview && (
                        <div className="mt-4">
                            <img src={imagePreview} alt="Report preview" className="max-h-40 rounded-lg" />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="danger" onClick={handleSubmit} disabled={!reason.trim()}>Submit Report</Button>
                </div>
            </div>
        </Modal>
    );
};

const ServiceDetailPage = ({ serviceId, navigate, goBack, setSelectedProviderId }) => {
    const { user, isAuthenticated } = useAuth();
    const [service, setService] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [userPets, setUserPets] = useState([]);
    const [reviewModal, setReviewModal] = useState({ isOpen: false, review: null });
    const [deletingReviews, setDeletingReviews] = useState(new Set());

    const fetchDetails = async () => {
        setLoading(true);
        const [serviceRes, reviewsRes, petsRes] = await Promise.all([
            api.services.getById(serviceId),
            api.reviews.getForService(serviceId),
            isAuthenticated ? api.pets.getAll() : Promise.resolve({success: true, pets: []})
        ]);
        if(serviceRes.success) setService(serviceRes.service);
        if(reviewsRes.success) setReviews(reviewsRes.reviews);
        if(petsRes.success) setUserPets(petsRes.pets);
        setLoading(false);
    }

    useEffect(() => {
        fetchDetails();
    }, [serviceId, isAuthenticated]);

    const handleBooking = () => {
        if (isAuthenticated) {
            setIsBookingModalOpen(true);
        } else {
            navigate('login');
        }
    };

    const handleBookingSubmit = async (bookingData) => {
        await api.bookings.create(bookingData);
        setIsBookingModalOpen(false);
        alert("Booking request sent! You can view its status in your schedule.");
        navigate('schedule');
    };

    const handleReportSubmit = async (reportData) => {
        const submissionData = {
            serviceId,
            reason: reportData.reason,
            image: reportData.image, // Pass the image data to the API
            text: `Reporting service: ${service.name}`
        };
        await api.reports.create(submissionData);
        alert("Thank you for your report. An administrator will review it shortly.");
    };

    const handleSaveReview = async (reviewData) => {
        const { review } = reviewModal;
        if (review) { // Editing existing review
            await api.reviews.update(review.id, reviewData);
        } else { // Adding new review
            await api.reviews.add(serviceId, user.id, user.name, reviewData);
        }
        setReviewModal({ isOpen: false, review: null });
        fetchDetails(); // Re-fetch all details to show updated review list
    };

    const handleEditReview = (review) => {
        setReviewModal({ isOpen: true, review: review });
    };

    const handleDeleteReview = async (reviewId) => {
        // Prevent multiple delete requests for the same review
        if (deletingReviews.has(reviewId)) {
            console.log('Delete already in progress for review ID:', reviewId);
            return;
        }
        
        if(window.confirm("Are you sure you want to delete your review?")) {
            try {
                // Mark review as being deleted
                setDeletingReviews(prev => new Set([...prev, reviewId]));
                
                await api.reviews.delete(reviewId);
                fetchDetails(); // Re-fetch to update list
            } catch (error) {
                console.error('Delete review error:', error);
                alert('Failed to delete review: ' + (error.message || 'Unknown error'));
            } finally {
                // Remove review from deleting set
                setDeletingReviews(prev => {
                    const next = new Set(prev);
                    next.delete(reviewId);
                    return next;
                });
            }
        }
    };


    if (loading) return <div className="p-8"><Spinner/></div>;
    if (!service) return <div className="p-8">Service not found.</div>;

    const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.stars, 0) / reviews.length : 0;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Button onClick={goBack} variant="secondary" className="mb-6 flex items-center gap-2">
                <ChevronLeft size={16} /> Back
            </Button>

            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{service.name}</h1>
                <div className="flex items-center gap-4 text-md text-gray-500 dark:text-gray-400">
                    <button onClick={() => { setSelectedProviderId(service.providerid); navigate('providerProfile'); }} className="hover:underline">
                        from {service.provider_name}
                    </button>
                    <span className="flex items-center gap-1">
                        <StarRating rating={averageRating} />
                        ({reviews.length} reviews)
                    </span>
                </div>
            </header>

            <img src={`https://placehold.co/1200x400/a0d2eb/ffffff?text=${encodeURIComponent(service.name)}`} alt={service.name} className="w-full h-64 object-cover rounded-lg mb-8"/>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold border-b pb-4 mb-4">Service Description</h2>
                        <p>{service.description}</p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold border-b pb-4 mb-4">About The Provider</h2>
                        <div className="flex items-center gap-4">
                            <User className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 p-2"/>
                            <div>
                                <h3 onClick={() => { setSelectedProviderId(service.providerid); navigate('providerProfile'); }} className="font-bold text-lg">{service.provider_name}</h3>
                                {service.website && <a href={service.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">Visit Website <ExternalLink size={14}/></a>}
                                <Button variant="secondary" className="!text-xs !py-1 !px-2 mt-2 !text-red-500 !bg-red-50 dark:!bg-red-900/50 dark:!text-red-400 flex items-center justify-center gap-1" onClick={() => setIsReportModalOpen(true)}>
                                    <Flag size={14}/> Report this listing
                                </Button>
                            </div>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold border-b pb-4 mb-4">Contact & Location</h2>
                        <div className="space-y-2 text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-3"><Phone size={16}/><a href={`tel:${service.phone}`} className="hover:underline">{service.phone}</a></div>
                            <div className="flex items-center gap-3"><MapPin size={16}/><span>{service.address}</span></div>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold border-b pb-4 mb-4">Available Timeslots</h2>
                        <div className="flex flex-wrap gap-2">
                            {service.timeslots.map(slot => (
                                <Button key={slot} variant="secondary" className="!font-mono">{slot}</Button>
                            ))}
                        </div>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold border-b pb-4 mb-4">Reviews ({reviews.length})</h2>
                        {reviews.length > 0 ? (
                            reviews.map(review => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    isOwnReview={isAuthenticated && user.id === review.userid}
                                    onEdit={handleEditReview}
                                    onDelete={handleDeleteReview}
                                    isDeleting={deletingReviews.has(review.id)}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500">No reviews yet for this service.</p>
                        )}
                    </section>
                </div>
                <aside className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <div className="space-y-4">
                            <p className="text-3xl font-bold text-center">${service.price}</p>
                            <Button className="w-full" onClick={handleBooking}>
                                {isAuthenticated ? 'Book Now' : 'Login to Book'}
                            </Button>
                            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2 pt-4 border-t">
                                <div className="flex justify-between"><span>Duration:</span> <strong>{service.duration}</strong></div>
                                <div className="flex justify-between"><span>Category:</span> <strong>{service.service_type}</strong></div>
                            </div>
                        </div>
                    </Card>
                </aside>
            </div>
            <ReportServiceModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={handleReportSubmit}
                serviceName={service.name}
            />
            <BookingFormModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                onSubmit={handleBookingSubmit}
                service={service}
                pets={userPets}
            />
            <ReviewFormModal
                isOpen={reviewModal.isOpen}
                onClose={() => setReviewModal({isOpen: false, review: null})}
                onSubmit={handleSaveReview}
                serviceName={service.name}
                reviewToEdit={reviewModal.review}
            />
        </div>
    );
};

// --- Profile Page ---
const ProfilePage = () => {
    const { user, setUser, logout } = useAuth(); // Get logout from context
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            setLoading(true);
            
            try {
                const res = await api.profile.get();
                console.log('Profile API response:', res); // Debug logging

                if (res.success) {
                    const profileData = res.profile;

                    // ADDED: Logic to convert the logo's raw buffer data to a Data URL
                    if (profileData.logo && profileData.logo.type === 'Buffer') {
                        // This function converts an array of byte data into a Base64 string
                        const bufferToBase64 = (buffer) => {
                            let binary = '';
                            const bytes = new Uint8Array(buffer.data);
                            const len = bytes.byteLength;
                            for (let i = 0; i < len; i++) {
                                binary += String.fromCharCode(bytes[i]);
                            }
                            return window.btoa(binary);
                        };

                        profileData.logo = `data:image/png;base64,${bufferToBase64(profileData.logo)}`;
                    }

                    setProfile(profileData);
                } else {
                    console.error('Failed to fetch profile:', res);
                    // If authentication failed or user not found (e.g., account deleted), logout the user
                    if (res.message && (
                        res.message.includes('token') || 
                        res.message.includes('unauthorized') ||
                        res.message.includes('User not found') ||
                        res.message.includes('not found')
                    )) {
                        console.log('Authentication failed or user not found, logging out user');
                        logout();
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user, logout]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        const res = await api.profile.update(profile);
        if (res.success) {
            const updatedUser = { ...user, name: res.profile.name };
            setUser(updatedUser);
            localStorage.setItem('pet_care_user', JSON.stringify(updatedUser));
            setIsEditing(false);
        } else {
            console.error("Failed to update profile");
        }
    };

    const handleDeleteAccount = async () => {
        // Prevent multiple delete requests
        if (deletingAccount) {
            console.log('Account delete already in progress');
            return;
        }
        
        try {
            setDeletingAccount(true);
            setLoading(true);
            const res = await api.profile.delete();
            
            // Check if the response indicates successful deletion
            // Backend returns { message: 'Account deleted successfully', deletedUser: {...} }
            if (res.message === 'Account deleted successfully' || res.deletedUser) {
                // Show success message
                alert("Your account has been successfully deleted. You will now be logged out.");
                
                // Force logout immediately
                await logout();
                
                // Redirect to login page after logout
                setTimeout(() => {
                    window.location.reload(); // Force full page reload to ensure clean state
                }, 100);
            } else {
                console.error('Delete account failed:', res);
                alert(`There was an error deleting your account: ${res.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Delete account error:', error);
            alert("There was an error deleting your account. Please try again or contact support.");
        } finally {
            setDeletingAccount(false);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8"><Spinner/></div>;
    if (!profile) return <div className="p-8">Could not load profile.</div>

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                {!isEditing && <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>}
            </div>

            <Card>
                <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Full Name" name="name" value={profile.name || ''} onChange={handleChange} disabled={!isEditing} />
                    <Input label="Email Address" name="email" value={profile.email} onChange={handleChange} disabled />
                    <Input label="Phone Number" name="phone" value={profile.phone || ''} onChange={handleChange} disabled={!isEditing} />
                    <Input label="Role" name="role" value={profile.role} onChange={handleChange} disabled />
                    <Input label="Address" name="address" value={profile.address || ''} onChange={handleChange} disabled={!isEditing} />
                    <Input label="City" name="city" value={profile.city || ''} onChange={handleChange} disabled={!isEditing} />
                </div>
            </Card>

            {profile.role === 'Service provider' && (
                <Card>
                    <h2 className="text-xl font-bold mb-4">Business Information</h2>
                    <div className="flex items-start gap-6">
                        {profile.logo && <img src={profile.logo} alt="Business Logo" className="w-24 h-24 rounded-lg object-cover bg-gray-200" />}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                            <Input label="Business Name" name="business_name" value={profile.business_name || ''} onChange={handleChange} disabled={!isEditing} />

                            {/* REMOVED: Business License input field */}
                            <Input label="Website" name="website" value={profile.website || ''} onChange={handleChange} disabled={!isEditing} className="md:col-span-2"/>

                            {/* This input now correctly handles displaying the logo URL/base64 string */}
                            <Input label="Business Logo URL" name="logo" value={profile.logo || ''} onChange={handleChange} disabled={!isEditing} className="md:col-span-2"/>
                            <div className="md:col-span-2">
                                <TextArea label="Description" name="description" value={profile.description || ''} onChange={handleChange} disabled={!isEditing} rows="4"/>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <Card>
                <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Delete account :&quot;( </h2>
                <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">Delete this account</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Once you delete your account, there is no going back. Please be certain.</p>
                    </div>
                    <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>Delete My Account</Button>
                </div>
            </Card>

            {isEditing && (
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            )}

            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                isDeleting={deletingAccount}
            />
        </div>
    );
};

// --- Help Desk Pages ---

const TicketFormModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({ subject: '', description: '', attachment: null });
    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    useEffect(() => {
        if (!isOpen) {
            setFormData({ subject: '', description: '', attachment: null });
            setPreview(null);
        }
    }, [isOpen]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                setFormData(prev => ({ ...prev, attachment: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        // The clearing of the form is now handled by the useEffect
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create a New Support Ticket">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="e.g., Billing question" />
                <TextArea label="Description" name="description" value={formData.description} onChange={handleChange} rows="5" placeholder="Please describe your issue in detail..." />

                {/* ADDED: File input for attachment */}
                <div>
                    <label htmlFor="ticket-attachment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Add Attachment (optional)
                    </label>
                    <input
                        type="file"
                        id="ticket-attachment"
                        name="ticket-attachment"
                        accept="image/png, image/jpeg, application/pdf"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {preview && (
                        <div className="mt-4">
                            <p className="text-sm font-medium">Attachment Preview:</p>
                            {formData.attachment?.startsWith('data:image') ? (
                                <img src={preview} alt="Attachment preview" className="max-h-40 rounded-lg mt-2" />
                            ) : (
                                <p className="text-sm bg-gray-100 p-2 rounded-md dark:bg-gray-700">A file has been selected (preview not available).</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Submit Ticket</Button>
                </div>
            </form>
        </Modal>
    );
};

// Add this new component to your file, near other modal components

const TicketDetailModal = ({ isOpen, onClose, onStatusChange, ticket }) => {
    const { user } = useAuth();
    const [replies, setReplies] = useState([]);
    const [newReply, setNewReply] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && ticket) {
            const fetchReplies = async () => {
                setLoading(true);
                const res = await api.helpdesk.getReplies(ticket.id);
                if (res.success) {
                    setReplies(res.replies);
                }
                setLoading(false);
            };
            fetchReplies();
        }
    }, [isOpen, ticket]);

    const handleSendReply = async () => {
        if (!newReply.trim()) return;
        await api.helpdesk.addManagerReply(ticket.id, newReply, user);
        setNewReply("");
        // Refresh replies after sending
        const res = await api.helpdesk.getReplies(ticket.id);
        if (res.success) setReplies(res.replies);
    };

    if (!isOpen || !ticket) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Ticket #${ticket.id}: ${ticket.subject}`}>
            <div className="space-y-4 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-semibold text-gray-600 dark:text-gray-300">Original Request from {ticket.userName} ({ticket.userRole})</p>
                    <p className="mt-1">{ticket.description}</p>
                </div>

                <div className="space-y-3">
                    <h4 className="font-semibold">Conversation</h4>
                    {loading ? <Spinner /> : replies.length > 0 ? (
                        replies.map(reply => (
                            <div key={reply.replyid} className="p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg">
                                <p className="font-semibold text-blue-800 dark:text-blue-300">Reply from {reply.role}</p>
                                <p className="mt-1">{reply.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(reply.created_at).toLocaleString()}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No replies yet.</p>
                    )}
                </div>

                {ticket.status === 'open' && (
                    <div className="pt-4 border-t">
                        <TextArea label="Add Reply" value={newReply} onChange={(e) => setNewReply(e.target.value)} rows="3" />
                        <div className="mt-2 flex justify-between items-center">
                            <Button onClick={handleSendReply}>Send Reply</Button>
                            <Button variant="secondary" onClick={() => onStatusChange(ticket.id, 'resolved')}>Mark as Resolved</Button>
                        </div>
                    </div>
                )}

                {ticket.status === 'resolved' && (
                    <p className="text-center font-semibold text-green-600 dark:text-green-400 pt-4 border-t">This ticket has been resolved.</p>
                )}
            </div>
        </Modal>
    );
};

const HelpDeskPage = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const fetchTickets = async () => {
        setLoading(true);
        const res = await api.helpdesk.getForUser(user.id);
        if (res.success) {
            setTickets(res.tickets);
        }
        setLoading(false);
    };

    useEffect(() => {
        if(user?.id) fetchTickets();
    }, [user]);

    const handleSaveTicket = async (formData) => {
        // formData will now include the optional attachment
        await api.helpdesk.create(formData, user);
        fetchTickets();
        setIsFormModalOpen(false);
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            'open': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            'resolved': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        };
        return <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${colors[status]}`}>{status}</span>;
    }

    if (loading) return <div className="p-8"><Spinner /></div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Support Tickets</h1>
                <Button onClick={() => setIsFormModalOpen(true)} className="flex items-center gap-2"><PlusCircle size={16} /> Create Ticket</Button>
            </div>

            <Card>
                {tickets.length > 0 ? (
                    <div className="space-y-4">
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setSelectedTicket(ticket)}>
                                <div className="flex justify-between items-start gap-4">
                                    <p className="font-bold">{ticket.subject}</p>
                                    <StatusBadge status={ticket.status} />
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Ticket #{ticket.id} &bull; Submitted on {new Date(ticket.date).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <LifeBuoy className="mx-auto h-16 w-16 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium">No support tickets found</h3>
                        <p className="mt-1 text-sm text-gray-500">Need help? Create a new ticket to get assistance.</p>
                        <div className="mt-6">
                            <Button onClick={() => setIsFormModalOpen(true)}>Create a Ticket</Button>
                        </div>
                    </div>
                )}
            </Card>

            <TicketFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSave={handleSaveTicket} />
            <UserTicketDetailModal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} ticket={selectedTicket} />
        </div>
    );
};

const ManagerSupportPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const fetchTickets = async () => {
        setLoading(true);
        const res = await api.helpdesk.getAll();
        if (res.success) {
            setTickets(res.tickets);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleUpdateStatus = async (ticketId, status) => {
        await api.helpdesk.updateStatus(ticketId, status);
        setSelectedTicket(null); // Close modal
        fetchTickets(); // Refresh list
    };

    const openTicketModal = (ticket) => {
        setSelectedTicket(ticket);
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            'open': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            'resolved': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        };
        return <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${colors[status]}`}>{status}</span>;
    }

    if (loading) return <div className="p-8"><Spinner /></div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Support Tickets</h1>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Subject</th>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Submitted</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tickets.map(ticket => (
                            <tr key={ticket.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{ticket.subject}</th>
                                <td className="px-6 py-4">{ticket.userName} ({ticket.userRole})</td>
                                <td className="px-6 py-4">{new Date(ticket.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4"><StatusBadge status={ticket.status} /></td>
                                <td className="px-6 py-4">
                                    <Button onClick={() => openTicketModal(ticket)} className="!px-3 !py-1 text-xs">
                                        View / Reply
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <TicketDetailModal
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                onStatusChange={handleUpdateStatus}
                ticket={selectedTicket}
            />
        </div>
    );
};

// =================================================================================
// MAIN APP COMPONENT
// =================================================================================

const App = () => {
    const { isAuthenticated, loading, user } = useAuth();
    const [page, setPage] = useState('home');
    const [pageHistory, setPageHistory] = useState(['home']);

    // State for specific page content
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [selectedPetId, setSelectedPetId] = useState(null);
    const [selectedProviderId, setSelectedProviderId] = useState(null);

    // ===== NEW FEATURE: ADD REVIEWS =====
    // State for managing the review modal
    const [reviewModal, setReviewModal] = useState({ isOpen: false, serviceId: null, serviceName: '' });

    useEffect(() => {
        if (loading) return;

        if (isAuthenticated) {
            if (page === 'home' || page === 'login' || page === 'register') {
                switch (user?.role) {
                    case 'Pet owner': setPage('ownerDashboard'); break;
                    case 'Service provider': setPage('providerDashboard'); break;
                    case 'Manager': setPage('managerDashboard'); break;
                    default: setPage('home'); break;
                }
            }
        } else {
            const protectedPages = ['Dashboard', 'my', 'Requests', 'Approvals', 'profile', 'helpDesk', 'supportTickets', 'schedule'];
            // Keep detail pages accessible, as they don't strictly require auth in the mockup
            if (protectedPages.some(p => page.toLowerCase().includes(p.toLowerCase())) && !['serviceDetail', 'bookingDetail', 'petDetail'].includes(page) ) {
                setPage('home');
            }
        }
    }, [isAuthenticated, user, loading, page]);

    const navigate = (newPage) => {
        setPageHistory(prev => [...prev, page]);
        setPage(newPage);
    };

    const goBack = () => {
        const prevPage = pageHistory.pop() || (isAuthenticated ? (user?.role === 'Pet owner' ? 'ownerDashboard' : 'home') : 'home');
        setPageHistory([...pageHistory]);
        setPage(prevPage);
    };

    // ===== NEW FEATURE: ADD REVIEWS =====
    // Functions to control the review modal
    const openReviewModal = (serviceId, serviceName) => {
        setReviewModal({ isOpen: true, serviceId, serviceName });
    };

    const closeReviewModal = () => {
        setReviewModal({ isOpen: false, serviceId: null, serviceName: '' });
    };

    const handleSaveReview = async (reviewData) => {
        if (!reviewModal.serviceId) return;
        await api.reviews.add(reviewModal.serviceId, user.id, user.name, reviewData);
        // In a real app, you might want to show a success toast.
        // For now, the modal will just close. The updated review will be visible
        // next time the Service Detail page is loaded.
    };


    const renderPage = () => {
        if(loading) {
            return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900"><Spinner /></div>;
        }

        const handleApprovalDecision = async (serviceId, decision, reason = '') => {
            if (decision === 'approve') {
                await api.services.approve(serviceId);
            } else if (decision === 'reject') {
                await api.services.reject(serviceId, reason);
            }
            // Navigate back to the list after a decision is made
            goBack();
        };

        const handleProviderBookingAction = async (bookingId, status) => {
            await api.bookings.updateStatus(bookingId, status);
            // Navigate back to the schedule after a decision is made
            goBack();
        };

        const pageProps = {
            navigate,
            setPage,
            goBack,
            setSelectedBookingId,
            setSelectedServiceId,
            setSelectedPetId,
            openReviewModal,
            setSelectedProviderId
        }

        if (isAuthenticated) {
            const Layout = (props) => <DashboardLayout {...props} setPage={setPage} page={page} />;
            switch(page) {
                case 'serviceDetail': return <Layout setPage={navigate}><ServiceDetailPage serviceId={selectedServiceId} {...pageProps} /></Layout>;
                case 'petDetail': return <Layout setPage={navigate}><PetDetailPage petId={selectedPetId} {...pageProps} /></Layout>;
                case 'bookingDetail': return <Layout setPage={navigate}><BookingDetailPage bookingId={selectedBookingId} {...pageProps} /></Layout>;
                case 'ownerDashboard': return <Layout setPage={navigate}><PetOwnerDashboard {...pageProps} /></Layout>;
                case 'providerDashboard': return <Layout setPage={navigate}><ProviderDashboard {...pageProps} /></Layout>;
                case 'managerDashboard': return <Layout setPage={navigate}><ManagerDashboard {...pageProps} /></Layout>;
                case 'serviceApprovals': return <Layout setPage={navigate}><ServiceApprovalsPage {...pageProps} /></Layout>;
                case 'managerReports': return <Layout setPage={navigate}><ManagerReportsPage {...pageProps} /></Layout>;
                case 'services': return <Layout setPage={navigate}><BrowseServicesPage {...pageProps} /></Layout>;
                case 'schedule': return <Layout setPage={navigate}><SchedulePage {...pageProps}/></Layout>;
                case 'myPets': return <Layout setPage={navigate}><MyPetsPage {...pageProps}/></Layout>;
                case 'myServices': return <Layout setPage={navigate}><MyServicesPage/></Layout>;
                case 'bookingRequests': return <Layout setPage={navigate}><BookingRequestsPage/></Layout>;
                case 'providerReports': return <Layout setPage={navigate}><ProviderReportsPage {...pageProps} /></Layout>;
                case 'profile': return <Layout setPage={navigate}><ProfilePage/></Layout>;
                case 'helpDesk': return <Layout setPage={navigate}><HelpDeskPage /></Layout>;
                case 'supportTickets': return <Layout setPage={navigate}><ManagerSupportPage /></Layout>;
                case 'notifications': return <Layout setPage={navigate}><NotificationsPage {...pageProps} /></Layout>;
                case 'conversations': return <Layout setPage={navigate}><ConversationsPage {...pageProps} /></Layout>;
                case 'browseProviders': return <Layout><BrowseProvidersPage {...pageProps} /></Layout>;
                case 'providerSchedule': return <Layout setPage={navigate}><ProviderSchedulePage {...pageProps} /></Layout>;
                case 'providerProfile': return <Layout setPage={navigate}><ProviderProfilePage providerId={selectedProviderId} {...pageProps} /></Layout>;
                case 'providerReviews': return <Layout setPage={navigate}><ProviderReviewsPage {...pageProps} /></Layout>;
                case 'managerBookingDetail': return <Layout setPage={navigate}><ManagerBookingDetailPage bookingId={selectedBookingId} {...pageProps} /></Layout>;
                case 'serviceApprovalDetail':
                    return <Layout><ServiceApprovalDetailPage
                        serviceId={selectedServiceId}
                        goBack={goBack}
                        onDecision={handleApprovalDecision}
                    /></Layout>;

                case 'providerBookingDetail':
                    return <Layout><ProviderBookingDetailPage
                        bookingId={selectedBookingId}
                        goBack={goBack}
                        onAction={handleProviderBookingAction}
                    /></Layout>;
                default:
                    const defaultDashboard = user.role === 'Pet owner' ? 'ownerDashboard' : user.role === 'Service provider' ? 'providerDashboard' : 'managerDashboard';
                    setPage(defaultDashboard);
                    return null;
            }
        }

        const Layout = (props) => <MainLayout {...props} setPage={navigate} />;
        switch (page) {
            case 'login': return <Layout><LoginPage {...pageProps} /></Layout>;
            case 'register': return <Layout><RegisterPage {...pageProps} /></Layout>;
            case 'forgotPassword': return <Layout><ForgotPasswordPage {...pageProps} /></Layout>;
            case 'resetPassword': return <Layout><ResetPasswordPage {...pageProps} /></Layout>;
            case 'services': return <Layout><BrowseServicesPage {...pageProps} /></Layout>;
            case 'providerProfile': return <Layout><ProviderProfilePage providerId={selectedProviderId} {...pageProps} /></Layout>;
            case 'serviceDetail': return <Layout><ServiceDetailPage serviceId={selectedServiceId} {...pageProps} /></Layout>;
            default: return <Layout><HomePage {...pageProps} /></Layout>;
        }
    };

    return (
        <>
            {renderPage()}
            {/* ===== NEW FEATURE: ADD REVIEWS ===== */}
            {/* The Review Form modal is placed here at the top level to be accessible from any page. */}
            <ReviewFormModal
                isOpen={reviewModal.isOpen}
                onClose={closeReviewModal}
                onSubmit={handleSaveReview}
                serviceName={reviewModal.serviceName}
            />
        </>
    );
};

export default function AppWrapper() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}