import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { getToken } from '@/shared/helper/auth-handler';
export const getHeaders = (hasHeaders: boolean): AxiosRequestConfig => hasHeaders ? { headers: { 'Authorization': `Bearer ${getToken()}` } } : { headers: {} };
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const urlAppender = (path: string): string => {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return API_URL + path;
};
export const request = {
  get: <T>(path: string, hasHeader = true): Promise<AxiosResponse<T>> => 
    axios.get<T>(urlAppender(path), getHeaders(hasHeader)),
  post: <T>(path: string, data: unknown, hasHeaders = true): Promise<AxiosResponse<T>> => 
    axios.post<T>(urlAppender(path), data, getHeaders(hasHeaders)),
  put: <T>(path: string, data: unknown, hasHeaders = true): Promise<AxiosResponse<T>> => 
    axios.put<T>(urlAppender(path), data, getHeaders(hasHeaders)),
  delete: <T>(path: string, data?: unknown, hasHeaders = true): Promise<AxiosResponse<T>> => 
    axios.delete<T>(urlAppender(path), { ...getHeaders(hasHeaders), data }),
};