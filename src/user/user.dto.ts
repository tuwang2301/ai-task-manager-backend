export class CreateUserDto {
  name: string;
  email: string;
  password?: string;
  isVerified?: boolean;
  avatar?: string;
  provider?: string;
}
