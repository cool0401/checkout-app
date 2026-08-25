import { Customer } from './customer';

describe('Customer', () => {
  const props = {
    id: 'c1',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '3001234567',
    legalIdType: 'CC',
    legalIdNumber: '123456789',
  };

  it('creates a customer exposing id and email', () => {
    const customer = Customer.create(props);
    expect(customer.id).toBe('c1');
    expect(customer.email).toBe('jane@example.com');
  });

  it('rehydrates a customer from persistence with the same snapshot', () => {
    const customer = Customer.fromPersistence(props);
    expect(customer.toSnapshot()).toEqual(props);
  });
});
