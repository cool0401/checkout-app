import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class CustomerDto {
  @ApiProperty() @IsString() fullName: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() phone: string;
  @ApiProperty() @IsString() legalIdType: string;
  @ApiProperty() @IsString() legalIdNumber: string;
}

export class DeliveryDto {
  @ApiProperty() @IsString() addressLine1: string;
  @ApiProperty() @IsString() city: string;
  @ApiProperty() @IsString() region: string;
  @ApiProperty() @IsString() country: string;
  @ApiProperty() @IsString() postalCode: string;
  @ApiProperty() @IsString() phone: string;
}

export class CreateTransactionDto {
  @ApiProperty() @IsUUID() productId: string;
  @ApiProperty() @IsInt() @Min(1) quantity: number;

  @ApiProperty({ type: CustomerDto })
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @ApiProperty({ type: DeliveryDto })
  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery: DeliveryDto;
}
