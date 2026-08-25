import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Delivery } from '../../domain/delivery';
import { DeliveryRepositoryPort } from '../../application/ports/delivery-repository.port';
import { DeliveryOrmEntity } from './delivery.orm-entity';

@Injectable()
export class TypeOrmDeliveryRepository implements DeliveryRepositoryPort {
  constructor(
    @InjectRepository(DeliveryOrmEntity)
    private readonly repository: Repository<DeliveryOrmEntity>,
  ) {}

  async findById(id: string): Promise<Delivery | null> {
    const row = await this.repository.findOne({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async create(delivery: Delivery, manager?: EntityManager): Promise<Delivery> {
    const repo = manager ? manager.getRepository(DeliveryOrmEntity) : this.repository;
    const snapshot = delivery.toSnapshot();
    const saved = await repo.save(repo.create(snapshot));
    return toDomain(saved);
  }
}

function toDomain(row: DeliveryOrmEntity): Delivery {
  return Delivery.fromPersistence({
    id: row.id,
    customerId: row.customerId,
    addressLine1: row.addressLine1,
    city: row.city,
    region: row.region,
    country: row.country,
    postalCode: row.postalCode,
    phone: row.phone,
  });
}
