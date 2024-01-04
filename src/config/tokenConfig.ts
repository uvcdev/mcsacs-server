import { SignOptions } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

interface TokenConfig {
  secretKey: string;
  options: SignOptions;
}

export const tokenConfig: TokenConfig = {
  secretKey: 'A6C093B08CB1D823A9CFFC79712D21C89D34FE86E63AF99218BADA38163E8326', // 64 hex characters = 256 binary bits
  options: {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRESIN || '2h', // default: 2h
    // expiresIn: '8760h', // for test 1year
  },
};
