import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';


@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1]; // Lấy token từ header Authorization
    if (!token) {
      throw new HttpException('Token not found', HttpStatus.FORBIDDEN);
    }

    // Kiểm tra token hợp lệ
    try {
      await this.authService.verifyToken(token); // Dùng phương thức verifyToken để kiểm tra token
      return true;
    } catch (error) {
      throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
    }
  }
}
