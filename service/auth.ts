import httpClient from '@/lib/http';
import { OAuth2PasswordRequestForm, UserCredential } from '@/types/auth';

export function signIn(req: OAuth2PasswordRequestForm) {
  return httpClient.post<UserCredential>(
    '/auth:signIn',
    req,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
}
