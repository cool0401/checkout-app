import { EntityManager } from 'typeorm';
import { Product } from '../../domain/product';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  save(product: Product, manager?: EntityManager): Promise<void>;
  /** row-locked lookup for use inside a DB transaction */
  findByIdForUpdate(id: string, manager: EntityManager): Promise<Product | null>;
}
