const catchAsync = require('../../utils/catchAsync');
const vendorScorecardService = require('../service/vendorScorecard.service');

const vendorScorecardController = {
    getScorecard: catchAsync(async (req, res) => {
        const result = await vendorScorecardService.getScorecard(req.params.vendorId);
        res.json(result);
    }),
};

module.exports = vendorScorecardController;
