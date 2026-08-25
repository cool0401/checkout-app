export interface ProductProps {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stock: number;
  imageUrl: string;
}

/** Rich domain entity — stock rules live here, not in the ORM or the controller. */
export class Product {
  private constructor(private props: ProductProps) {}

  static fromPersistence(props: ProductProps): Product {
    return new Product(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get priceInCents(): number {
    return this.props.priceInCents;
  }

  get stock(): number {
    return this.props.stock;
  }

  get imageUrl(): string {
    return this.props.imageUrl;
  }

  hasStockFor(quantity: number): boolean {
    return this.props.stock >= quantity;
  }

  decrementStock(quantity: number): void {
    if (!this.hasStockFor(quantity)) {
      throw new Error('Cannot decrement below zero stock');
    }
    this.props.stock -= quantity;
  }

  toSnapshot(): ProductProps {
    return { ...this.props };
  }
}
