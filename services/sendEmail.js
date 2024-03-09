// sendEmail.js
const nodemailer = require('nodemailer');

async function sendNewArticleEmail(title, content, user, pass, coordinatorEmail) {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: user,
            pass: pass
        }
    });

    let coordinatorMailOptions = {
        from: user,
        to: coordinatorEmail,
        subject: 'Thông báo: Báo cáo mới từ sinh viên',
        text: `Xin chào,\n\nSinh viên vừa gửi một báo cáo mới.\n\nTiêu đề: ${title}\n\nNội dung: ${content}\n\nXin cảm ơn!`
    };

    try {
        // Gửi email cho điều phối viên và chờ kết quả
        await transporter.sendMail(coordinatorMailOptions);

        // Trả về kết quả thành công
        return { success: true, message: 'Email sent successfully to coordinator.' };
    } catch (error) {
        // Trả về thông báo lỗi nếu có lỗi xảy ra
        console.error("Failed to send email:", error);
        return { success: false, message: 'Failed to send email to coordinator.' };
    }
}

module.exports = { sendNewArticleEmail };
