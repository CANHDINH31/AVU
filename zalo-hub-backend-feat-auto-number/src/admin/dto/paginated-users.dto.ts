import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export class PaginatedUsersDto {
  @ApiProperty({ type: [User] })
  data: User[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrev: boolean;
}
