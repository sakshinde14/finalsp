// frontend/src/utils/auth.js
export const getAuthToken = () => {
    // Replace 'adminToken' with the actual key you use to store the admin's JWT
    return localStorage.getItem('adminToken');
};

export const setAuthToken = (token) => {
    localStorage.setItem('adminToken', token);
};

export const removeAuthToken = () => {
    localStorage.removeItem('adminToken');
};