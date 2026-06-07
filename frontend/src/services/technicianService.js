import api from './api';

const technicianService = {
    getStats: async () => {
        const response = await api.get('/technician/stats');
        return response.data;
    },

    getAvailableMissions: async () => {
        const response = await api.get('/technician/missions/available');
        return response.data;
    },
    
    getMyMissions: async () => {
        const response = await api.get('/technician/missions/my');
        return response.data;
    },

    acceptMission: async (id) => {
        const response = await api.put(`/technician/missions/${id}/accept`);
        return response.data;
    },

    completeMission: async (id, data) => {
        const response = await api.put(`/technician/missions/${id}/complete`, data);
        return response.data;
    },

    getEquipments: async () => {
        const response = await api.get('/technician/equipments');
        return response.data;
    }
};

export default technicianService;
