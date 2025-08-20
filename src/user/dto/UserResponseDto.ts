import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
    @Expose()
    id: number;

    @Expose()
    guid: string;

    @Expose()
    email: string;

    @Expose()
    username: string;

    @Exclude()
    password?: string;
}