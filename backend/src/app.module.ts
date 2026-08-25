import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration, { AppConfig } from './config/configuration';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { TransactionsModule } from './transactions/transactions.module';
import { HealthController } from './health/health.controller';
import { ProductOrmEntity } from './products/infrastructure/persistence/product.orm-entity';
import { CustomerOrmEntity } from './customers/infrastructure/persistence/customer.orm-entity';
import { DeliveryOrmEntity } from './deliveries/infrastructure/persistence/delivery.orm-entity';
import { TransactionOrmEntity } from './transactions/infrastructure/persistence/transaction.orm-entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const db = configService.get('database', { infer: true });
        return {
          type: 'postgres' as const,
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.name,
          entities: [ProductOrmEntity, CustomerOrmEntity, DeliveryOrmEntity, TransactionOrmEntity],
          synchronize: process.env.NODE_ENV !== 'production',
        };
      },
    }),
    ProductsModule,
    CustomersModule,
    DeliveriesModule,
    TransactionsModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
