import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../../../domain/transaction';

export class TransactionResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() reference: string;
  @ApiProperty() status: string;
  @ApiProperty() productId: string;
  @ApiProperty() quantity: number;
  @ApiProperty() amountInCents: number;
  @ApiProperty() currency: string;
  @ApiProperty({ nullable: true }) cardBrand: string | null;
  @ApiProperty({ nullable: true }) cardLastFour: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  static fromDomain(transaction: Transaction): TransactionResponseDto {
    const dto = new TransactionResponseDto();
    const snapshot = transaction.toSnapshot();
    dto.id = snapshot.id;
    dto.reference = snapshot.reference;
    dto.status = snapshot.status;
    dto.productId = snapshot.productId;
    dto.quantity = snapshot.quantity;
    dto.amountInCents = transaction.amountInCents;
    dto.currency = snapshot.currency;
    dto.cardBrand = snapshot.cardBrand;
    dto.cardLastFour = snapshot.cardLastFour;
    dto.createdAt = snapshot.createdAt;
    dto.updatedAt = snapshot.updatedAt;
    return dto;
  }
}
