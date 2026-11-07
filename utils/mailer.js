const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
    }
});

async function sendTemplateMail({ to, subject, template, context }) {
    const templatePath = path.join(__dirname, '..', 'views', 'emails', `${template}.ejs`);
    const html = await ejs.renderFile(templatePath, context);

    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@example.com',
        to,
        subject,
        html
    });
    return info;
}

module.exports = { sendTemplateMail };
