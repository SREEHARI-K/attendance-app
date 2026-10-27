import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ClassSelector from './components/ClassSelector';
import AttendanceTaker from './components/AttendanceTaker';
import AttendanceSummary from './components/AttendanceSummary';
import AttendanceHistory from './components/AttendanceHistory';
import AddClassModal from './components/AddClassModal';
import { 
  getClasses, 
  upsertClass, 
  deleteClass, 
  getAttendanceForDate, 
  saveAttendanceSession 
} from './utils/storage';

export default function App() {
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [classes, setClasses] = useState(getClasses);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayString);
  const [currentView, setCurrentView] = useState('select-class'); // 'select-class' | 'take-attendance' | 'summary' | 'history'
  
  const [currentRecords, setCurrentRecords] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Switch to Taking Attendance for a class
  const handleSelectClassToTake = (cls) => {
    setSelectedClass(cls);
    // Check if there are already records for this date
    const existing = getAttendanceForDate(cls.id, selectedDate);
    if (existing && existing.records) {
      setCurrentRecords(existing.records);
    } else {
      setCurrentRecords({});
    }
    setCurrentView('take-attendance');
  };

  // View existing summary
  const handleSelectClassToViewSummary = (cls, record) => {
    setSelectedClass(cls);
    setCurrentRecords(record ? record.records : {});
    setCurrentView('summary');
  };

  // View class history
  const handleSelectClassHistory = (cls) => {
    setSelectedClass(cls);
    setCurrentView('history');
  };

  // When attendance one-by-one is finished or review clicked
  const handleFinishAttendance = (records) => {
    setCurrentRecords(records);
    
    // Auto-save to LocalStorage
    if (selectedClass) {
      const students = selectedClass.students || [];
      const presentCount = Object.values(records).filter(v => v === 'present').length;
      const absentCount = Object.values(records).filter(v => v === 'absent').length;
      const total = students.length;
      const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

      const session = {
        date: selectedDate,
        records: records,
        summary: {
          total,
          present: presentCount,
          absent: absentCount,
          percentage
        }
      };

      saveAttendanceSession(selectedClass.id, session);
      showToast("Attendance logged to Local Storage!");
    }

    setCurrentView('summary');
  };

  // Save & Return to classes
  const handleSaveAndExit = () => {
    if (selectedClass) {
      const students = selectedClass.students || [];
      const presentCount = Object.values(currentRecords).filter(v => v === 'present').length;
      const absentCount = Object.values(currentRecords).filter(v => v === 'absent').length;
      const total = students.length;
      const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

      const session = {
        date: selectedDate,
        records: currentRecords,
        summary: {
          total,
          present: presentCount,
          absent: absentCount,
          percentage
        }
      };

      saveAttendanceSession(selectedClass.id, session);
      showToast("Attendance saved successfully!");
    }
    setCurrentView('select-class');
  };

  // Retake attendance from beginning
  const handleRetake = () => {
    setCurrentRecords({});
    setCurrentView('take-attendance');
  };

  // Create or update class
  const handleSaveClass = (classData) => {
    const updated = upsertClass(classData);
    setClasses(updated);
    if (selectedClass && selectedClass.id === classData.id) {
      setSelectedClass(classData);
    }
    showToast(editingClass ? `Class "${classData.name}" updated!` : `Class "${classData.name}" created!`);
    setEditingClass(null);
  };

  // Delete class
  const handleDeleteClass = (classId) => {
    const updated = deleteClass(classId);
    setClasses(updated);
    showToast("Class deleted");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation bar */}
      <Navbar
        currentView={currentView}
        onNavigateHome={() => setCurrentView('select-class')}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        selectedClass={currentView !== 'select-class' ? selectedClass : null}
        selectedDate={selectedDate}
        onOpenAddClass={() => {
          setEditingClass(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'select-class' && (
          <ClassSelector
            classes={classes}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onSelectClassToTake={handleSelectClassToTake}
            onSelectClassToViewSummary={handleSelectClassToViewSummary}
            onSelectClassHistory={handleSelectClassHistory}
            onOpenAddClass={() => {
              setEditingClass(null);
              setIsAddModalOpen(true);
            }}
            onEditClass={(cls) => {
              setEditingClass(cls);
              setIsAddModalOpen(true);
            }}
            onDeleteClass={handleDeleteClass}
          />
        )}

        {currentView === 'take-attendance' && selectedClass && (
          <AttendanceTaker
            selectedClass={selectedClass}
            selectedDate={selectedDate}
            initialRecords={currentRecords}
            onFinishAttendance={handleFinishAttendance}
            onCancel={() => setCurrentView('select-class')}
            soundEnabled={soundEnabled}
          />
        )}

        {currentView === 'summary' && selectedClass && (
          <AttendanceSummary
            selectedClass={selectedClass}
            selectedDate={selectedDate}
            records={currentRecords}
            onUpdateRecords={setCurrentRecords}
            onSaveAndExit={handleSaveAndExit}
            onRetake={handleRetake}
            onResumeTaking={() => setCurrentView('take-attendance')}
          />
        )}

        {currentView === 'history' && selectedClass && (
          <AttendanceHistory
            selectedClass={selectedClass}
            onBack={() => setCurrentView('select-class')}
            onViewRecord={(dateStr, session) => {
              setSelectedDate(dateStr);
              setCurrentRecords(session.records || {});
              setCurrentView('summary');
            }}
          />
        )}
      </main>

      {/* Add / Edit Class Modal */}
      <AddClassModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingClass(null);
        }}
        onSaveClass={handleSaveClass}
        editingClass={editingClass}
      />

      {/* Minimal Footer */}
      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200/60">
        RollCall Attendance App • LocalStorage Enabled • Fast Keyboard Navigation
      </footer>
    </div>
  );
}
