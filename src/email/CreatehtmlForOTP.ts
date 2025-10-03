

export const CreateHtmlForOTP = (otp:string) =>{
    return  `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f7f9fb;
                margin: 0;
                padding: 0;
            }
            .email-wrapper {
                width: 100%;
                background-color: #f7f9fb;
                padding: 20px;
            }
            .email-container {
                width: 600px;
                background-color: #ffffff;
                margin: 0 auto;
                border-radius: 8px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .email-header {
                background-color: #4CAF50;
                color: #ffffff;
                padding: 20px;
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
            }
            .email-body {
                padding: 30px;
                color: #333333;
                line-height: 1.6;
            }
            .email-body h2 {
                color: #4CAF50;
            }
            .email-body p {
                font-size: 16px;
                margin: 15px 0;
            }
            .otp-container {
                background-color: #eeeeee;
                padding: 20px;
                text-align: center;
                font-size: 36px;
                font-weight: bold;
                color: #4CAF50;
                border-radius: 5px;
                margin-top: 20px;
            }
            .email-footer {
                background-color: #f1f1f1;
                text-align: center;
                padding: 15px;
                font-size: 14px;
                color: #777777;
                border-bottom-left-radius: 8px;
                border-bottom-right-radius: 8px;
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="email-container">
                <!-- Email Header -->
                <div class="email-header">
                    Welcome to Nurture Nerve!
                </div>
                <div class="email-body">
                    <h2>Hello Dear Student,</h2>
                    <p>Thank you for registering with Nurture Nerve! To complete your registration process, please use the following OTP (One-Time Password) to verify your email address:</p>
                    <div class="otp-container">
                        <span>${otp}</span>
                    </div>
                    <p>Please note that this OTP is valid for 10 minutes. If you didn't request this verification, please ignore this email.</p>
                </div>
                <div class="email-footer">
                    <p>Thank you for joining us. <br> If you have any questions, feel free to reach out to us!</p>
                    <p>&copy; 2025 Nurture Nerve!. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
`
}