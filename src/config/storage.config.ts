import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
    accessKey: process.env.AWS_ACCESS_KEY ?? '',
    secretKey: process.env.AWS_SECRET_KEY ?? '',
    region: process.env.AWS_REGION ?? 'us-east-1',
    bucket: process.env.AWS_BUCKET ?? '',
}));
