import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { NotFoundDomainError } from '../../../shared/domain/domain-error';
import { Result } from '../../../shared/domain/result';
import { unwrapOrThrow } from '../../../shared/http/unwrap-or-throw';
import { CUSTOMER_REPOSITORY } from '../../application/ports/customer-repository.port';
import type { CustomerRepositoryPort } from '../../application/ports/customer-repository.port';
import { CustomerResponseDto } from './dto/customer-response.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepositoryPort,
  ) {}

  @Get(':id')
  @ApiOkResponse({ type: CustomerResponseDto })
  async getById(@Param('id') id: string): Promise<CustomerResponseDto> {
    const customer = await this.customers.findById(id);
    const result = customer
      ? Result.ok(customer)
      : Result.err(new NotFoundDomainError(`Customer ${id} was not found`));
    return CustomerResponseDto.fromDomain(unwrapOrThrow(result));
  }
}
