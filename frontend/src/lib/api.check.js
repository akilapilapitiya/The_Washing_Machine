import api from '@/lib/api';

/**
 * Test API connection
 * @returns {Promise} Database connection info
 */
export const testConnection = async () => {
  const response = await api.get('/db');
  return response.data;
};

/**
 * Example usage of the API client
 * 
 * GET request:
 *   const data = await api.get('/endpoint');
 * 
 * POST request:
 *   const data = await api.post('/endpoint', { key: 'value' });
 * 
 * PUT request:
 *   const data = await api.put('/endpoint/123', { key: 'newValue' });
 * 
 * DELETE request:
 *   const data = await api.delete('/endpoint/123');
 * 
 * With query params:
 *   const data = await api.get('/endpoint', { params: { page: 1, limit: 10 } });
 */
