import { Controller, Post, Get, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { RegisterUserDto } from './user/dto/register-user.dto';
import { JwtAuthGuard } from './auth/jwt.guard';
import { User } from './user/user.entity';

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.userService.registerUser(registerUserDto);
  }

  @Post('login')
  async login(@Body() body: { key: string; password: string }) {
    const { key, password } = body;
    const tryFindUser = await this.userService.findByUsernameOrEmail(key);
    if (!tryFindUser) {
      throw new HttpException('Tài khoản không tồn tại.', HttpStatus.NOT_FOUND);
    }
    const user = await this.authService.validateUser(key, password);
    if (!user) {
      throw new HttpException('Mật khẩu không chính xác.', HttpStatus.UNAUTHORIZED);
    }
    const token = await this.authService.login(user);
    return {
        message: 'Đăng nhập thành công',
        access_token: token.access_token, // Token đăng nhập 
        username: user.username, // Thêm trường username vào phản hồi
    };
  }


  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const token = req.headers['authorization']?.split(' ')[1]; // Lấy token từ header Authorization

    if (!token) {
      throw new HttpException('Token not found', HttpStatus.FORBIDDEN);
    }

    // Kiểm tra token hợp lệ
    const user = await this.authService.verifyToken(token);
    return {
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  @Get('users')
    async findAll(): Promise<User[]> {
        return await this.userService.findAll();
    }
}
