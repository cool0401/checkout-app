import { Delivery } from './delivery';

describe('Delivery', () => {
  const props = {
    id: 'd1',
    customerId: 'c1',
    addressLine1: '123 Main St',
    city: 'Bogota',
    region: 'Cundinamarca',
    country: 'CO',
    postalCode: '110111',
    phone: '3001234567',
  };

  it('creates a delivery exposing its id', () => {
    const delivery = Delivery.create(props);
    expect(delivery.id).toBe('d1');
  });

  it('rehydrates a delivery from persistence with the same snapshot', () => {
    const delivery = Delivery.fromPersistence(props);
    expect(delivery.toSnapshot()).toEqual(props);
  });
});
