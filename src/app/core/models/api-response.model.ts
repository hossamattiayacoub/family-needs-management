/**
 * Matches the JSON envelope returned by every Apps Script endpoint:
 *   Success -> { success: true,  data: T }
 *   Failure -> { success: false, message: string }
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
