import axios from 'axios';
import { supabase } from '../auth/supabaseClient';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Propagation automatique du JWT Supabase vers le backend,
// pour que les policies RLS puissent s'appliquer côté Flask.
api.interceptors.request.use(async (config) => {
  try {
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (accessToken) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
    }
  } catch {
    // En cas d'échec d'obtention du token, on conserve le comportement existant.
  }
  return config;
});

export const getRevenus = async () => {
  const response = await api.get('/revenus');
  return response.data;
};

export const getResidents = async () => {
  const response = await api.get('/residents');
  return response.data;
};

export const createResident = async (data: any) => {
  const response = await api.post('/residents', data);
  return response.data;
};

export const deleteResident = async (id: string) => {
  const response = await api.delete(`/residents/${id}`);
  return response.data;
};

export const getExpenses = async () => {
  const response = await api.get('/expenses');
  return response.data;
};

export const createExpense = async (data: any) => {
  const response = await api.post('/expenses', data);
  return response.data;
};

export const deleteExpense = async (id: string) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

export const getExtraRevenues = async () => {
  const response = await api.get('/extra_revenues');
  return response.data;
};

export const createExtraRevenue = async (data: any) => {
  const response = await api.post('/extra_revenues', data);
  return response.data;
};

export const deleteExtraRevenue = async (id: string) => {
  const response = await api.delete(`/extra_revenues/${id}`);
  return response.data;
};

export const getBilanStats = async () => {
  const response = await api.get('/bilan/stats');
  return response.data;
};

export const getRepairs = async () => {
  const response = await api.get('/repairs');
  return response.data;
};

export const createRepair = async (data: any) => {
  const response = await api.post('/repairs', data);
  return response.data;
};

export const getRepairContributions = async (id: string) => {
  const response = await api.get(`/repairs/${id}/contributions`);
  return response.data;
};

export const payRepairContribution = async (id: string) => {
  const response = await api.post(`/repairs/contributions/${id}/pay`);
  return response.data;
};

export const getMaintenance = async () => {
    const response = await api.get('/maintenance');
    return response.data;
};

export const createMaintenance = async (data: any) => {
    const response = await api.post('/maintenance', data);
    return response.data;
};

export const updateMaintenanceStatus = async (id: string, status: string) => {
    const response = await api.patch(`/maintenance/${id}/status`, { status });
    return response.data;
};

export const getPolls = async () => {
    const response = await api.get('/polls');
    return response.data;
};

export const createPoll = async (data: any) => {
    const response = await api.post('/polls', data);
    return response.data;
};

export const castVote = async (pollId: string, optionId: string, residentId: string) => {
    const response = await api.post(`/polls/${pollId}/vote`, { option_id: optionId, resident_id: residentId });
    return response.data;
};

export default api;
