import React, { createContext, useContext, useState, useCallback } from 'react';
import { classAPI } from '../services/api';

const ScheduleContext = createContext(null);

export const ScheduleProvider = ({ children }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await classAPI.getAll();
      setClasses(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, []);

  const addClass = useCallback(async (data) => {
    const res = await classAPI.create(data);
    setClasses((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateClass = useCallback(async (id, data) => {
    const res = await classAPI.update(id, data);
    setClasses((prev) => prev.map((c) => (c._id === id ? res.data : c)));
    return res.data;
  }, []);

  const deleteClass = useCallback(async (id) => {
    await classAPI.remove(id);
    setClasses((prev) => prev.filter((c) => c._id !== id));
  }, []);

  const getTodayClasses = useCallback(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return classes.filter((c) => c.day === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [classes]);

  return (
    <ScheduleContext.Provider value={{ classes, loading, error, fetchClasses, addClass, updateClass, deleteClass, getTodayClasses }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
};
