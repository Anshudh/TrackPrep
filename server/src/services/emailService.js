class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initialize();
  }

  async initialize() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      try {
        const nodemailer = await import('nodemailer');
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort),
          secure: parseInt(smtpPort) === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });
        this.isConfigured = true;
        console.log('Nodemailer SMTP transporter successfully initialized.');
      } catch (err) {
        console.warn('Nodemailer dynamic initialization failed. Email fallback to console logger.', err.message);
      }
    }
  }

  async sendEmail({ to, subject, text, html }) {
    if (this.isConfigured && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: process.env.EMAIL_FROM || '"TrackPrep Support" <support@trackprep.com>',
          to,
          subject,
          text,
          html
        });
        console.log(`Email dispatched successfully. Message ID: ${info.messageId}`);
        return true;
      } catch (err) {
        console.error('Error dispatching email via transporter:', err);
        return false;
      }
    } else {
      console.log('\n=============================================');
      console.log('            MOCK EMAIL LOGGER OUTPUT          ');
      console.log('=============================================');
      console.log(`TO:      ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`TEXT:    ${text || '(No Plaintext content)'}`);
      if (html) {
        console.log(`HTML:    ${html}`);
      }
      console.log('=============================================\n');
      return true;
    }
  }
}

export default new EmailService();
