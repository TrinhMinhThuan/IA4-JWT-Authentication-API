import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule, 
    
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Đặt secret cho JWT
      signOptions: { expiresIn: '20m' },
    }),
  ],
  providers: [AuthService],
  exports: [AuthService], // Xuất AuthService để sử dụng trong AppModule
}
)
export class AuthModule {}
