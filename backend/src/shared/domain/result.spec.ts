import { chain, Result } from './result';

describe('Result', () => {
  it('creates an Ok result carrying a value', () => {
    const result = Result.ok<number, string>(42);
    expect(result.isOk()).toBe(true);
    expect(result.isErr()).toBe(false);
    expect(result.getValue()).toBe(42);
  });

  it('creates an Err result carrying an error', () => {
    const result = Result.err<number, string>('boom');
    expect(result.isErr()).toBe(true);
    expect(result.isOk()).toBe(false);
    expect(result.getError()).toBe('boom');
  });

  it('throws when reading the value of a failed result', () => {
    const result = Result.err<number, string>('boom');
    expect(() => result.getValue()).toThrow();
  });

  it('throws when reading the error of a successful result', () => {
    const result = Result.ok<number, string>(1);
    expect(() => result.getError()).toThrow();
  });

  it('map transforms an Ok value and passes through an Err untouched', () => {
    const ok = Result.ok<number, string>(2).map((n) => n * 2);
    expect(ok.getValue()).toBe(4);

    const err = Result.err<number, string>('nope').map((n) => n * 2);
    expect(err.isErr()).toBe(true);
    expect(err.getError()).toBe('nope');
  });

  it('mapErr transforms an Err and passes through an Ok untouched', () => {
    const err = Result.err<number, string>('nope').mapErr((e) => `wrapped:${e}`);
    expect(err.getError()).toBe('wrapped:nope');

    const ok = Result.ok<number, string>(5).mapErr((e) => `wrapped:${e}`);
    expect(ok.getValue()).toBe(5);
  });

  it('match dispatches to the ok or err handler', () => {
    const okOutcome = Result.ok<number, string>(1).match({ ok: (v) => v + 1, err: () => -1 });
    expect(okOutcome).toBe(2);

    const errOutcome = Result.err<number, string>('x').match({ ok: (v) => v + 1, err: () => -1 });
    expect(errOutcome).toBe(-1);
  });
});

describe('chain', () => {
  it('runs the next step when the result is Ok', async () => {
    const step = jest.fn(async (n: number) => Result.ok<number, string>(n + 1));
    const result = await chain(Result.ok<number, string>(1), step);

    expect(step).toHaveBeenCalledWith(1);
    expect(result.getValue()).toBe(2);
  });

  it('short-circuits and skips the next step when the result is already Err', async () => {
    const step = jest.fn(async (n: number) => Result.ok<number, string>(n + 1));
    const result = await chain(Result.err<number, string>('failed'), step);

    expect(step).not.toHaveBeenCalled();
    expect(result.isErr()).toBe(true);
    expect(result.getError()).toBe('failed');
  });
});
