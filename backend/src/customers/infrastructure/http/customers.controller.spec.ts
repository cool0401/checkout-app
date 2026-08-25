import { NotFoundException } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { Customer } from '../../domain/customer';
import type { CustomerRepositoryPort } from '../../application/ports/customer-repository.port';

describe('CustomersController', () => {
  it('returns the mapped customer when found', async () => {
    const customer = Customer.create({ id: 'c1', fullName: 'Jane', email: 'jane@example.com', phone: '300', legalIdType: 'CC', legalIdNumber: '1' });
    const repository = { findById: jest.fn().mockResolvedValue(customer) } as unknown as CustomerRepositoryPort;
    const controller = new CustomersController(repository);

    const response = await controller.getById('c1');

    expect(response.id).toBe('c1');
    expect(response.email).toBe('jane@example.com');
  });

  it('throws NotFoundException when the customer does not exist', async () => {
    const repository = { findById: jest.fn().mockResolvedValue(null) } as unknown as CustomerRepositoryPort;
    const controller = new CustomersController(repository);

    await expect(controller.getById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
