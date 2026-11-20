const uploadService = require('../service/upload.service');

const uploadController = {
    uploadFile: (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "Aucun fichier n'a été envoyé." });
            }
            const fileUrl = uploadService.buildFileUrl(req.file);
            res.json({ url: fileUrl });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = uploadController;
