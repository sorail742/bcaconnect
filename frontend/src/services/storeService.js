import api from './api';

export const getMyStore = async () => {
    const response = await api.get('/stores/me');
    return response.data;
};

export const createStore = async (storeData) => {
    const response = await api.post('/stores', storeData);
    return response.data;
};

export const getAll = async (params = {}) => {
    const response = await api.get('/stores', { params });
    return response.data;
};

export const getById = async (id) => {
    const response = await api.get(`/stores/${id}`);
    return response.data;
};

export const getBySlug = async (slug) => {
    const response = await api.get(`/stores/slug/${slug}`);
    return response.data;
};

export const updateStore = async (storeData) => {
    const response = await api.put('/stores/me', storeData);
    return response.data;
};

/** @deprecated Alias — préférer les imports nommés */
const storeService = {
    getMyStore,
    createStore,
    getAll,
    getById,
    getBySlug,
    updateStore,
};

export default storeService;
