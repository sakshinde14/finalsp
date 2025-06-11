// frontend/src/utils/auth.js (Assuming this is where you handle tokens)

export const setAuthToken = (token) => {
    localStorage.setItem('authToken', token); // Or sessionStorage
};

export const getAuthToken = () => {
    return localStorage.getItem('authToken'); // Make sure the key 'authToken' matches
};

export const removeAuthToken = () => {
    localStorage.removeItem('authToken');
};