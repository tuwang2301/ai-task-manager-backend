import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER, // Email của bạn
        pass: process.env.SMTP_PASS, // Mật khẩu ứng dụng (App Password)
      },
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
    });
  }

  async sendOtpMail(to: string, otp: string) {
    await this.sendMail(to, 'Your OTP Code', `Your OTP is: ${otp}`);
  }
}
