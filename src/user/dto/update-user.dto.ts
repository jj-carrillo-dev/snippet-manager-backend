import { IsEmail, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDto {

  @IsOptional()
  @MaxLength(100)
  username: string;

  @IsOptional()
  @IsEmail()
  email: string;
}