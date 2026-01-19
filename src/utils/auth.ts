export const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};
