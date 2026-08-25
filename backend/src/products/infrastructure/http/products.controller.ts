import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { unwrapOrThrow } from '../../../shared/http/unwrap-or-throw';
import { ProductResponseDto } from './dto/product-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly getProducts: GetProductsUseCase,
    private readonly getProduct: GetProductUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ type: ProductResponseDto, isArray: true })
  async list(): Promise<ProductResponseDto[]> {
    const result = await this.getProducts.execute();
    const products = unwrapOrThrow(result);
    return products.map(ProductResponseDto.fromDomain);
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductResponseDto })
  async getById(@Param('id') id: string): Promise<ProductResponseDto> {
    const result = await this.getProduct.execute(id);
    const product = unwrapOrThrow(result);
    return ProductResponseDto.fromDomain(product);
  }
}
