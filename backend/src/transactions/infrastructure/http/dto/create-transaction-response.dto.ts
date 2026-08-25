import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionResponseDto {
  @ApiProperty() transactionId: string;
  @ApiProperty() reference: string;
  @ApiProperty() productAmountInCents: number;
  @ApiProperty() baseFeeInCents: number;
  @ApiProperty() deliveryFeeInCents: number;
  @ApiProperty() totalAmountInCents: number;
  @ApiProperty() currency: string;
}
