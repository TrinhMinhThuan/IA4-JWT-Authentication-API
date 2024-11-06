import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Xác thực người dùng dựa trên username/email và mật khẩu
  async validateUser(key: string, password: string): Promise<any> {
    const user = await this.userService.findByUsernameOrEmail(key);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user; // loại bỏ password trước khi trả về kết quả
      return result;
    }
    return null;
  }

  // Tạo JWT cho người dùng khi đăng nhập thành công  
  async login(user: any) {
    // Payload JWT có thể bao gồm các thông tin bổ sung như role, email, ...
    const payload = { username: user.username, id: user.id, email: user.email, createdAt: user.createdAt }; 
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET, // Dùng secret key từ .env để bảo mật
        expiresIn: '20m', // Thời gian hết hạn token 
      }),
    };
  }

  // Phương thức kiểm tra token khi người dùng gửi yêu cầu bảo vệ
  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      return decoded;
    } catch (error) {
      throw new HttpException('Invalid or expired token!', HttpStatus.UNAUTHORIZED);
    }
  }
}
