import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

// Interceptor de autenticação reutilizável
const authInterceptor = (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
};

const errorInterceptor = (error) => {
    return Promise.reject(error);
};

apiClient.interceptors.request.use(authInterceptor, errorInterceptor);

export default apiClient;