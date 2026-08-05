// levelo.d.ts
import { h as leveloH } from 'levelojs';

declare global {
  const h: typeof leveloH;
}

export {};