import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../configuration';

export class FeesResponseDto {
  @ApiProperty() baseFeeInCents: number;
  @ApiProperty() deliveryFeeInCents: number;
  @ApiProperty() currency: string;
}

/** Public read-only fee constants, used by the frontend to render the payment summary before a transaction exists. */
@ApiTags('config')
@Controller('config')
export class FeesController {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  @Get('fees')
  @ApiOkResponse({ type: FeesResponseDto })
  getFees(): FeesResponseDto {
    return this.configService.get('fees', { infer: true });
  }
}
