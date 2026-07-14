import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

/**
 * Catches transport-level failures (network down, non-2xx HTTP status,
 * Apps Script deployment errors) and surfaces a friendly Snackbar message.
 * Business-logic errors thrown from ApiService.unwrap() (the
 * { success: false, message } case) still propagate to the caller so
 * component-level catchError blocks can show the specific message.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const message = error.status === 0
          ? 'Cannot reach the server. Check your connection or API URL.'
          : `Server error (${error.status}). Please try again.`;
        snackBar.open(message, 'Dismiss', { duration: 5000 });
      }
      return throwError(() => error);
    })
  );
};
