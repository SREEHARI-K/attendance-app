import React, { useState } from 'react';
import { Calendar, Trash2, Eye, Download, Users, ArrowLeft, History } from 'lucide-react';
import { getClassAttendanceRecords, deleteAttendanceForDate, exportAttendanceToCSV } from '../utils/storage';

export default function AttendanceHistory({
  selectedClass,
  onBack,
  onViewRecord
}) {
  const [recordsMap, setRecordsMap] = useState(() => getClassAttendanceRecords(selectedClass.id));

  // Sort dates descending (newest first)
  const dates = Object.keys(recordsMap).sort((a, b) => new Date(b) - new Date(a));

  const handleDelete = (dateString) => {
    if (window.confirm(`Are you sure you want to delete attendance record for ${dateString}?`)) {
      deleteAttendanceForDate(selectedClass.id, dateString);
      setRecordsMap(getClassAttendanceRecords(selectedClass.id));
    }
  };

  const handleExport = (dateString, session) => {
    exportAttendanceToCSV(selectedClass, dateString, session);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Classes</span>
          </button>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>Attendance History</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {selectedClass.name} • {selectedClass.students?.length || 0} Students
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sessions</div>
          <div className="text-2xl font-black text-indigo-600">{dates.length}</div>
        </div>
      </div>

      {/* History List */}
      {dates.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-700 text-lg">No Attendance Records Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Take attendance for this class to start logging historical attendance data.
          </p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
          >
            Return to Classes
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {dates.map((dateStr) => {
            const session = recordsMap[dateStr];
            const summary = session.summary || {};
            const present = summary.present || 0;
            const absent = summary.absent || 0;
            const total = summary.total || selectedClass.students?.length || 0;
            const percentage = summary.percentage || (total > 0 ? Math.round((present / total) * 100) : 0);

            return (
              <div
                key={dateStr}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-700 shrink-0">
                    <span className="text-[10px] font-bold uppercase">
                      {new Date(dateStr).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-base font-black leading-none">
                      {new Date(dateStr).getDate()}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      {new Date(dateStr).toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h4>
                    <div className="flex items-center gap-3 text-xs mt-1">
                      <span className="text-emerald-700 font-semibold">🟢 {present} Present</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-rose-700 font-semibold">🔴 {absent} Absent</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-medium">{percentage}% Turnout</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onViewRecord(dateStr, session)}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-slate-200"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">View</span>
                  </button>

                  <button
                    onClick={() => handleExport(dateStr, session)}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-slate-200"
                    title="Export CSV"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>

                  <button
                    onClick={() => handleDelete(dateStr)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-slate-200"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
