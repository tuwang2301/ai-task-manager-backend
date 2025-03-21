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
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
    private mailService: MailService,
  ) {}

  async signIn(
    email: string,
    pass: string,
    res: Response,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findOne(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      // role: ['user'],
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // 📌 Tạo Refresh Token
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true, // Ngăn JavaScript truy cập cookie
      secure: true, // Chỉ gửi qua HTTPS (có thể set false nếu dev local)
      sameSite: 'strict', // Bảo vệ CSRF
      path: '/', // Cookie có hiệu lực trên toàn site
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return {
      access_token: accessToken,
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
  async validateOtp(email: string, otp: string): Promise<any> {
    const storedOtp = await this.cacheManager.get(`otp:${email}`);
    if (storedOtp === otp) {
      await this.cacheManager.del(`otp:${email}`);
      return await this.userService.validateOtp(email);
    }
    return storedOtp === otp;
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken: string = req.cookies['refresh_token'];
    if (!refreshToken)
      throw new UnauthorizedException('No refresh token found');

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const newAccessToken = await this.jwtService.signAsync(
        { sub: payload.sub, email: payload.email },
        { expiresIn: '15m' },
      );

      return res.json({ access_token: newAccessToken });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token', error);
    }
  }
}
