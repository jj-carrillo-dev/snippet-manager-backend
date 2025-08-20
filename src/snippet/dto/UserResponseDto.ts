import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
    
    @Expose()
    guid: string;

    @Expose()
    username: string;
}