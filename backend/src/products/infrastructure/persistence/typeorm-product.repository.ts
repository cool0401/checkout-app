import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Product } from '../../domain/product';
import { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import { ProductOrmEntity } from './product.orm-entity';

@Injectable()
export class TypeOrmProductRepository implements ProductRepositoryPort {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repository: Repository<ProductOrmEntity>,
  ) {}

  async findAll(): Promise<Product[]> {
    const rows = await this.repository.find({ order: { name: 'ASC' } });
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.repository.findOne({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findByIdForUpdate(id: string, manager: EntityManager): Promise<Product | null> {
    const row = await manager.findOne(ProductOrmEntity, {
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
    return row ? toDomain(row) : null;
  }

  async save(product: Product, manager?: EntityManager): Promise<void> {
    const snapshot = product.toSnapshot();
    const repo = manager ? manager.getRepository(ProductOrmEntity) : this.repository;
    await repo.update({ id: snapshot.id }, { stock: snapshot.stock });
  }
}

function toDomain(row: ProductOrmEntity): Product {
  return Product.fromPersistence({
    id: row.id,
    name: row.name,
    description: row.description,
    priceInCents: row.priceInCents,
    stock: row.stock,
    imageUrl: row.imageUrl,
  });
}
