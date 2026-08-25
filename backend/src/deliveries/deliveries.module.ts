import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryOrmEntity } from './infrastructure/persistence/delivery.orm-entity';
import { TypeOrmDeliveryRepository } from './infrastructure/persistence/typeorm-delivery.repository';
import { DELIVERY_REPOSITORY } from './application/ports/delivery-repository.port';
import { DeliveriesController } from './infrastructure/http/deliveries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryOrmEntity])],
  controllers: [DeliveriesController],
  providers: [{ provide: DELIVERY_REPOSITORY, useClass: TypeOrmDeliveryRepository }],
  exports: [DELIVERY_REPOSITORY],
})
export class DeliveriesModule {}
