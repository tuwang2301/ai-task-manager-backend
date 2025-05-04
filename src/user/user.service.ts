import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  findOne(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(user: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
        isVerified: user.isVerified,
      },
    });
  }

  validateOtp(email: string) {
    return this.prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });
  }
}
