"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class EmailServices {
    sendNewAccountEmail(receiverEmail, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = {
                sender: {
                    name: `Bsync `,
                    email: 'bsync.services@gmail.com'
                },
                to: [
                    {
                        email: `${receiverEmail}`,
                        name: `${name}`,
                    }
                ],
                subject: 'Welcome to Bsync',
                htmlContent: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Bsync</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              padding: 30px;
              display:flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #333;
            }
            p {
              color: #000000;
              line-height: 1.6;
            }
            .btn {
              display: inline-block;
              background-color: #007bff;
              color: #fff;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
            }
            .btn:hover {
              background-color: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to Bsync!</h1>
            <p>Dear ${name},</p>
            <p>Welcome to Bsync, your partner in sustainable waste management!</p>
            <p>Thank you for joining us in our mission to create a cleaner and better environment.</p>
            
            <p>Let's work together to make a positive impact!</p>
            <p>
              Best regards,<br>
              Bsync Management
            </p>
          </div>
        </body>
        </html>
        `,
            };
            const emailServiceUrl = process.env.EMAIL_SERVICE_URL || 'emails service';
            const emailResponse = yield fetch(emailServiceUrl, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': `${process.env.EMAIL_API_KEY}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send email');
                }
                return response.json();
            }).catch(error => {
                throw new Error(error.message);
            });
            return emailResponse;
        });
    }
    forgotPassword(receiverEmail, name, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = {
                sender: {
                    name: `Bsync `,
                    email: 'bsync.services@gmail.com'
                },
                to: [
                    {
                        email: `${receiverEmail}`,
                        name: `${name}`,
                    }
                ],
                subject: 'Forgot Password',
                htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bsync Account Password Reset</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333;
          }
          p {
            color: #666;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <p>Your password reset token is: </p>
          <h1>${token}</h1>
        </div>

        <div>
          <p>
          You got this email because you requested a password reset, if that was not done by you, do not perform any action and do not share this token with anyone.
          </p>
        </div>
      </body>
      </html>
      `,
            };
            const emailServiceUrl = process.env.EMAIL_SERVICE_URL || 'emails service';
            const emailResponse = yield fetch(emailServiceUrl, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': `${process.env.EMAIL_API_KEY}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send email');
                }
                return response.json();
            }).catch(error => {
                throw new Error(error.message);
            });
            return emailResponse;
        });
    }
    resetSuccessful(receiverEmail, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = {
                sender: {
                    name: `Bsync `,
                    email: 'bsync.services@gmail.com'
                },
                to: [
                    {
                        email: `${receiverEmail}`,
                        name: `${name}`,
                    }
                ],
                subject: 'Reset Successful',
                htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bsync </title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333;
          }
          p {
            color: #666;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <p>Your password reset was Successful </p>
        </div>
    
      </body>
      </html>
      `,
            };
            const emailServiceUrl = process.env.EMAIL_SERVICE_URL || 'emails service';
            const emailResponse = yield fetch(emailServiceUrl, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': `${process.env.EMAIL_API_KEY}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send email');
                }
                return response.json();
            }).catch(error => {
                throw new Error(error.message);
            });
            return emailResponse;
        });
    }
}
exports.default = EmailServices;
