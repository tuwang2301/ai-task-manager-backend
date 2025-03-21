import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from './auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
    private mailService: MailService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.userService.findOne(email);

    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const { email, name, password } = signUpDto;

    // 🔹 Kiểm tra email đã tồn tại chưa
    const existingUser = await this.userService.findOne(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 🔹 Tạo user ở trạng thái "chưa xác thực" (pending)
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create({
      email,
      name,
      password: hashedPassword,
      isVerified: false,
    });

    // 🔹 Gửi OTP
    if (user) {
      await this.generateOtp(email);
      return { message: 'OTP sent to your email' };
    }

    throw new Error('Failed to create user');
  }

  // ✅ Tạo và lưu OTP vào Redis
  async generateOtp(email: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.cacheManager.set(`otp:${email}`, otp, 36000); // Lưu 3 phút
    await this.mailService.sendOtpMail(email, otp);
  }

  // ✅ Kiểm tra OTP
  async validateOtp(email: string, otp: string): Promise<boolean> {
    const storedOtp = await this.cacheManager.get(`otp:${email}`);
    return storedOtp === otp;
  }
}
