import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../shared/domain/result';
import { DomainError } from '../../../shared/domain/domain-error';
import { Product } from '../../domain/product';
import { PRODUCT_REPOSITORY } from '../ports/product-repository.port';
import type { ProductRepositoryPort } from '../ports/product-repository.port';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepositoryPort,
  ) {}

  async execute(): Promise<Result<Product[], DomainError>> {
    const products = await this.products.findAll();
    return Result.ok(products);
  }
}
