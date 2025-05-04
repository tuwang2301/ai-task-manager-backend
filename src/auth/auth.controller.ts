import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './auth.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { GoogleOauthGuard } from './guard/google-oauth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard) // 🔐 Yêu cầu Authentication
  getProfile(@Req() req) {
    return req.user; // Trả về user từ JWT
  }

  @Post('signin')
  signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = signInDto;
    return this.authService.signIn(email, password, res);
  }

  @Post('refresh-token')
  refresh(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshToken(req, res);
  }

  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('validate-otp')
  validateOtp(@Body() validateOtpDto: { email: string; otp: string }) {
    const { email, otp } = validateOtpDto;
    return this.authService.validateOtp(email, otp);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async googleAuth() {
    // Redirects to Google
  }

  @Get('google/redirect')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = req.user;

    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    // Gửi token về frontend bằng redirect kèm query hoặc set cookie
    res.redirect(`http://localhost:3000/oauth-success?token=${access_token}`);
  }
}
