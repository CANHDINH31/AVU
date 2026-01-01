import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import {
  RegisterResponseDto,
  LoginResponseDto,
  VerifyTokenDto,
} from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if user is active
      if (user.active !== 1) {
        throw new ForbiddenException(
          'Account is not active. Please wait for admin approval.',
        );
      }
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  private generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    };
  }

  async login(loginDto: {
    email: string;
    password: string;
  }): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const tokens = this.generateTokens(user);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        rankId: user.rankId || null,
        rank: user.rank
          ? {
              id: user.rank.id,
              name: user.rank.name,
              displayName: user.rank.displayName,
              maxAccounts: user.rank.maxAccounts,
              order: user.rank.order,
            }
          : null,
      },
    };
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<RegisterResponseDto> {
    const existingUser = await this.userService.findByEmail(userData.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.userService.create({
      ...userData,
      active: 0,
    });
    const { password, ...result } = user;
    return { user: result };
  }

  async refreshToken(refresh_token: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refresh_token);
      const user = await this.userService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if user is active
      if (user.active !== 1) {
        throw new ForbiddenException(
          'Account is not active. Please wait for admin approval.',
        );
      }

      return {
        access_token: this.jwtService.sign(
          { email: user.email, sub: user.id },
          { expiresIn: '15m' },
        ),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyTokens(verifyDto: VerifyTokenDto) {
    try {
      // First try to verify access token
      const accessTokenPayload = this.jwtService.verify(verifyDto.access_token);

      const user = await this.userService.findById(accessTokenPayload.sub);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if user is active
      if (user.active !== 1) {
        throw new ForbiddenException(
          'Account is not active. Please wait for admin approval.',
        );
      }

      // If access token is valid, return user info
      return {
        access_token: verifyDto.access_token,
        refresh_token: verifyDto.refresh_token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          active: user.active,
        },
      };
    } catch (error) {
      // Check if error is specifically a token expiration error
      if (error.name === 'TokenExpiredError') {
        try {
          // Try to verify refresh token
          const refreshTokenPayload = this.jwtService.verify(
            verifyDto.refresh_token,
          );
          const user = await this.userService.findById(refreshTokenPayload.sub);
          if (!user) {
            throw new BadRequestException('User not found');
          }

          // Check if user is active
          if (user.active !== 1) {
            throw new ForbiddenException(
              'Account is not active. Please wait for admin approval.',
            );
          }

          // Generate new access token
          const newAccessToken = this.jwtService.sign(
            { email: user.email, sub: user.id },
            {
              expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
            },
          );
          return {
            access_token: newAccessToken,
            refresh_token: verifyDto.refresh_token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              active: user.active,
            },
          };
        } catch (refreshError) {
          throw new BadRequestException('Refresh token is invalid or expired');
        }
      }
      // If error is not TokenExpiredError, throw unauthorized
      throw new BadRequestException('Invalid access token');
    }
  }
}
