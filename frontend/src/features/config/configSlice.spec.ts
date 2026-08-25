import reducer, { loadFees } from './configSlice';
import type { ConfigState } from './configSlice';
import type { FeesDto } from '../../api/checkoutApi';

const fees: FeesDto = { baseFeeInCents: 500000, deliveryFeeInCents: 800000, currency: 'COP' };

describe('configSlice', () => {
  it('returns the initial state', () => {
    const initialState: ConfigState = { fees: null };
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('stores the fees once loadFees resolves', () => {
    const state = reducer({ fees: null }, loadFees.fulfilled(fees, '', undefined));
    expect(state.fees).toEqual(fees);
  });
});
