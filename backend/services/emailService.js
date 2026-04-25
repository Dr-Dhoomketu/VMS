const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Setup Nodemailer transport for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'shauryaujjwal102@gmail.com',
    pass: process.env.SMTP_PASS, // You will need to set SMTP_PASS in your .env file using a Google App Password
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
    from: '"VMS System" <shauryaujjwal102@gmail.com>',
    to,
    subject,
    text,
    html
  };
  emailQueue.enqueue(mailOptions);
};

module.exports = { sendEmail };
