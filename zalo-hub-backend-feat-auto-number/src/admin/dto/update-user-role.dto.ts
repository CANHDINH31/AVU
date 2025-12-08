import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../user/entities/user.entity';

export class UpdateUserRoleDto {
  @ApiProperty({
    example: 'admin',
    enum: UserRole,
    description: 'New role for the user',
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
