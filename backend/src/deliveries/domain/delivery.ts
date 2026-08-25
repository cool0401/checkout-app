export interface DeliveryProps {
  id: string;
  customerId: string;
  addressLine1: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  phone: string;
}

export class Delivery {
  private constructor(private readonly props: DeliveryProps) {}

  static create(props: DeliveryProps): Delivery {
    return new Delivery(props);
  }

  static fromPersistence(props: DeliveryProps): Delivery {
    return new Delivery(props);
  }

  get id(): string {
    return this.props.id;
  }

  toSnapshot(): DeliveryProps {
    return { ...this.props };
  }
}
