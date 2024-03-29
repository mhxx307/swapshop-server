import nodemailer from 'nodemailer';

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async (to: string, html: string, subject: string) => {
    // Generate test SMTP service account from ethereal.email

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'secondchancemarketvn@gmail.com', // generated ethereal user
            pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
        // tls: {
        //     rejectUnauthorized: false, // avoid NodeJs self signed certificate error
        // },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"Second Chance 👻" <secondchancemarketvn@gmail.com>', // sender address
        to, // list of receivers
        subject: subject, // Subject line
        html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};

export default sendEmail;
