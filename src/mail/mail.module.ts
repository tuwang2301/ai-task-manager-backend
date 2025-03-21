import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  providers: [MailService],
  exports: [MailService], // 👈 Export để module khác có thể dùng
})
export class MailModule {}
