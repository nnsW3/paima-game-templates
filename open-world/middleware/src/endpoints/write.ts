import { builder } from 'paima-sdk/paima-concise';
import type { OldResult, Result } from 'paima-sdk/paima-mw-core';
import { postConciselyEncodedData, getActiveAddress } from 'paima-sdk/paima-mw-core';

import type { EndpointErrorFxn } from '../errors';
import {
  buildEndpointErrorFxn,
  OpenWorldMiddlewareErrorCode,
  PaimaMiddlewareErrorCode,
} from '../errors';

const getUserWallet = (errorFxn: EndpointErrorFxn): Result<string> => {
  try {
    const wallet = getActiveAddress();
    if (wallet.length === 0) {
      return errorFxn(PaimaMiddlewareErrorCode.WALLET_NOT_CONNECTED);
    }
    return { result: wallet, success: true };
  } catch (err) {
    return errorFxn(OpenWorldMiddlewareErrorCode.INTERNAL_INVALID_POSTING_MODE, err);
  }
};

async function submitMoves(x: number, y: number): Promise<OldResult> {
  const errorFxn = buildEndpointErrorFxn('submitMoves');

  const query = getUserWallet(errorFxn);
  if (!query.success) return query;
  const userWalletAddress = query.result;

  const conciseBuilder = builder.initialize();
  conciseBuilder.setPrefix('m'); // m|*user|x|y
  conciseBuilder.addValue({ value: userWalletAddress, isStateIdentifier: true });
  conciseBuilder.addValue({ value: String(x) });
  conciseBuilder.addValue({ value: String(y) });

  try {
    const result = await postConciselyEncodedData(conciseBuilder.build());
    if (result.success) {
      return { success: true, message: '' };
    } else {
      return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN);
    }
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, err);
  }
}

async function submitIncrement(x: number, y: number): Promise<OldResult> {
  const errorFxn = buildEndpointErrorFxn('submitIncrement');

  const query = getUserWallet(errorFxn);
  if (!query.success) return query;
  // const userWalletAddress = query.result;

  const conciseBuilder = builder.initialize();
  conciseBuilder.setPrefix('i');
  conciseBuilder.addValue({ value: String(x), isStateIdentifier: true });
  conciseBuilder.addValue({ value: String(y), isStateIdentifier: true });

  try {
    const result = await postConciselyEncodedData(conciseBuilder.build());
    if (result.success) {
      return { success: true, message: '' };
    } else {
      return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN);
    }
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, err);
  }
}

async function joinWorld(): Promise<OldResult> {
  const errorFxn = buildEndpointErrorFxn('joinWorld');

  const query = getUserWallet(errorFxn);
  if (!query.success) return query;

  const conciseBuilder = builder.initialize();
  conciseBuilder.setPrefix('j');
  try {
    const result = await postConciselyEncodedData(conciseBuilder.build());
    if (result.success) {
      return { success: true, message: '' };
    } else {
      return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN);
    }
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, err);
  }
}

export const writeEndpoints = {
  joinWorld,
  submitMoves,
  submitIncrement,
};