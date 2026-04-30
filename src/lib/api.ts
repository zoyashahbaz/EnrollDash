/**
 * Centralized API client for the Enrollment Dashboard.
 * Handles generic fetch requests with type safety and error handling.
 */
import { Enrollment, Prediction } from '../types';

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Request failed: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getEnrollments: () => fetcher<Enrollment[]>('/api/enrollments'),
  getPrediction: () => fetcher<Prediction>('/api/prediction'),
  saveEnrollment: (data: { id?: number, year: number, total_enrolled: number, class_name: string, college_name: string, city_name: string }) => 
    fetcher<{ success: boolean }>('/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteEnrollment: (id: number | string) => 
    fetcher<{ success: boolean }>(`/api/enrollments/${id}`, {
      method: 'DELETE',
    }),
  updateProfile: (data: { username: string, role?: string, bio?: string }) =>
    fetcher<{ user: any }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  changePassword: (data: { currentPassword: string, newPassword: string }) =>
    fetcher<{ success: boolean }>('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  verifyPasswordInstant: (password: string) =>
    fetcher<{ isValid: boolean }>('/api/auth/verify-password-instant', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
};
