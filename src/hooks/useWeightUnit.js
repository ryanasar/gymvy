import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/lib/auth';

const getStorageKey = (userId) => `@gymvy/weight_unit:${userId}`;

export const useWeightUnit = () => {
  const { user } = useAuth();
  const [weightUnit, setWeightUnitState] = useState('lbs');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    AsyncStorage.getItem(getStorageKey(user.id))
      .then((stored) => {
        if (stored === 'kg' || stored === 'lbs') {
          setWeightUnitState(stored);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const setWeightUnit = useCallback(async (unit) => {
    if (!user?.id) return;
    setWeightUnitState(unit);
    try {
      await AsyncStorage.setItem(getStorageKey(user.id), unit);
    } catch (e) {
      console.error('[useWeightUnit] Failed to save preference:', e);
    }
  }, [user?.id]);

  return { weightUnit, setWeightUnit, loading };
};
