import { request as baseRequest } from '@playwright/test';

export async function createAPIRequest(baseURL) {
  return await baseRequest.newContext({
    baseURL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  });
}
