import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty() @IsString() cardToken: string;
  @ApiProperty() @IsInt() @Min(1) installments: number;
  @ApiProperty() @IsString() acceptanceToken: string;
  @ApiProperty() @IsString() acceptPersonalAuth: string;
}
