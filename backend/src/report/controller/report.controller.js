const catchAsync = require('../../utils/catchAsync');
const reportService = require('../service/report.service');

const reportController = {
    getVendorPerformance: catchAsync(async (req, res) => {
        const result = await reportService.getVendorPerformance(req.user.id);
        res.json(result);
    }),

    getExpenseReport: catchAsync(async (req, res) => {
        const { period = '30D' } = req.query;
        const result = await reportService.getExpenseReport(req.user.id, period);
        res.json(result);
    }),

    getDeliveryKPI: catchAsync(async (req, res) => {
        const result = await reportService.getDeliveryKPI();
        res.json(result);
    }),
};

module.exports = reportController;
