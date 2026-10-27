import React from 'react';
import { Volume2, VolumeX, Calendar, ArrowLeft, Plus } from 'lucide-react';

export default function Navbar({ 
  currentView, 
  onNavigateHome, 
  soundEnabled, 
  onToggleSound, 
  selectedClass, 
  selectedDate,
  onOpenAddClass
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Brand and Navigation */}
        <div className="flex items-center space-x-3">
          {currentView !== 'select-class' && (
            <button
              onClick={onNavigateHome}
              title="Back to Class Selection"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Classes</span>
            </button>
          )}

          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 font-bold text-lg">
              📋
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                <span>RollCall</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                  Live
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                {selectedClass ? `${selectedClass.name} • ${selectedDate}` : 'One-Tap Attendance'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {currentView === 'select-class' && (
            <button
              onClick={onOpenAddClass}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Class</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? "Mute Sound Effects" : "Enable Sound Effects"}
            className={`p-2 rounded-lg border text-sm transition-colors ${
              soundEnabled 
                ? 'bg-slate-100 text-indigo-600 border-slate-200 hover:bg-slate-200' 
                : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

      </div>
    </header>
  );
}
