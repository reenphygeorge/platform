import { HttpModule } from '@nestjs/axios';
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigInjectionToken, AuthModuleConfig } from './config.interface';
import { SmsService } from './supertokens/sms.service';
import { SupertokensService } from './supertokens/supertokens.service';

@Module({
  providers: [SupertokensService, SmsService],
  imports: [HttpModule, ConfigModule],
  exports: [],
  controllers: [],
})
export class AuthModule {
  static forRoot({ connectionURI, apiKey, appInfo }: AuthModuleConfig): DynamicModule {
    return {
      providers: [
        {
          useValue: {
            appInfo,
            connectionURI,
            apiKey,
          },
          provide: ConfigInjectionToken,
        },
        SupertokensService,
      ],
      exports: [],
      imports: [],
      module: AuthModule,
    };
  }
}
