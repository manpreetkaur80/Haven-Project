// const nodemailer = require("nodemailer");

// let transporter = null;

// function getTransporter() {
//     if (transporter) return transporter;

//     if (!process.env.SMTP_HOST) return null;

//     transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,
//         port: Number(process.env.SMTP_PORT || 587),
//         secure: Number(process.env.SMTP_PORT) === 465,
//         auth: process.env.SMTP_USER
//             ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
//             : undefined,
//     });

//     return transporter;
// }

// /**
//  * Sends an email. Never throws: a failed email must not break an order or signup.
//  * With no SMTP settings (local development) the email is printed to the console
//  * instead, so features like password reset can still be tested.
//  */
// async function sendEmail({ to, subject, html, text }) {
//     if (!to) return false;

//     const from = process.env.EMAIL_FROM || "HAVEN <no-reply@haven.local>";
//     const mailer = getTransporter();

//     if (!mailer) {
//         console.log(
//             `\n[email — SMTP not configured, printing instead]\nTo: ${to}\nSubject: ${subject}\n${text || ""}\n`
//         );
//         return true;
//     }

//     try {
//         await mailer.sendMail({ from, to, subject, html, text });
//         return true;
//     } catch (error) {
//         console.error("Email send failed:", error.message);
//         return false;
//     }
// }

// module.exports = { sendEmail };


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

// "HAVEN <me@example.com>"  ->  { name: "HAVEN", email: "me@example.com" }
function parseSender(value) {
    const match = String(value).match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
    if (match) return { name: match[1].trim() || "HAVEN", email: match[2].trim() };
    return { name: "HAVEN", email: String(value).trim() };
}

// Brevo's web API: works on hosts that block SMTP ports (e.g. Render's free plan).
async function sendWithBrevoApi({ from, to, subject, html, text }) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify({
            sender: parseSender(from),
            to: [{ email: to }],
            subject,
            htmlContent: html,
            textContent: text,
        }),
    });

    if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(`Brevo API ${response.status}: ${detail.slice(0, 200)}`);
    }
}

/**
 * Sends an email. Never throws: a failed email must not break an order or signup.
 * With no SMTP settings (local development) the email is printed to the console
 * instead, so features like password reset can still be tested.
 */
async function sendEmail({ to, subject, html, text }) {
    if (!to) return false;

    const from = process.env.EMAIL_FROM || "HAVEN <no-reply@haven.local>";

    if (process.env.BREVO_API_KEY) {
        try {
            await sendWithBrevoApi({ from, to, subject, html, text });
            return true;
        } catch (error) {
            console.error("Email send failed:", error.message);
            return false;
        }
    }

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

module.exports = { sendEmail, parseSender };