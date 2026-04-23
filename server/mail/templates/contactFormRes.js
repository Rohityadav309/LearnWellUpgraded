export const contactUsEmail = (
  email,
  firstname,
  lastname,
  message,
  phoneNo,
  countrycode,
) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Contact Form Confirmation</title>
    <style>
      body {
        background-color: #ffffff;
        font-family: Arial, sans-serif;
        font-size: 16px;
        line-height: 1.4;
        color: #333333;
        margin: 0;
        padding: 0;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
      }

      .logo {
        max-width: 200px;
        margin-bottom: 20px;
      }

      .message {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
      }

      .body {
        font-size: 16px;
        margin-bottom: 20px;
      }

      .support {
        font-size: 14px;
        color: #999999;
        margin-top: 20px;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="message">LearnWell Contact Form Confirmation</div>
      <div class="body">
        <p>Dear ${firstname} ${lastname},</p>
        <p>
          Thank you for contacting LearnWell. We have received your message and
          will respond as soon as possible.
        </p>
        <p>Here are the details you provided:</p>
        <p>Name: ${firstname} ${lastname}</p>
        <p>Email: ${email}</p>
        <p>Phone Number: ${countrycode} ${phoneNo}</p>
        <p>Message: ${message}</p>
      </div>
      <div class="support">
        For any urgent assistance, please reply to this email thread.
      </div>
    </div>
  </body>
</html>`;
