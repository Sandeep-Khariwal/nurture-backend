export const CreateHtmlForSubscription = (props: {
  fullName: string;
  subscriptionName: string;
  planMonths: string;
  subscriptionStart: string;
  subscriptionEnd: string;
}) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }
        .email-wrapper {
            width: 100%;
            padding: 20px;
            background-color: #f7f7f7;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background-color: #361101;
            color: #ffffff;
            padding: 25px 20px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
        }
        .email-body {
            padding: 30px 20px;
            color: #333333;
            line-height: 1.6;
        }
        .email-body h2 {
            color: #361101;
        }
        .email-body p {
            font-size: 16px;
            margin: 15px 0;
        }
        .subscription-details {
            background-color: #f4f0ed;
            border-left: 5px solid #b88341;
            padding: 20px;
            margin: 20px 0;
            border-radius: 6px;
        }
        .subscription-details p {
            margin: 8px 0;
            font-size: 16px;
        }
        .highlight {
            color: #b88341;
            font-weight: bold;
        }
        .email-footer {
            background-color: #f1f1f1;
            text-align: center;
            padding: 15px;
            font-size: 14px;
            color: #777777;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <!-- Email Header -->
            <div class="email-header">
                Subscription Confirmation
            </div>
            <!-- Email Body -->
            <div class="email-body">
                <h2>Hi ${props.fullName},</h2>
                <p>Thank you for subscribing to <span class="highlight">Nurture Nerve</span>! We're excited to have you on board.</p>
                <p>Here are the details of your subscription:</p>

                <div class="subscription-details">
                    <p><strong>Plan Name:</strong> <span class="highlight">${props.subscriptionName}</span></p>
                    <p><strong>Duration:</strong> <span class="highlight">${props.planMonths} Month(s)</span></p>
                    <p><strong>Start Date:</strong> <span class="highlight">${props.subscriptionStart}</span></p>
                    <p><strong>End Date:</strong> <span class="highlight">${props.subscriptionEnd}</span></p>
                </div>

                <p>If you have any questions or need support, feel free to contact us.</p>
                <p>Happy learning! 🎓</p>
            </div>
            <!-- Email Footer -->
            <div class="email-footer">
                &copy; 2025 Nurture Nerve. All rights reserved.<br>
                You're receiving this email because you purchased a subscription with us.
            </div>
        </div>
    </div>
</body>
</html>

    `;
};
