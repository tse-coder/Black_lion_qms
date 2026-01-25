import { useState, useEffect } from 'react';
import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFetch = <T>(url: string, options: any = {}): UseFetchResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const response: AxiosResponse<T> = await api(url, options);
        setData(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchData();
    }
  }, [url]);

  const refetch = async (): Promise<void> => {
    try {
      setLoading(true);
      const response: AxiosResponse<T> = await api(url, options);
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

interface UsePostResult<T> {
  postData: (url: string, data: any, options?: any) => Promise<T>;
  loading: boolean;
  error: string | null;
}

export const usePost = <T = any>(): UsePostResult<T> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postData = async (url: string, data: any, options: any = {}): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      const response: AxiosResponse<T> = await api.post(url, data, options);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { postData, loading, error };
};

interface UsePutResult<T> {
  putData: (url: string, data: any, options?: any) => Promise<T>;
  loading: boolean;
  error: string | null;
}

export const usePut = <T = any>(): UsePutResult<T> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const putData = async (url: string, data: any, options: any = {}): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      const response: AxiosResponse<T> = await api.put(url, data, options);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { putData, loading, error };
};

interface UseDeleteResult<T> {
  deleteData: (url: string, options?: any) => Promise<T>;
  loading: boolean;
  error: string | null;
}

export const useDelete = <T = any>(): UseDeleteResult<T> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteData = async (url: string, options: any = {}): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      const response: AxiosResponse<T> = await api.delete(url, options);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteData, loading, error };
};

export default api;
