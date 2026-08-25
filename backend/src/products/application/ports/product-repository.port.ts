import { EntityManager } from 'typeorm';
import { Product } from '../../domain/product';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  /** Persists the given product's current stock. */
  save(product: Product, manager?: EntityManager): Promise<void>;
  /** Loads a product for update inside an existing DB transaction (row lock), or null if missing. */
  findByIdForUpdate(id: string, manager: EntityManager): Promise<Product | null>;
}
