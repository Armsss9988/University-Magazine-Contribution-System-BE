// sendEmail.js
const nodemailer = require('nodemailer');

async function sendNewArticleEmail(title, content, recipientEmail) {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-password'
        }
    });

    let mailOptions = {
        from: 'your-email@gmail.com',
        to: recipientEmail,
        subject: 'Thông báo: Bài mới đã được gửi',
        text: `Xin chào,\n\nMột bài mới đã được gửi với tiêu đề: ${title}\n\nNội dung: ${content}\n\nXin cảm ơn!`
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendNewArticleEmail };
