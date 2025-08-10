import { describe, it, expect, afterEach, vi } from 'vitest';

// Mock axios to capture interceptors without performing real requests
vi.mock('axios', () => {
  const requestHandlers: any[] = [];
  const responseHandlers: any[] = [];
  return {
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: {
            handlers: requestHandlers,
            use: (handler: any) => requestHandlers.push(handler),
          },
          response: {
            handlers: responseHandlers,
            use: (_: any, handler: any) => responseHandlers.push(handler),
          },
        },
      })),
    },
  };
});

import { api } from '../api';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('api interceptors', () => {
  it('adds Authorization header when access_token exists', () => {
    localStorage.setItem('access_token', 'token123');
    const handler = (api.interceptors.request as any).handlers[0];
    const config: any = { headers: {} };
    const result = handler(config);
    expect(result.headers.Authorization).toBe('Bearer token123');
  });

  it.each([401, 403])(
    'removes token and dispatches events on %s response',
    async (status) => {
      localStorage.setItem('access_token', 'token123');
      const dispatchSpy = vi
        .spyOn(window, 'dispatchEvent')
        .mockImplementation(() => true);
      const errorHandler = (api.interceptors.response as any).handlers[0];
      const error = { response: { status } };
      await expect(errorHandler(error)).rejects.toBe(error);
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'auth:expired' })
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'auth:changed' })
      );
    }
  );
});

