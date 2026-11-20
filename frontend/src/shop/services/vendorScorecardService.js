import api from '../../services/api';

const vendorScorecardService = {
    getScorecard: async (vendorId) => {
        const response = await api.get(`/vendor-scorecard/${vendorId}`);
        return response.data;
    },
};

export default vendorScorecardService;
