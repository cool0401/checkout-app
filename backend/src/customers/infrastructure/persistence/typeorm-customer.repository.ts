import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Customer } from '../../domain/customer';
import { CustomerRepositoryPort } from '../../application/ports/customer-repository.port';
import { CustomerOrmEntity } from './customer.orm-entity';

@Injectable()
export class TypeOrmCustomerRepository implements CustomerRepositoryPort {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly repository: Repository<CustomerOrmEntity>,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    const row = await this.repository.findOne({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async create(customer: Customer, manager?: EntityManager): Promise<Customer> {
    const repo = manager ? manager.getRepository(CustomerOrmEntity) : this.repository;
    const snapshot = customer.toSnapshot();
    const saved = await repo.save(repo.create(snapshot));
    return toDomain(saved);
  }
}

function toDomain(row: CustomerOrmEntity): Customer {
  return Customer.fromPersistence({
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    legalIdType: row.legalIdType,
    legalIdNumber: row.legalIdNumber,
  });
}
