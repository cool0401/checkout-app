import { TransactionStatus } from './transaction-status';

export interface TransactionProps {
  id: string;
  reference: string;
  wompiTransactionId: string | null;
  productId: string;
  customerId: string;
  deliveryId: string;
  quantity: number;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  currency: string;
  status: TransactionStatus;
  cardBrand: string | null;
  cardLastFour: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionProps {
  id: string;
  reference: string;
  productId: string;
  customerId: string;
  deliveryId: string;
  quantity: number;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  currency: string;
}

/** Rich domain entity: owns the PENDING -> terminal-status transition rules. */
export class Transaction {
  private constructor(private props: TransactionProps) {}

  static create(props: CreateTransactionProps): Transaction {
    const now = new Date();
    return new Transaction({
      ...props,
      wompiTransactionId: null,
      status: TransactionStatus.PENDING,
      cardBrand: null,
      cardLastFour: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  get id(): string {
    return this.props.id;
  }

  get reference(): string {
    return this.props.reference;
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get productId(): string {
    return this.props.productId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get amountInCents(): number {
    return this.props.productAmountInCents + this.props.baseFeeInCents + this.props.deliveryFeeInCents;
  }

  get currency(): string {
    return this.props.currency;
  }

  get isPending(): boolean {
    return this.props.status === TransactionStatus.PENDING;
  }

  submitToGateway(wompiTransactionId: string): void {
    if (!this.isPending) {
      throw new Error(`Transaction ${this.props.id} is not PENDING, cannot submit to gateway`);
    }
    this.props.wompiTransactionId = wompiTransactionId;
    this.props.updatedAt = new Date();
  }

  settle(status: TransactionStatus, card?: { brand: string; lastFour: string }): void {
    if (!this.isPending) {
      throw new Error(`Transaction ${this.props.id} was already settled with status ${this.props.status}`);
    }
    this.props.status = status;
    if (card) {
      this.props.cardBrand = card.brand;
      this.props.cardLastFour = card.lastFour;
    }
    this.props.updatedAt = new Date();
  }

  toSnapshot(): TransactionProps {
    return { ...this.props };
  }
}
