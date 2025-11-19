export type AlignEnvironment = 'sandbox' | 'production';

export interface AlignConfig {
  apiKey: string;
  environment: AlignEnvironment;
}

export interface AlignResponse<T> {
  data: T;
  status: number;
  error?: string;
}
