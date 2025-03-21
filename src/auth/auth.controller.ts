import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  signIn(@Body() signInDto: SignInDto) {
    const { email, password } = signInDto;
    return this.authService.signIn(email, password);
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
}
