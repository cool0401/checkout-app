import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'transactions' })
export class TransactionOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference: string;

  @Column({ name: 'wompi_transaction_id', type: 'varchar', nullable: true })
  wompiTransactionId: string | null;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'delivery_id', type: 'uuid' })
  deliveryId: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ name: 'product_amount_in_cents', type: 'integer' })
  productAmountInCents: number;

  @Column({ name: 'base_fee_in_cents', type: 'integer' })
  baseFeeInCents: number;

  @Column({ name: 'delivery_fee_in_cents', type: 'integer' })
  deliveryFeeInCents: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ name: 'card_brand', type: 'varchar', nullable: true })
  cardBrand: string | null;

  @Column({ name: 'card_last_four', type: 'varchar', nullable: true })
  cardLastFour: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
