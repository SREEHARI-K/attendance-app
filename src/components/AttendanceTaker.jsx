import React, { useState, useEffect, useCallback } from 'react';
import { 
  Check, 
  X, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  CheckCheck, 
  User, 
  HelpCircle,
  Hash
} from 'lucide-react';
import { playPresentSound, playAbsentSound, playCompletionSound } from '../utils/sound';

export default function AttendanceTaker({
  selectedClass,
  selectedDate,
  initialRecords = {},
  onFinishAttendance,
  onCancel,
  soundEnabled
}) {
  const students = selectedClass.students || [];
  const totalStudents = students.length;

  // Find first unmarked student index or 0
  const findFirstUnmarkedIndex = () => {
    for (let i = 0; i < totalStudents; i++) {
      if (!initialRecords[students[i].rollNo]) {
        return i;
      }
    }
    return 0;
  };

  const [currentIndex, setCurrentIndex] = useState(findFirstUnmarkedIndex);
  const [records, setRecords] = useState({ ...initialRecords });
  const [lastAction, setLastAction] = useState(null); // 'present' | 'absent' for animation

  const currentStudent = students[currentIndex] || { rollNo: currentIndex + 1, name: `Student ${currentIndex + 1}` };
  const currentStatus = records[currentStudent.rollNo];

  // Count stats so far
  const presentCount = Object.values(records).filter(status => status === 'present').length;
  const absentCount = Object.values(records).filter(status => status === 'absent').length;
  const markedCount = presentCount + absentCount;
  const progressPercent = totalStudents > 0 ? Math.round((markedCount / totalStudents) * 100) : 0;

  // Gender specific counts
  const boys = students.filter(s => (s.gender || 'Male').toLowerCase() === 'male');
  const girls = students.filter(s => (s.gender || '').toLowerCase() === 'female');
  const presentBoys = boys.filter(s => records[s.rollNo] === 'present').length;
  const presentGirls = girls.filter(s => records[s.rollNo] === 'present').length;
  const isCurrentMale = (currentStudent.gender || 'Male').toLowerCase() === 'male';

  // Handle Mark action
  const handleMark = useCallback((status) => {
    if (!currentStudent) return;

    if (soundEnabled) {
      if (status === 'present') {
        playPresentSound();
      } else {
        playAbsentSound();
      }
    }

    setLastAction(status);
    setTimeout(() => setLastAction(null), 300);

    const updatedRecords = {
      ...records,
      [currentStudent.rollNo]: status
    };
    setRecords(updatedRecords);

    // If this was the last student, trigger completion
    if (currentIndex >= totalStudents - 1) {
      if (soundEnabled) playCompletionSound();
      onFinishAttendance(updatedRecords);
    } else {
      // Advance to next student
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentStudent, records, currentIndex, totalStudents, soundEnabled, onFinishAttendance]);

  // Go to Previous student
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Go to Next student (without marking)
  const handleNext = useCallback(() => {
    if (currentIndex < totalStudents - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, totalStudents]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid hotkeys if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      if (e.key === 'p' || e.key === 'P' || e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleMark('present');
      } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleMark('absent');
      } else if (e.key === 'Backspace' || e.key === 'b' || e.key === 'B' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMark, handlePrevious, handleNext]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                {selectedClass.name}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500">
                {selectedDate}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-1">
              Taking Roll Call
            </h2>
          </div>

          <button
            onClick={() => onFinishAttendance(records)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Finish & Review</span>
          </button>
        </div>

        {/* Progress Bar & Live Stats */}
        <div className="mt-5 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold text-slate-600 gap-1">
            <span>Progress: {markedCount} of {totalStudents} marked ({progressPercent}%)</span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-600 font-bold">🟢 {presentCount} Present</span>
              <span className="text-rose-600 font-bold">🔴 {absentCount} Absent</span>
            </div>
          </div>
          
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
            <div
              className="bg-indigo-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Gender breakdown ticker */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-0.5">
            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-semibold">
              👦 Boys: {presentBoys}/{boys.length} Present
            </span>
            <span className="inline-flex items-center gap-1 text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md font-semibold">
              👧 Girls: {presentGirls}/{girls.length} Present
            </span>
          </div>
        </div>
      </div>

      {/* Main Flashcard: Single Roll Number Presentation */}
      <div 
        className={`bg-white rounded-3xl p-8 sm:p-12 shadow-md border-2 transition-all duration-200 text-center relative overflow-hidden ${
          lastAction === 'present' 
            ? 'border-emerald-500 bg-emerald-50/20 scale-[1.01]' 
            : lastAction === 'absent' 
            ? 'border-rose-500 bg-rose-50/20 scale-[1.01]' 
            : 'border-slate-200'
        }`}
      >
        {/* Subtle background roll number watermark */}
        <div className="absolute right-4 bottom-2 text-8xl font-black text-slate-100/70 select-none pointer-events-none">
          #{currentStudent.rollNo}
        </div>

        {/* Student Position Counter */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold mb-4">
          <Hash className="w-3.5 h-3.5 text-slate-400" />
          <span>Student {currentIndex + 1} of {totalStudents}</span>
        </div>

        {/* Big Bold Roll Number */}
        <div className="space-y-2 mb-6">
          <span className="text-xs uppercase tracking-widest font-extrabold text-slate-400 block">
            Roll Number
          </span>
          <div className="text-6xl sm:text-7xl font-black tracking-tight text-slate-900 font-mono">
            {currentStudent.rollNo}
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-800">
              {currentStudent.name || `Student ${currentStudent.rollNo}`}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              isCurrentMale 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-pink-50 text-pink-700 border-pink-200'
            }`}>
              {isCurrentMale ? '👦 Boy' : '👧 Girl'}
            </span>
          </div>
        </div>

        {/* Current status if previously marked */}
        <div className="h-8 flex items-center justify-center">
          {currentStatus ? (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              currentStatus === 'present' 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              {currentStatus === 'present' ? '✓ Currently marked Present' : '✕ Currently marked Absent'}
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-medium italic">
              Awaiting mark...
            </span>
          )}
        </div>

        {/* THE TWO BIG BUTTONS: GREEN FOR PRESENT, RED FOR ABSENT */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-8">
          
          {/* ABSENT (RED BUTTON) */}
          <button
            onClick={() => handleMark('absent')}
            className="group relative flex flex-col items-center justify-center p-6 sm:p-8 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-rose-300"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <X className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[3]" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-wide">
              ABSENT
            </span>
            <span className="text-[11px] font-semibold text-rose-200 mt-1 uppercase tracking-wider">
              Press [A] or [←]
            </span>
          </button>

          {/* PRESENT (GREEN BUTTON) */}
          <button
            onClick={() => handleMark('present')}
            className="group relative flex flex-col items-center justify-center p-6 sm:p-8 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[3]" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-wide">
              PRESENT
            </span>
            <span className="text-[11px] font-semibold text-emerald-200 mt-1 uppercase tracking-wider">
              Press [P] or [→]
            </span>
          </button>

        </div>

        {/* Step Navigation Controls (Previous, Jump, Next) */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`inline-flex items-center gap-1 font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              currentIndex === 0 
                ? 'opacity-40 cursor-not-allowed text-slate-400' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Student</span>
          </button>

          {/* Jump to student dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Jump:</span>
            <select
              value={currentIndex}
              onChange={(e) => setCurrentIndex(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            >
              {students.map((std, idx) => (
                <option key={std.rollNo} value={idx}>
                  Roll #{std.rollNo} {records[std.rollNo] ? `(${records[std.rollNo] === 'present' ? 'P' : 'A'})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === totalStudents - 1}
            className={`inline-flex items-center gap-1 font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              currentIndex === totalStudents - 1 
                ? 'opacity-40 cursor-not-allowed text-slate-400' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>Skip / Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Helpful Keyboard Shortcuts Card */}
      <div className="bg-slate-100/80 rounded-xl p-3.5 text-xs text-slate-600 flex flex-wrap items-center justify-center gap-4 text-center border border-slate-200/60">
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-800 font-mono font-bold shadow-xs">P</kbd>
          <span>or</span>
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-800 font-mono font-bold shadow-xs">→</kbd>
          <span className="text-emerald-700 font-semibold">Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-800 font-mono font-bold shadow-xs">A</kbd>
          <span>or</span>
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-800 font-mono font-bold shadow-xs">←</kbd>
          <span className="text-rose-700 font-semibold">Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-800 font-mono font-bold shadow-xs">Backspace</kbd>
          <span>Undo / Back</span>
        </div>
      </div>

    </div>
  );
}
