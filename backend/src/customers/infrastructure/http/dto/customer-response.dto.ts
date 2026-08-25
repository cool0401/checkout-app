import { ApiProperty } from '@nestjs/swagger';
import { Customer } from '../../../domain/customer';

export class CustomerResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() fullName: string;
  @ApiProperty() email: string;
  @ApiProperty() phone: string;

  static fromDomain(customer: Customer): CustomerResponseDto {
    const dto = new CustomerResponseDto();
    const snapshot = customer.toSnapshot();
    dto.id = snapshot.id;
    dto.fullName = snapshot.fullName;
    dto.email = snapshot.email;
    dto.phone = snapshot.phone;
    return dto;
  }
}
