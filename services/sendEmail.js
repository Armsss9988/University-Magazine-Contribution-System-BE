const nodemailer = require("nodemailer");
exports.sendEmailNotification = async (senderEmail,senderName, role,recipientEmail,recipientName, subject, content) => 
{
const SYSTEM_EMAIL = "umc.gre.fpt@gmail.com"; 
const SYSTEM_PASSWORD = "xolq jtbu oypa dqyj"; 
const RECIPIENT_EMAIL = recipientEmail;
const SUBJECT = subject;
const MESSAGE_BODY = `
Dear ${recipientName}!

${content}


${role} :
${senderName}
${senderEmail}

`;

    const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
        user: SYSTEM_EMAIL,
        pass: SYSTEM_PASSWORD,
    },
    });
    try {
        const info = await transporter.sendMail({
        from: SYSTEM_EMAIL,
        to: RECIPIENT_EMAIL,
        subject: SUBJECT,
        text: MESSAGE_BODY,
        });
        console.log(`Email sent: ${info.response}`);
    } catch (err) {
        console.error('Error sending email:', err);
    }
};