import { log } from '@/helpers/log'

let authenticationToken: string | null = null;
export let setAuthenticationToken = (token: string) => {
  authenticationToken = token;
  log('setAuthenticationToken: token', token);
};

export let getAuthenticationToken = () => {
  return authenticationToken;
};