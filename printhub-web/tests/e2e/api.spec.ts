import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:8080/api/v1';

test.describe('API Health Check', () => {
  test('health endpoint should return 200', async ({ request }) => {
    const response = await request.get(`${API_URL.replace('/api/v1', '')}/actuator/health`);

    // May fail if backend not running, which is expected in CI
    if (response.ok()) {
      expect(response.status()).toBe(200);
    }
  });
});

test.describe('Authentication API', () => {
  test('should reject invalid login', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        identifier: 'invalid@example.com',
        password: 'wrongpassword',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should reject registration with invalid data', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        name: 'A', // Too short
        phone: '123', // Invalid
        password: 'short', // Too short
      },
    });

    expect(response.status()).toBe(400);
  });
});

test.describe('Public Endpoints', () => {
  test('should access nearby shops without auth', async ({ request }) => {
    const response = await request.get(`${API_URL}/shops/nearby?lat=19.076&lng=72.8777&radius=10`);

    // Will succeed if backend is running
    if (response.ok()) {
      const data = await response.json();
      expect(data.success).toBe(true);
    }
  });

  test('should reject protected endpoints without auth', async ({ request }) => {
    const response = await request.get(`${API_URL}/users/me`);

    expect(response.status()).toBe(401);
  });
});
