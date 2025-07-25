import { HttpClient } from '../src/clients/http-client';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpClient', () => {
  let httpClient: HttpClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      defaults: {
        headers: {
          common: {}
        }
      },
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    httpClient = new HttpClient(
      'https://api.defindex.io',
      'sk_test_api_key_123',
      15000
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create axios instance with correct configuration when API key provided', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.defindex.io',
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk_test_api_key_123'
        },
        transformRequest: expect.any(Array)
      });
    });

    it('should create axios instance without Authorization header when no API key provided', () => {
      jest.clearAllMocks();
      new HttpClient('https://api.defindex.io', '', 15000);
      
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.defindex.io',
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        },
        transformRequest: expect.any(Array)
      });
    });

    it('should set up response interceptor', () => {
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('GET requests', () => {
    it('should make GET request and return data', async () => {
      const mockData = { message: 'success' };
      const mockResponse = { data: mockData };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await httpClient.get('/test-endpoint');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test-endpoint', undefined);
      expect(result).toEqual(mockData);
    });

    it('should make GET request with config', async () => {
      const mockData = { message: 'success' };
      const mockResponse = { data: mockData };
      const config = { headers: { 'Custom-Header': 'value' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await httpClient.get('/test-endpoint', config);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test-endpoint', config);
      expect(result).toEqual(mockData);
    });

    it('should handle GET request errors', async () => {
      const error = new Error('Network error');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(httpClient.get('/test-endpoint')).rejects.toThrow('Network error');
    });
  });

  describe('POST requests', () => {
    it('should make POST request and return data', async () => {
      const mockData = { message: 'created' };
      const mockResponse = { data: mockData };
      const postData = { name: 'test' };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await httpClient.post('/test-endpoint', postData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test-endpoint', postData, undefined);
      expect(result).toEqual(mockData);
    });

    it('should make POST request with config', async () => {
      const mockData = { message: 'created' };
      const mockResponse = { data: mockData };
      const postData = { name: 'test' };
      const config = { headers: { 'Custom-Header': 'value' } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await httpClient.post('/test-endpoint', postData, config);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test-endpoint', postData, config);
      expect(result).toEqual(mockData);
    });

    it('should handle POST request errors', async () => {
      const error = new Error('Validation error');
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(httpClient.post('/test-endpoint', {})).rejects.toThrow('Validation error');
    });
  });

  describe('buildUrlWithQuery', () => {
    it('should build URL without query parameters', () => {
      const result = httpClient.buildUrlWithQuery('/api/test', {});
      expect(result).toBe('/api/test');
    });

    it('should build URL with single query parameter', () => {
      const result = httpClient.buildUrlWithQuery('/api/test', { param1: 'value1' });
      expect(result).toBe('/api/test?param1=value1');
    });

    it('should build URL with multiple query parameters', () => {
      const result = httpClient.buildUrlWithQuery('/api/test', {
        param1: 'value1',
        param2: 'value2'
      });
      expect(result).toBe('/api/test?param1=value1&param2=value2');
    });

    it('should handle array parameters', () => {
      const result = httpClient.buildUrlWithQuery('/api/test', {
        protocols: ['soroswap', 'aqua']
      });
      expect(result).toBe('/api/test?protocols=soroswap&protocols=aqua');
    });

    it('should encode special characters', () => {
      const result = httpClient.buildUrlWithQuery('/api/test', {
        url: 'https://example.com/path?param=value'
      });
      expect(result).toBe('/api/test?url=https%3A%2F%2Fexample.com%2Fpath%3Fparam%3Dvalue');
    });

    it('should filter out undefined and null values', () => {
      const result = httpClient.buildUrlWithQuery('/api/test', {
        param1: 'value1',
        param2: undefined,
        param3: null,
        param4: 'value4'
      });
      expect(result).toBe('/api/test?param1=value1&param4=value4');
    });

    it('should handle empty string values', () => {
      const result = httpClient.buildUrlWithQuery('/api/test', {
        param1: 'value1',
        param2: '',
        param3: 'value3'
      });
      expect(result).toBe('/api/test?param1=value1&param2=&param3=value3');
    });
  });

  describe('BigInt serialization', () => {
    it('should serialize BigInt values in POST data', async () => {
      const mockResponse = { data: { success: true } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const postData = {
        amount: 1000000n,
        normalValue: 'test',
        nested: {
          bigIntValue: 2000000n,
          stringValue: 'nested'
        }
      };

      await httpClient.post('/test-endpoint', postData);

      // Verify the post method was called
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test-endpoint', postData, undefined);
    });
  });

  describe('Error transformation', () => {
    it('should handle request errors', async () => {
      const error = new Error('Request failed');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(httpClient.get('/test-endpoint')).rejects.toThrow('Request failed');
    });

    it('should handle POST request errors', async () => {
      const error = new Error('POST failed');
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(httpClient.post('/test-endpoint', {})).rejects.toThrow('POST failed');
    });
  });

  describe('API key authentication', () => {
    it('should include API key in Authorization header', () => {
      const createCall = mockedAxios.create.mock.calls[0]?.[0];
      expect((createCall?.headers as any)?.['Authorization']).toBe('Bearer sk_test_api_key_123');
    });

    it('should work with different API key formats', () => {
      jest.clearAllMocks();
      
      new HttpClient(
        'https://api.example.com',
        'sk_live_another_key_456',
        30000
      );

      const createCall = mockedAxios.create.mock.calls[0]?.[0];
      expect((createCall?.headers as any)?.['Authorization']).toBe('Bearer sk_live_another_key_456');
    });

    it('should update API key after initialization', () => {
      const newApiKey = 'sk_new_key_789';
      
      httpClient.setApiKey(newApiKey);

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(`Bearer ${newApiKey}`);
    });
  });
});