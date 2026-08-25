import { EntityManager } from 'typeorm';
import { Delivery } from '../../domain/delivery';

export const DELIVERY_REPOSITORY = Symbol('DELIVERY_REPOSITORY');

export interface DeliveryRepositoryPort {
  findById(id: string): Promise<Delivery | null>;
  create(delivery: Delivery, manager?: EntityManager): Promise<Delivery>;
}
