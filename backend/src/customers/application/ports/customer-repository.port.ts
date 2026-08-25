import { EntityManager } from 'typeorm';
import { Customer } from '../../domain/customer';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepositoryPort {
  findById(id: string): Promise<Customer | null>;
  create(customer: Customer, manager?: EntityManager): Promise<Customer>;
}
