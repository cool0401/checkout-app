import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import configuration from '../config/configuration';
import { ProductOrmEntity } from '../products/infrastructure/persistence/product.orm-entity';
import { CustomerOrmEntity } from '../customers/infrastructure/persistence/customer.orm-entity';
import { DeliveryOrmEntity } from '../deliveries/infrastructure/persistence/delivery.orm-entity';
import { TransactionOrmEntity } from '../transactions/infrastructure/persistence/transaction.orm-entity';

const DUMMY_PRODUCTS: Array<Omit<ProductOrmEntity, 'id'>> = [
  {
    name: 'Wireless Headphones',
    description: 'Over-ear Bluetooth headphones with active noise cancellation and 30h battery life.',
    priceInCents: 25000000,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Compact 75% mechanical keyboard with hot-swappable switches and RGB backlight.',
    priceInCents: 32000000,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
  },
  {
    name: 'Smart Watch',
    description: 'Fitness tracker smart watch with heart-rate monitor and 7-day battery life.',
    priceInCents: 45000000,
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
  },
  {
    name: 'Portable Speaker',
    description: 'Waterproof portable Bluetooth speaker with 360-degree sound.',
    priceInCents: 18000000,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600',
  },
];

async function seed(): Promise<void> {
  const config = configuration();
  const dataSource = new DataSource({
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    entities: [ProductOrmEntity, CustomerOrmEntity, DeliveryOrmEntity, TransactionOrmEntity],
    synchronize: true,
  });

  await dataSource.initialize();
  const repository = dataSource.getRepository(ProductOrmEntity);

  const existingCount = await repository.count();
  if (existingCount > 0) {
    console.log(`Products table already has ${existingCount} row(s), skipping seed.`);
    await dataSource.destroy();
    return;
  }

  const rows = DUMMY_PRODUCTS.map((product) => repository.create({ id: randomUUID(), ...product }));
  await repository.save(rows);
  console.log(`Seeded ${rows.length} product(s).`);

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
