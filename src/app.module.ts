import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { TaskModule } from './task/task.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { MailService } from './mail/mail.service';

@Module({
  imports: [
    PrismaModule,
    TaskModule,
    AuthModule,
    UserModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 600,
      max: 10,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, MailService],
  exports: [PrismaService],
})
export class AppModule {}
