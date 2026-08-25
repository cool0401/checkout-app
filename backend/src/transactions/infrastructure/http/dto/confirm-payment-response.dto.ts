import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPaymentResponseDto {
  @ApiProperty() transactionId: string;
  @ApiProperty() reference: string;
  @ApiProperty() status: string;
  @ApiProperty() amountInCents: number;
  @ApiProperty() currency: string;
  @ApiProperty({ nullable: true }) cardBrand: string | null;
  @ApiProperty({ nullable: true }) cardLastFour: string | null;
  @ApiProperty() productId: string;
  @ApiProperty() remainingStock: number;
}
