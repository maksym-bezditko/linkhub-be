import { ConfigService } from '@nestjs/config';

export const getJwtConfig = async (configService: ConfigService) => {
  return {
    secret: configService.get<string>('JWT_SECRET'),
  };
};
