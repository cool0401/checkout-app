import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';
import { DeliveriesModule } from '../deliveries/deliveries.module';
import { TransactionOrmEntity } from './infrastructure/persistence/transaction.orm-entity';
import { TypeOrmTransactionRepository } from './infrastructure/persistence/typeorm-transaction.repository';
import { TRANSACTION_REPOSITORY } from './application/ports/transaction-repository.port';
import { PAYMENT_GATEWAY } from './application/ports/payment-gateway.port';
import { WompiGatewayAdapter } from './infrastructure/wompi/wompi-gateway.adapter';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { ConfirmPaymentUseCase } from './application/use-cases/confirm-payment.use-case';
import { GetTransactionUseCase } from './application/use-cases/get-transaction.use-case';
import { TransactionsController } from './infrastructure/http/transactions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionOrmEntity]),
    HttpModule.register({ timeout: 10000 }),
    ProductsModule,
    CustomersModule,
    DeliveriesModule,
  ],
  controllers: [TransactionsController],
  providers: [
    { provide: TRANSACTION_REPOSITORY, useClass: TypeOrmTransactionRepository },
    { provide: PAYMENT_GATEWAY, useClass: WompiGatewayAdapter },
    CreateTransactionUseCase,
    ConfirmPaymentUseCase,
    GetTransactionUseCase,
  ],
})
export class TransactionsModule {}
