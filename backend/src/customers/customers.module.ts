import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerOrmEntity } from './infrastructure/persistence/customer.orm-entity';
import { TypeOrmCustomerRepository } from './infrastructure/persistence/typeorm-customer.repository';
import { CUSTOMER_REPOSITORY } from './application/ports/customer-repository.port';
import { CustomersController } from './infrastructure/http/customers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrmEntity])],
  controllers: [CustomersController],
  providers: [{ provide: CUSTOMER_REPOSITORY, useClass: TypeOrmCustomerRepository }],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomersModule {}
