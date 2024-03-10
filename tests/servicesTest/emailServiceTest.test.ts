// const EmailServices = require('../../src/services/EmailServices');
import EmailServices from '../../src/services/EmailServices';

const emailService = new EmailServices();

describe('sendNewAccountEmail', () => {

  it('sends new account email successfully', async () => {

    const receiverEmail = 'kelvin475@yahoo.com';
    const name = 'Ejiofor Kevin';

    const response = await emailService.sendNewAccountEmail(receiverEmail, name);

    expect(response.messageId).toBeDefined;
  }, 15000);

  it('throws an error when failed to send email', async () => {

    const receiverEmail = 'test@';
    const name = 'Test User';

    await expect(emailService.sendNewAccountEmail(receiverEmail, name)).resolves.toMatchObject({
      code: 'invalid_parameter',
      message: 'email is not valid in to'
    });
  }, 15000);
});
