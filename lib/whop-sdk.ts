import Whop from '@whop/sdk';

export const whopClient = new Whop({
  appID: process.env.NEXT_PUBLIC_WHOP_APP_ID || 'app_l6lYmcWyVzxCzx',
  apiKey: process.env.WHOP_API_KEY || '',
});
