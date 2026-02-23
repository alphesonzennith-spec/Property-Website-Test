import type { NextRequest } from 'next/server';

export type TRPCContext = {
  req: NextRequest;
  /**
   * Populated after Singpass session validation.
   * SINGPASS: Add Singpass verification check here — decode JWT/session,
   * fetch MyInfo, populate userId and singpassVerified.
   */
  userId: string | null;
  singpassVerified: boolean;
};

export async function createTRPCContext(opts: { req: NextRequest }): Promise<TRPCContext> {
  // SINGPASS: Add Singpass verification check here
  // Future: extract session token from cookie, validate, populate userId
  return {
    req: opts.req,
    userId: null,
    singpassVerified: false,
  };
}
