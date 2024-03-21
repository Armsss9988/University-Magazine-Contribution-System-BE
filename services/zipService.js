// services/zipService.js
const archiver = require('archiver');
const fs = require('fs');

// Hàm service để tạo tệp ZIP từ danh sách các tệp đóng góp
exports.createZipFile = async (contributionFiles) => {
    return new Promise((resolve, reject) => {
        const zipFileName = 'contributions.zip';
        const output = fs.createWriteStream(zipFileName);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            resolve(zipFileName);
        });

        archive.pipe(output);

        contributionFiles.forEach(file => {
            archive.append(fs.createReadStream(file.path), { name: file.originalName });
        });

        archive.finalize();
    });
};
