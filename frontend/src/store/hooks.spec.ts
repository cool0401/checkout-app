import { useAppDispatch, useAppSelector } from './hooks';

describe('typed store hooks', () => {
  it('re-export the underlying react-redux hooks', () => {
    expect(typeof useAppDispatch).toBe('function');
    expect(typeof useAppSelector).toBe('function');
  });
});
