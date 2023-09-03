import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MailerService } from '@nestjs-modules/mailer';

import { ConfigService } from './services/config/config.service';
import { IEmailData } from './interfaces/email-data.interface';
import { IMailSendResponse } from './interfaces/mail-send-response.interface';
import { SentMessageInfo } from 'nodemailer';

@Controller()
export class MailerController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) { }

  @MessagePattern('mail_send')
  mailSend(data: IEmailData): IMailSendResponse {
    if (!this.configService.get('emailsDisabled')) {
      this.mailerService.sendMail(data)
        .then(
          (response: SentMessageInfo) => {
            console.log(response);
          }
        )
        .catch(() => {
          return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: '⚠️ Mail send failed',
          }
        });
    }
    return {
      status: HttpStatus.ACCEPTED,
      message: '✅ Mail sent successful',
    };
  }
}
