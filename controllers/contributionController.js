// controllers/contributionController.js
const Contribution = require('../models/contribution');
const { createZipFile } = require('../services/zipService');

// Xử lý yêu cầu tải xuống các đóng góp
exports.downloadContributions = async (req, res) => {
    const contributionIds = req.body.contributionIds;

    try {
        const contributionFiles = await Contribution.find({ _id: { $in: contributionIds } });
        const zipFileName = await createZipFile(contributionFiles);
        res.download(zipFileName, 'contributions.zip', (err) => {
            if (err) {
                console.error('Error downloading ZIP file:', err);
                res.status(500).json({ error: 'Failed to download ZIP file' });
            } else {
                console.log('ZIP file downloaded successfully');
            }
        });
    } catch (error) {
        console.error('Error fetching contributions:', error);
        res.status(500).json({ error: 'Failed to fetch contributions' });
    }
};
