import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../../domain/product';

export class ProductResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() description: string;
  @ApiProperty() priceInCents: number;
  @ApiProperty() stock: number;
  @ApiProperty() imageUrl: string;

  static fromDomain(product: Product): ProductResponseDto {
    const dto = new ProductResponseDto();
    const snapshot = product.toSnapshot();
    dto.id = snapshot.id;
    dto.name = snapshot.name;
    dto.description = snapshot.description;
    dto.priceInCents = snapshot.priceInCents;
    dto.stock = snapshot.stock;
    dto.imageUrl = snapshot.imageUrl;
    return dto;
  }
}
