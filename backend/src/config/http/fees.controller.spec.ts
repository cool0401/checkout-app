import { FeesController } from './fees.controller';

describe('FeesController', () => {
  it('returns the fees section of the app config', () => {
    const configService = { get: jest.fn().mockReturnValue({ baseFeeInCents: 500, deliveryFeeInCents: 800, currency: 'COP' }) };
    const controller = new FeesController(configService as never);

    expect(controller.getFees()).toEqual({ baseFeeInCents: 500, deliveryFeeInCents: 800, currency: 'COP' });
    expect(configService.get).toHaveBeenCalledWith('fees', { infer: true });
  });
});
