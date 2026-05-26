/**
 * safeFetch — wraps native fetch with JSON-safe parsing and debug logging.
 * Use this instead of fetch() + response.json() anywhere in the mobile app.
 */

import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://safestocker.onrender.com';

export async function safeFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await SecureStore.getItemAsync('auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, { ...options, headers });

  const text = await response.text();

  console.log(`[safeFetch] ${options.method ?? 'GET'} ${url}`);
  console.log(`[safeFetch] Status: ${response.status}`);
  console.log(`[safeFetch] Content-Type: ${response.headers.get('content-type')}`);
  console.log(`[safeFetch] Body: ${text.slice(0, 300)}`);

  try {
    return JSON.parse(text) as T;
  } catch {
    console.error('[safeFetch] Non-JSON response:', text);
    throw new Error(`Server returned non-JSON (status ${response.status}): ${text.slice(0, 200)}`);
  }
}
