import { useState, useCallback } from 'react';
import type { AppData, Student, SessionEntry, TrainingDay } from '../types';
import { loadData, saveData } from '../lib/storage';
import { pushToGitHub } from '../lib/github';

export function useData() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string>('');

  const persist = useCallback(async (next: AppData) => {
    setSaving(true);
    setSaveError('');
    try {
      saveData(next);
      const { githubToken, githubOwner, githubRepo } = next.settings;
      if (githubToken && githubOwner && githubRepo) {
        await pushToGitHub(githubToken, githubOwner, githubRepo, next);
        next = { ...next, settings: { ...next.settings, lastSync: new Date().toISOString() } };
        saveData(next);
      }
      setLastSaved(new Date());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      setSaveError(msg);
      // still keep local save
      setLastSaved(new Date());
    } finally {
      setSaving(false);
    }
    return next;
  }, []);

  const updateStudent = useCallback(async (updated: Student) => {
    const next: AppData = {
      ...data,
      students: data.students.map(s => s.id === updated.id ? updated : s),
    };
    setData(next);
    await persist(next);
  }, [data, persist]);

  const addStudent = useCallback(async (student: Student) => {
    const next: AppData = { ...data, students: [...data.students, student] };
    setData(next);
    await persist(next);
  }, [data, persist]);

  const upsertTrainingDay = useCallback(async (day: TrainingDay) => {
    const next: AppData = {
      ...data,
      trainingDays: { ...data.trainingDays, [day.date]: day },
    };
    setData(next);
    await persist(next);
  }, [data, persist]);

  const updateSession = useCallback(async (date: string, session: SessionEntry) => {
    const existing = data.trainingDays[date] ?? { date, sessions: [] };
    const sessions = existing.sessions.filter(s => s.studentId !== session.studentId);
    const day: TrainingDay = { ...existing, sessions: [...sessions, session] };
    await upsertTrainingDay(day);
  }, [data, upsertTrainingDay]);

  const updateSettings = useCallback(async (settings: AppData['settings']) => {
    const next: AppData = { ...data, settings };
    setData(next);
    await persist(next);
  }, [data, persist]);

  const replaceAll = useCallback(async (incoming: AppData) => {
    setData(incoming);
    await persist(incoming);
  }, [persist]);

  return {
    data,
    saving,
    lastSaved,
    saveError,
    updateStudent,
    addStudent,
    upsertTrainingDay,
    updateSession,
    updateSettings,
    replaceAll,
    persist,
    setData,
  };
}
