import type { AppData, AppSettings } from '../types';
import { INITIAL_STUDENTS } from '../data/initial';

const STORAGE_KEY = 'peloton-bdfit-v2';

const DEFAULT_SETTINGS: AppSettings = {
  pin: '1234',
  githubToken: '',
  githubRepo: 'peloton-bdfit',
  githubOwner: 'dialdise',
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      // Merge new students if initial data has more
      if (parsed.students.length < INITIAL_STUDENTS.length) {
        const existingIds = new Set(parsed.students.map(s => s.id));
        const newStudents = INITIAL_STUDENTS.filter(s => !existingIds.has(s.id));
        parsed.students = [...parsed.students, ...newStudents];
      }
      return parsed;
    }
  } catch {
    // corrupted data, reset
  }
  return {
    students: INITIAL_STUDENTS,
    trainingDays: {},
    settings: DEFAULT_SETTINGS,
    version: 1,
  };
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportJSON(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `peloton-bdfit-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as AppData;
        resolve(data);
      } catch {
        reject(new Error('Archivo inválido'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
}
