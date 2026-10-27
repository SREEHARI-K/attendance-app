import React, { useState } from 'react';
import { Users, Calendar, CheckCircle2, Clock, Plus, Play, History, Trash2, BookOpen, Pencil } from 'lucide-react';
import { getClassAttendanceRecords } from '../utils/storage';

export default function ClassSelector({
  classes,
  selectedDate,
  onDateChange,
  onSelectClassToTake,
  onSelectClassToViewSummary,
  onSelectClassHistory,
  onOpenAddClass,
  onEditClass,
  onDeleteClass
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.subject && c.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner & Date Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Take Attendance 🎓
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Choose a class below to start calling roll numbers one by one.
          </p>
        </div>

        {/* Date Selector widget */}
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <Calendar className="w-5 h-5 text-indigo-600 ml-2" />
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Attendance Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
          {selectedDate !== getTodayString() && (
            <button
              onClick={() => onDateChange(getTodayString())}
              className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2.5 py-1 rounded-md font-medium transition-colors"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Search and Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Your Classes ({classes.length})</h3>
          <p className="text-xs text-slate-500">Select a class to take or review attendance for {selectedDate}</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search class or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400"
          />
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClasses.map((cls) => {
          const records = getClassAttendanceRecords(cls.id);
          const dateRecord = records[selectedDate];
          const hasRecord = !!dateRecord;
          const studentCount = cls.students?.length || 0;
          const minRoll = cls.students?.[0]?.rollNo || 1;
          const maxRoll = cls.students?.[studentCount - 1]?.rollNo || studentCount;
          const boysCount = (cls.students || []).filter(s => (s.gender || 'Male').toLowerCase() === 'male').length;
          const girlsCount = (cls.students || []).filter(s => (s.gender || '').toLowerCase() === 'female').length;

          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-4">
                {/* Header row: Class name & Edit / Delete icons */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                      {cls.name}
                    </h4>
                    {cls.subject && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 mt-0.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        {cls.subject}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClass(cls);
                      }}
                      title="Edit Class and Student Names"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete class "${cls.name}" and its attendance data?`)) {
                          onDeleteClass(cls.id);
                        }
                      }}
                      title="Delete Class"
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Class Stats, Gender Breakdown & Roll number range */}
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1 font-semibold text-slate-800">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <span>{studentCount} Students</span>
                    </div>
                    <div className="font-mono text-slate-500 text-[11px]">
                      Roll #{minRoll}–#{maxRoll}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold pt-1 border-t border-slate-200/50">
                    <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      👦 {boysCount} Boys
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded">
                      👧 {girlsCount} Girls
                    </span>
                  </div>
                </div>

                {/* Status for Selected Date */}
                <div className="pt-1">
                  {hasRecord ? (
                    <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200/60">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Completed</span>
                      </div>
                      <span className="font-bold">
                        {dateRecord.summary?.present}/{studentCount} ({dateRecord.summary?.percentage}%)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Not taken yet for {selectedDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectClassHistory(cls)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded hover:bg-slate-200/60"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History</span>
                </button>

                {hasRecord ? (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onSelectClassToViewSummary(cls, dateRecord)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-all"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onSelectClassToTake(cls)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all inline-flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Retake</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectClassToTake(cls)}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all inline-flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Attendance</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Create New Class Card */}
        <button
          onClick={onOpenAddClass}
          className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 transition-all duration-200 group min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">
              Add New Class
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Set roll number range or paste student roster
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
