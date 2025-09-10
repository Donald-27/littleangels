import { useAuth as useSupabaseAuth } from '../contexts/AuthContext';

export const useAuth = () => {
  return useSupabaseAuth();
};