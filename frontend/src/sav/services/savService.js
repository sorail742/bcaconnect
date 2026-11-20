import api from '../../services/api';

const savService = {
    getMyGuarantees: async () => {
        const response = await api.get('/sav/guarantees');
        return response.data;
    },
    
    getMyInterventions: async () => {
        const response = await api.get('/sav/interventions');
        return response.data;
    },

    requestIntervention: async (data) => {
        const response = await api.post('/sav/interventions', data);
        return response.data;
    }
};

export default savService;
