const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Setup Nodemailer transport (dummy config for now)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || 'user',
    pass: process.env.SMTP_PASS || 'pass',
  },
});

// Async email queue implementation to avoid blocking APIs
class EmailQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  enqueue(mailOptions) {
    this.queue.push(mailOptions);
    logger.info(`Email added to queue. Queue length: ${this.queue.length}`);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const mailOptions = this.queue.shift();

    try {
      await transporter.sendMail(mailOptions);
      logger.info(`Email successfully sent to ${mailOptions.to}`);
    } catch (error) {
      logger.error(`Failed to send email to ${mailOptions.to}: ${error.message}`);
    }

    // Process next item in queue
    setTimeout(() => this.processQueue(), 1000);
  }
}

const emailQueue = new EmailQueue();

const sendEmail = (to, subject, text, html) => {
  const mailOptions = {
    from: '"VMS System" <noreply@vms.com>',
    to,
    subject,
    text,
    html
  };
  emailQueue.enqueue(mailOptions);
};

module.exports = { sendEmail };
