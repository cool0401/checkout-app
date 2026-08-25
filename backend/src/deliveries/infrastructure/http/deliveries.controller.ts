import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { NotFoundDomainError } from '../../../shared/domain/domain-error';
import { Result } from '../../../shared/domain/result';
import { unwrapOrThrow } from '../../../shared/http/unwrap-or-throw';
import { DELIVERY_REPOSITORY } from '../../application/ports/delivery-repository.port';
import type { DeliveryRepositoryPort } from '../../application/ports/delivery-repository.port';
import { DeliveryResponseDto } from './dto/delivery-response.dto';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveriesController {
  constructor(
    @Inject(DELIVERY_REPOSITORY) private readonly deliveries: DeliveryRepositoryPort,
  ) {}

  @Get(':id')
  @ApiOkResponse({ type: DeliveryResponseDto })
  async getById(@Param('id') id: string): Promise<DeliveryResponseDto> {
    const delivery = await this.deliveries.findById(id);
    const result = delivery
      ? Result.ok(delivery)
      : Result.err(new NotFoundDomainError(`Delivery ${id} was not found`));
    return DeliveryResponseDto.fromDomain(unwrapOrThrow(result));
  }
}
