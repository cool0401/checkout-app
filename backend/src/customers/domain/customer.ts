export interface CustomerProps {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  legalIdType: string;
  legalIdNumber: string;
}

export class Customer {
  private constructor(private readonly props: CustomerProps) {}

  static create(props: CustomerProps): Customer {
    return new Customer(props);
  }

  static fromPersistence(props: CustomerProps): Customer {
    return new Customer(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  toSnapshot(): CustomerProps {
    return { ...this.props };
  }
}
