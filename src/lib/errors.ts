export type ErrorSeverity = 'warning' | 'error';

export interface AppError {
  message: string;
  severity: ErrorSeverity;
  retryable: boolean;
  action?: () => void;
}

export function handleDatabaseError(error: unknown): AppError {
  const message = error instanceof Error ? error.message : 'Unknown error';

  if (message.includes('fetch') || message.includes('network')) {
    return {
      message: "No connection — changes won't sync",
      severity: 'warning',
      retryable: true,
    };
  }

  if (message.includes('constraint')) {
    return {
      message: 'Invalid data — please check your input',
      severity: 'error',
      retryable: false,
    };
  }

  return {
    message: 'Something went wrong — tap to retry',
    severity: 'error',
    retryable: true,
  };
}

export function showToast(error: AppError): void {
  const event = new CustomEvent('app:toast', { detail: error });
  window.dispatchEvent(event);
}
