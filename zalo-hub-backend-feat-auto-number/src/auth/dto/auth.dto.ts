import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    example: {
      id: 1,
      email: 'user@example.com',
      name: 'John Doe',
      active: 0,
    },
  })
  user: {
    id: number;
    email: string;
    name: string;
    active: number;
  };
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refresh_token: string;

  @ApiProperty({
    example: {
      id: 1,
      email: 'user@example.com',
      name: 'John Doe',
      role: 'user',
      active: 1,
      rankId: 1,
      rank: {
        id: 1,
        name: 'kim_cuong',
        displayName: 'Kim Cương',
        maxAccounts: 100,
        order: 1,
      },
    },
  })
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    active: number;
    rankId?: number | null;
    rank?: {
      id: number;
      name: string;
      displayName: string;
      maxAccounts: number;
      order: number;
    } | null;
  };
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  refresh_token: string;
}

export class VerifyTokenDto {
  @ApiProperty({
    description: 'Access token to verify',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @ApiProperty({
    description: 'Refresh token to verify and use for refreshing if needed',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
