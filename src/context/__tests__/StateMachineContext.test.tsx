import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function createLocalStorageMock() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((k) => delete store[k]);
    }),
  } as Storage;
}

describe('StateMachineContext', () => {
  const STORAGE_KEY = 'app.statemachine';
  let originalEnv: string | undefined;

  beforeEach(() => {
    vi.resetModules();
    originalEnv = import.meta.env.VITE_ENV;
  });

  afterEach(() => {
    import.meta.env.VITE_ENV = originalEnv;
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('initializes with new_requisites and persists state in debug mode', async () => {
    import.meta.env.VITE_ENV = 'debug';
    const localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);

    const { StateMachineProvider, useStateMachine } = await import('../StateMachineContext');

    const TestComponent = () => {
      const { state, setState } = useStateMachine();
      return (
        <div>
          <span data-testid="state">{state}</span>
          <button onClick={() => setState('analyze_requisites')}>change</button>
        </div>
      );
    };

    const { getByTestId, getByText } = render(
      <StateMachineProvider>
        <TestComponent />
      </StateMachineProvider>
    );

    expect(getByTestId('state').textContent).toBe('new_requisites');
    expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'new_requisites');

    fireEvent.click(getByText('change'));

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
        STORAGE_KEY,
        'analyze_requisites'
      );
    });
  });

  it('throws if useStateMachine is used outside of provider', async () => {
    import.meta.env.VITE_ENV = 'debug';
    const localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);

    const { useStateMachine } = await import('../StateMachineContext');

    const TestComponent = () => {
      useStateMachine();
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow(
      'useStateMachine debe usarse dentro de StateMachineProvider'
    );
  });
});

