import { BadRequestException } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { ConfirmPaymentUseCase } from '../../application/use-cases/confirm-payment.use-case';
import { GetTransactionUseCase } from '../../application/use-cases/get-transaction.use-case';
import { Transaction } from '../../domain/transaction';
import { Result } from '../../../shared/domain/result';
import { ValidationError } from '../../../shared/domain/domain-error';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

describe('TransactionsController', () => {
  const createDto: CreateTransactionDto = {
    productId: 'p1',
    quantity: 1,
    customer: { fullName: 'Jane', email: 'jane@example.com', phone: '300', legalIdType: 'CC', legalIdNumber: '1' },
    delivery: { addressLine1: 'Main St', city: 'Bogota', region: 'Cundinamarca', country: 'CO', postalCode: '110111', phone: '300' },
  };

  const confirmDto: ConfirmPaymentDto = {
    cardToken: 'tok_test',
    installments: 1,
    acceptanceToken: 'accept',
    acceptPersonalAuth: 'auth',
  };

  it('create returns the use case output on success', async () => {
    const output = { transactionId: 't1', reference: 'CHK-1', productAmountInCents: 1000, baseFeeInCents: 100, deliveryFeeInCents: 200, totalAmountInCents: 1300, currency: 'COP' };
    const createTransaction = { execute: jest.fn().mockResolvedValue(Result.ok(output)) } as unknown as CreateTransactionUseCase;
    const controller = new TransactionsController(createTransaction, {} as ConfirmPaymentUseCase, {} as GetTransactionUseCase);

    const response = await controller.create(createDto);

    expect(response).toEqual(output);
  });

  it('create throws a BadRequestException when validation fails', async () => {
    const createTransaction = {
      execute: jest.fn().mockResolvedValue(Result.err(new ValidationError('bad input'))),
    } as unknown as CreateTransactionUseCase;
    const controller = new TransactionsController(createTransaction, {} as ConfirmPaymentUseCase, {} as GetTransactionUseCase);

    await expect(controller.create(createDto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('confirm delegates to ConfirmPaymentUseCase with the transaction id merged in', async () => {
    const output = { transactionId: 't1', reference: 'CHK-1', status: 'APPROVED', amountInCents: 1300, currency: 'COP', cardBrand: 'VISA', cardLastFour: '4242', productId: 'p1', remainingStock: 4 };
    const confirmPayment = { execute: jest.fn().mockResolvedValue(Result.ok(output)) } as unknown as ConfirmPaymentUseCase;
    const controller = new TransactionsController({} as CreateTransactionUseCase, confirmPayment, {} as GetTransactionUseCase);

    const response = await controller.confirm('t1', confirmDto);

    expect(confirmPayment.execute).toHaveBeenCalledWith({ transactionId: 't1', ...confirmDto });
    expect(response).toEqual(output);
  });

  it('getById returns the mapped transaction', async () => {
    const transaction = Transaction.create({
      id: 't1',
      reference: 'CHK-1',
      productId: 'p1',
      customerId: 'c1',
      deliveryId: 'd1',
      quantity: 1,
      productAmountInCents: 1000,
      baseFeeInCents: 100,
      deliveryFeeInCents: 200,
      currency: 'COP',
    });
    const getTransaction = { execute: jest.fn().mockResolvedValue(Result.ok(transaction)) } as unknown as GetTransactionUseCase;
    const controller = new TransactionsController({} as CreateTransactionUseCase, {} as ConfirmPaymentUseCase, getTransaction);

    const response = await controller.getById('t1');

    expect(response.id).toBe('t1');
    expect(response.amountInCents).toBe(1300);
  });
});
