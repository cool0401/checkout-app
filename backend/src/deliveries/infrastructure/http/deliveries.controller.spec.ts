import { NotFoundException } from '@nestjs/common';
import { DeliveriesController } from './deliveries.controller';
import { Delivery } from '../../domain/delivery';
import type { DeliveryRepositoryPort } from '../../application/ports/delivery-repository.port';

describe('DeliveriesController', () => {
  const deliveryProps = {
    id: 'd1',
    customerId: 'c1',
    addressLine1: '123 Main St',
    city: 'Bogota',
    region: 'Cundinamarca',
    country: 'CO',
    postalCode: '110111',
    phone: '300',
  };

  it('returns the mapped delivery when found', async () => {
    const delivery = Delivery.create(deliveryProps);
    const repository = { findById: jest.fn().mockResolvedValue(delivery) } as unknown as DeliveryRepositoryPort;
    const controller = new DeliveriesController(repository);

    const response = await controller.getById('d1');

    expect(response.id).toBe('d1');
    expect(response.city).toBe('Bogota');
  });

  it('throws NotFoundException when the delivery does not exist', async () => {
    const repository = { findById: jest.fn().mockResolvedValue(null) } as unknown as DeliveryRepositoryPort;
    const controller = new DeliveriesController(repository);

    await expect(controller.getById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
