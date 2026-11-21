const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    if (!process.env.SMTP_HOST) return null;

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
    });

    return transporter;
}

/**
 * Sends an email. Never throws: a failed email must not break an order or signup.
 * With no SMTP settings (local development) the email is printed to the console
 * instead, so features like password reset can still be tested.
 */
async function sendEmail({ to, subject, html, text }) {
    if (!to) return false;

    const from = process.env.EMAIL_FROM || "HAVEN <no-reply@haven.local>";
    const mailer = getTransporter();

    if (!mailer) {
        console.log(
            `\n[email — SMTP not configured, printing instead]\nTo: ${to}\nSubject: ${subject}\n${text || ""}\n`
        );
        return true;
    }

    try {
        await mailer.sendMail({ from, to, subject, html, text });
        return true;
    } catch (error) {
        console.error("Email send failed:", error.message);
        return false;
    }
}

module.exports = { sendEmail };
