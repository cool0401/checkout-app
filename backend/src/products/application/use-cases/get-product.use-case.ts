import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../shared/domain/result';
import { DomainError, NotFoundDomainError } from '../../../shared/domain/domain-error';
import { Product } from '../../domain/product';
import { PRODUCT_REPOSITORY } from '../ports/product-repository.port';
import type { ProductRepositoryPort } from '../ports/product-repository.port';

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Product, DomainError>> {
    const product = await this.products.findById(id);
    if (!product) {
      return Result.err(new NotFoundDomainError(`Product ${id} was not found`));
    }
    return Result.ok(product);
  }
}
