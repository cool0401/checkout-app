import { ApiProperty } from '@nestjs/swagger';
import { Delivery } from '../../../domain/delivery';

export class DeliveryResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() addressLine1: string;
  @ApiProperty() city: string;
  @ApiProperty() region: string;
  @ApiProperty() country: string;
  @ApiProperty() postalCode: string;
  @ApiProperty() phone: string;

  static fromDomain(delivery: Delivery): DeliveryResponseDto {
    const dto = new DeliveryResponseDto();
    const snapshot = delivery.toSnapshot();
    dto.id = snapshot.id;
    dto.addressLine1 = snapshot.addressLine1;
    dto.city = snapshot.city;
    dto.region = snapshot.region;
    dto.country = snapshot.country;
    dto.postalCode = snapshot.postalCode;
    dto.phone = snapshot.phone;
    return dto;
  }
}
