const Contribution = require('../models/submissionModel');
const fs = require('fs').promises; // For file system operations (promises)
const archiver = require('archiver');
const path = require('path');
const rootDir = path.resolve(__dirname, '..');

const downloadSelectedContributions = async (req,res) => {

try {

    // Find selected contributions (replace with your actual filtering)
    const contributions = await Contribution.find({ status: 'selected' });

    // Check if any contributions found
    if (contributions.length === 0) {
      return res.status(404).send('No contributions found for selected');
    }

    // Create a ZIP archive
    const archive = archiver('zip');

    // Set content disposition for download (optional)
    res.setHeader('Content-Disposition', 'attachment; filename=contributions.zip');
    res.setHeader('Content-Type', 'application/zip');

    // Pipe the archive to the response stream
    archive.pipe(res);
    for (const contribution of contributions) {
       // Replace with actual file path generation
      document_pathArr = contribution.document_path.split(', ');
      console.log({document_pathArr});
      for (const document of document_pathArr) {    
        const filePath = `${rootDir}/uploads/${document}`;
        console.log(filePath);
        const fileBuffer = await fs.readFile(filePath);
        await archive.file(filePath, { name: document });
      };
    }

    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error downloading contributions');
  }
}

module.exports = downloadSelectedContributions;
