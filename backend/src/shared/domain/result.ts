export class Result<T, E> {
  private constructor(
    private readonly ok: boolean,
    private readonly value?: T,
    private readonly error?: E,
  ) {}

  static ok<T, E = never>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  static err<T = never, E = unknown>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  isOk(): boolean {
    return this.ok;
  }

  isErr(): boolean {
    return !this.ok;
  }

  /** Returns the success value. Only call after checking isOk(). */
  getValue(): T {
    if (!this.ok) {
      throw new Error('Cannot read the value of a failed Result');
    }
    return this.value as T;
  }

  /** Returns the failure error. Only call after checking isErr(). */
  getError(): E {
    if (this.ok) {
      throw new Error('Cannot read the error of a successful Result');
    }
    return this.error as E;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.ok ? Result.ok(fn(this.value as T)) : Result.err(this.error as E);
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    return this.ok ? Result.ok(this.value as T) : Result.err(fn(this.error as E));
  }

  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return this.ok ? handlers.ok(this.value as T) : handlers.err(this.error as E);
  }
}

// runs fn only if result is Ok, otherwise passes the Err through unchanged
export async function chain<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Promise<Result<U, E>>,
): Promise<Result<U, E>> {
  if (result.isErr()) {
    return Result.err(result.getError());
  }
  return fn(result.getValue());
}
