import { useState, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import PinLock from './components/PinLock';
import Dashboard from './pages/Dashboard';
import Athletes from './pages/Athletes';
import AthleteDetail from './pages/AthleteDetail';
import CheckIn from './pages/CheckIn';
import Stats from './pages/Stats';
import SettingsPage from './pages/SettingsPage';
import { useData } from './hooks/useData';
import type { Student, SessionEntry } from './types';

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const { data, saving, saveError, updateStudent, addStudent, updateSession, updateSettings, replaceAll } = useData();

  const handleSaveStudent = useCallback(async (student: Student) => {
    const exists = data.students.find(s => s.id === student.id);
    if (exists) await updateStudent(student);
    else await addStudent(student);
  }, [data.students, updateStudent, addStudent]);

  const handleSessionUpdate = useCallback(async (date: string, session: SessionEntry) => {
    await updateSession(date, session);
  }, [updateSession]);

  if (!unlocked) {
    return <PinLock correctPin={data.settings.pin} onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard data={data} />} />
        <Route path="/athletes" element={<Athletes data={data} />} />
        <Route path="/athletes/:id" element={
          <AthleteDetail data={data} onSave={handleSaveStudent} saving={saving} />
        } />
        <Route path="/checkin" element={
          <CheckIn data={data} onSessionUpdate={handleSessionUpdate} saving={saving} />
        } />
        <Route path="/stats" element={<Stats data={data} />} />
        <Route path="/settings" element={
          <SettingsPage
            data={data}
            onSettingsUpdate={updateSettings}
            onImport={replaceAll}
            saveError={saveError}
          />
        } />
      </Routes>
    </HashRouter>
  );
}
