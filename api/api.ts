import { Platform } from 'react-native';
import axios from 'axios';

const BASE_URL = Platform.select({
 
  android: 'http://172.16.11.36:3000', 
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});