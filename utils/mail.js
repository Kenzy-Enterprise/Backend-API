import { createTransport } from 'nodemailer';

// 1. Email Transport Configuration
export const mailTransporter = createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    service: "gmail",
    auth: {
        user: 'kenmalya2@gmail.com',
        pass: 'sczt fiyv ojxm xobi',
    },
});

// 2. Email Templates
export const registerUserMailTemplate = `
<div>
    <h1>Dear {username}</h1>
    <p>You have successfully registered to our platform</p>
    <p>Thank you for choosing us</p>
</div>
`;

export const otpMailTemplate = `
<div>
    <h1>Dear {username}</h1>
    <p>Your verification code is: <strong>{otp}</strong></p>
    <p>This code expires in 5 minutes</p>
</div>
`;

// 3. Email Sending Functions
export const sendRegistrationEmail = async (email, username) => {
    const html = registerUserMailTemplate.replace('{username}', username);
    
    await mailTransporter.sendMail({
        from: '"Your App Name" <kenmalya2@gmail.com>',
        to: email,
        subject: 'Registration Successful',
        html: html
    });
};

export const sendOTPEmail = async (email, username, otp) => {
    const html = otpMailTemplate
        .replace('{username}', username)
        .replace('{otp}', otp);

    await mailTransporter.sendMail({
        from: '"Kenzy Royal Enterprise" <kenmalya2@gmail.com>',
        to: email,
        subject: 'Your Verification Code',
        html: html
    });
};