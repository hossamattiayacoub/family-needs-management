import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

/**
 * Thin wrapper around HttpClient that talks to the single Apps Script
 * Web App endpoint using the "action" query/body parameter convention,
 * and unwraps the { success, data, message } envelope.
 *
 * Reads  -> GET  ?action=xxx&...params
 * Writes -> POST { action: 'xxx', ...payload }
 *
 * IMPORTANT: POST bodies are sent as "text/plain" rather than
 * "application/json". Apps Script Web Apps do not implement doOptions(),
 * so any request that the browser considers "non-simple" (which includes
 * a JSON content-type) triggers a CORS preflight (OPTIONS) that Apps
 * Script can never answer, and the browser blocks the real request.
 * "text/plain" is a CORS-safelisted content type, so no preflight is
 * sent - the browser goes straight to the real POST. The Apps Script
 * side (Code.gs) already does JSON.parse(e.postData.contents), so it
 * doesn't care what Content-Type header was actually sent.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(action: string, params: Record<string, string | number> = {}): Observable<T> {
    let httpParams = new HttpParams().set('action', action);
    Object.keys(params).forEach((key) => {
      httpParams = httpParams.set(key, String(params[key]));
    });

    return this.http.get<ApiResponse<T>>(this.baseUrl, { params: httpParams }).pipe(
      map((response) => this.unwrap(response))
    );
  }

  post<T>(action: string, payload: Record<string, unknown> = {}): Observable<T> {
    const body = JSON.stringify({ action, ...payload });
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain;charset=utf-8' });

    return this.http.post<ApiResponse<T>>(this.baseUrl, body, { headers }).pipe(
      map((response) => this.unwrap(response))
    );
  }

  private unwrap<T>(response: ApiResponse<T>): T {
    if (!response || !response.success) {
      throw new Error(response?.message || 'Unknown API error');
    }
    return response.data as T;
  }
}
