import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { ConfirmPaymentUseCase } from '../../application/use-cases/confirm-payment.use-case';
import { GetTransactionUseCase } from '../../application/use-cases/get-transaction.use-case';
import { unwrapOrThrow } from '../../../shared/http/unwrap-or-throw';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreateTransactionResponseDto } from './dto/create-transaction-response.dto';
import { ConfirmPaymentResponseDto } from './dto/confirm-payment-response.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly confirmPayment: ConfirmPaymentUseCase,
    private readonly getTransaction: GetTransactionUseCase,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: CreateTransactionResponseDto })
  async create(@Body() dto: CreateTransactionDto): Promise<CreateTransactionResponseDto> {
    const result = await this.createTransaction.execute(dto);
    return unwrapOrThrow(result);
  }

  @Post(':id/confirm')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOkResponse({ type: ConfirmPaymentResponseDto })
  async confirm(
    @Param('id') id: string,
    @Body() dto: ConfirmPaymentDto,
  ): Promise<ConfirmPaymentResponseDto> {
    const result = await this.confirmPayment.execute({ transactionId: id, ...dto });
    return unwrapOrThrow(result);
  }

  @Get(':id')
  @ApiOkResponse({ type: TransactionResponseDto })
  async getById(@Param('id') id: string): Promise<TransactionResponseDto> {
    const result = await this.getTransaction.execute(id);
    const transaction = unwrapOrThrow(result);
    return TransactionResponseDto.fromDomain(transaction);
  }
}
