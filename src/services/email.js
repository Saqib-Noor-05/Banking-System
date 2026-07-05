require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to Banking System!'
    const text = `Hello ${name},\n\nThank you for registering at Banking System.`
    const html = `
        <p>Hello <b>${name}</b>,</p>
        <p>Thank you for registering at <b>Banking System</b>.</p>
        <p>Your account is now active!</p>
    `
    // modern client prefer the client version
    await sendEmail(userEmail, subject, text, html)
}

async function sendTransactionMail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Failed'
    const text = `Hello ${name}, \n \n Your transaction of ${amount} to account ${toAccount} is
    Failed.
    `
    const html = `<p>Hello ${name}, \n \n Your transaction of ${amount} to account ${toAccount} is
    Failed.</p>`

    await sendEmail(userEmail, subject, text, html)
}

async function sendTransactionFailureMail(userEmail, name, account, toAccount) {
    const subject = 'Transaction Failed'
    const text = `Hello ${name},  \n \n We regret to inform  you that your transaction of ${amount} to account ${toAccount} is
    Failed.
    `
    const html = `Hello ${name},  \n \n We regret to inform  you that your transaction of ${amount} to account ${toAccount} is
    Failed.
    `

    await sendEmail(userEmail, subject, text, html)
}

module.exports = {
    sendRegistrationEmail,
    sendTransactionFailureMail,
    sendTransactionMail
}


