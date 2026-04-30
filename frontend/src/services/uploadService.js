import api from './api';

const uploadService = {
    /**
     * Télécharge un fichier vers le serveur.
     * @param {File} file 
     * @returns {Promise<{url: string}>}
     */
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export default uploadService;
