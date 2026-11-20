const uploadService = {
    buildFileUrl(file) {
        return `/uploads/${file.filename}`;
    },
};

module.exports = uploadService;
