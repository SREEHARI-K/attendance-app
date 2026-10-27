import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Download, 
  Check, 
  RotateCcw, 
  ArrowLeft, 
  Save, 
  Users, 
  Calendar,
  Share2,
  TrendingUp,
  UserCheck,
  UserX
} from 'lucide-react';
import { exportAttendanceToCSV } from '../utils/storage';

export default function AttendanceSummary({
  selectedClass,
  selectedDate,
  records,
  onUpdateRecords,
  onSaveAndExit,
  onRetake,
  onResumeTaking
}) {
  const [copied, setCopied] = useState(false);
  const students = selectedClass.students || [];

  const presentStudents = students.filter(s => records[s.rollNo] === 'present');
  const absentStudents = students.filter(s => records[s.rollNo] === 'absent');
  const unmarkedStudents = students.filter(s => !records[s.rollNo]);

  const total = students.length;
  const presentCount = presentStudents.length;
  const absentCount = absentStudents.length;
  const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  // Gender-wise statistics
  const maleStudents = students.filter(s => (s.gender || 'Male').toLowerCase() === 'male');
  const femaleStudents = students.filter(s => (s.gender || '').toLowerCase() === 'female');

  const malePresent = maleStudents.filter(s => records[s.rollNo] === 'present');
  const maleAbsent = maleStudents.filter(s => records[s.rollNo] === 'absent');
  const malePercentage = maleStudents.length > 0 
    ? Math.round((malePresent.length / maleStudents.length) * 100) 
    : 0;

  const femalePresent = femaleStudents.filter(s => records[s.rollNo] === 'present');
  const femaleAbsent = femaleStudents.filter(s => records[s.rollNo] === 'absent');
  const femalePercentage = femaleStudents.length > 0 
    ? Math.round((femalePresent.length / femaleStudents.length) * 100) 
    : 0;

  // Toggle status for a specific student in the review grid
  const toggleStudentStatus = (rollNo) => {
    const currentStatus = records[rollNo];
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    onUpdateRecords({
      ...records,
      [rollNo]: newStatus
    });
  };

  // Copy Absentee & Gender breakdown notice for WhatsApp / SMS / Email
  const handleCopyNotice = () => {
    const absentRollList = absentStudents.length > 0 
      ? absentStudents.map(s => {
          const isM = (s.gender || 'Male').toLowerCase() === 'male';
          return `#${s.rollNo} ${s.name || `Student ${s.rollNo}`} (${isM ? 'Boy' : 'Girl'})`;
        }).join('\n   • ')
      : 'None (100% Attendance! 🌟)';

    const text = `📋 *ATTENDANCE REPORT*\n` +
      `🏫 *Class:* ${selectedClass.name}${selectedClass.subject ? ` (${selectedClass.subject})` : ''}\n` +
      `📅 *Date:* ${selectedDate}\n` +
      `👥 *Total Strength:* ${total} (${maleStudents.length} Boys, ${femaleStudents.length} Girls)\n` +
      `✅ *Overall Present:* ${presentCount}/${total} (${percentage}%)\n\n` +
      `📊 *GENDER-WISE BREAKDOWN:*\n` +
      `   • 👦 *Boys:* ${malePresent.length}/${maleStudents.length} Present (${malePercentage}%) | ${maleAbsent.length} Absent\n` +
      `   • 👧 *Girls:* ${femalePresent.length}/${femaleStudents.length} Present (${femalePercentage}%) | ${femaleAbsent.length} Absent\n\n` +
      `❌ *Absentees (${absentCount}):*\n` +
      (absentStudents.length > 0 ? `   • ${absentRollList}\n` : `   ${absentRollList}\n`);

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCSV = () => {
    const session = {
      date: selectedDate,
      records: records,
      summary: { total, present: presentCount, absent: absentCount, percentage }
    };
    exportAttendanceToCSV(selectedClass, selectedDate, session);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              {selectedClass.name}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {selectedDate}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Attendance Summary & Gender Analytics
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onResumeTaking}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <span>Resume Roll Call</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onSaveAndExit}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save & Done</span>
          </button>
        </div>
      </div>

      {/* Overall Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Strength</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{total}</div>
          <div className="text-xs text-slate-500 mt-0.5">Enrolled students</div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Present</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{presentCount}</div>
          <div className="text-xs font-semibold text-emerald-600 mt-0.5">{percentage}% Overall Turnout</div>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-xs">
          <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">Total Absent</div>
          <div className="text-2xl font-black text-rose-800 mt-1">{absentCount}</div>
          <div className="text-xs font-semibold text-rose-600 mt-0.5">{100 - percentage}% Absenteeism</div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ratio (B : G)</div>
          <div className="text-2xl font-black text-slate-800 mt-1">
            {maleStudents.length} : {femaleStudents.length}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Boys to Girls</div>
        </div>
      </div>

      {/* GENDER-WISE ATTENDANCE BREAKDOWN CARDS (REQUESTED FEATURE) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Gender-wise Attendance Data</h3>
              <p className="text-xs text-slate-500">Separated metrics for Boys and Girls</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          
          {/* BOYS (MALE) CARD */}
          <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/30 rounded-2xl p-5 border border-blue-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-xs">
                  👦
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Boys (Male)</h4>
                  <span className="text-xs text-slate-500">{maleStudents.length} Enrolled</span>
                </div>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {malePercentage}% Present
              </span>
            </div>

            {/* Boys Progress bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-blue-100/70 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${malePercentage}%` }}
                />
              </div>
            </div>

            {/* Boys detailed counters */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200/60 text-center">
              <div className="bg-white/80 p-2 rounded-xl border border-blue-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total</span>
                <span className="text-lg font-black text-slate-800">{maleStudents.length}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-blue-100">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">Present</span>
                <span className="text-lg font-black text-emerald-700">{malePresent.length}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-blue-100">
                <span className="text-[10px] font-bold text-rose-600 uppercase block">Absent</span>
                <span className="text-lg font-black text-rose-700">{maleAbsent.length}</span>
              </div>
            </div>
          </div>

          {/* GIRLS (FEMALE) CARD */}
          <div className="bg-gradient-to-br from-pink-50/60 to-rose-50/30 rounded-2xl p-5 border border-pink-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center text-lg font-bold shadow-xs">
                  👧
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Girls (Female)</h4>
                  <span className="text-xs text-slate-500">{femaleStudents.length} Enrolled</span>
                </div>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
                {femalePercentage}% Present
              </span>
            </div>

            {/* Girls Progress bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-pink-100/70 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-pink-600 h-full transition-all duration-300"
                  style={{ width: `${femalePercentage}%` }}
                />
              </div>
            </div>

            {/* Girls detailed counters */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-pink-200/60 text-center">
              <div className="bg-white/80 p-2 rounded-xl border border-pink-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total</span>
                <span className="text-lg font-black text-slate-800">{femaleStudents.length}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-pink-100">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">Present</span>
                <span className="text-lg font-black text-emerald-700">{femalePresent.length}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-pink-100">
                <span className="text-[10px] font-bold text-rose-600 uppercase block">Absent</span>
                <span className="text-lg font-black text-rose-700">{femaleAbsent.length}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Absentee Notice Box with Gender Labels */}
      <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Absentees List ({absentCount})
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Includes student names and gender tags. Ready to copy for WhatsApp/faculty notices.
            </p>
          </div>

          <button
            onClick={handleCopyNotice}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              copied 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 shadow-xs'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-slate-600" />}
            <span>{copied ? 'Copied Full Report!' : 'Copy Notice (with Gender)'}</span>
          </button>
        </div>

        {/* Badges of Absent Roll Numbers */}
        <div className="mt-4 flex flex-wrap gap-2">
          {absentStudents.length > 0 ? (
            absentStudents.map(s => {
              const isM = (s.gender || 'Male').toLowerCase() === 'male';
              return (
                <span 
                  key={s.rollNo}
                  className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-xs font-bold text-rose-700 shadow-2xs flex items-center gap-1.5"
                >
                  <span className="text-slate-400 font-mono">#{s.rollNo}</span>
                  <span className="text-slate-800">{s.name || `Student ${s.rollNo}`}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    isM ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                  }`}>
                    {isM ? 'Boy' : 'Girl'}
                  </span>
                </span>
              );
            })
          ) : (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-3 py-1.5 rounded-lg">
              🎉 100% Attendance! No students are absent.
            </span>
          )}
        </div>
      </div>

      {/* Interactive Class Roster Grid */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Class Roster</h3>
            <p className="text-xs text-slate-500">
              Click any student card to toggle between Present & Absent.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Green = Present
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Red = Absent
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {students.map((student) => {
            const status = records[student.rollNo];
            const isPresent = status === 'present';
            const isAbsent = status === 'absent';
            const isM = (student.gender || 'Male').toLowerCase() === 'male';

            return (
              <button
                key={student.rollNo}
                onClick={() => toggleStudentStatus(student.rollNo)}
                className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between group hover:scale-[1.02] ${
                  isPresent 
                    ? 'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100' 
                    : isAbsent 
                    ? 'bg-rose-50/70 border-rose-300 hover:bg-rose-100' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono font-black text-sm text-slate-800">
                    #{student.rollNo}
                  </span>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    isPresent 
                      ? 'bg-emerald-600 text-white' 
                      : isAbsent 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-slate-300 text-slate-700'
                  }`}>
                    {isPresent ? 'P' : isAbsent ? 'A' : '?'}
                  </span>
                </div>

                <div className="mt-2">
                  <div className="text-xs font-bold text-slate-800 truncate" title={student.name}>
                    {student.name || `Student ${student.rollNo}`}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[10px] font-semibold px-1 rounded ${
                      isM ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                    }`}>
                      {isM ? '👦 Boy' : '👧 Girl'}
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-600">
                      Tap to flip
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Button Bar */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onRetake}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake from beginning</span>
        </button>

        <button
          onClick={onSaveAndExit}
          className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 inline-flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save & Return to Classes</span>
        </button>
      </div>

    </div>
  );
}
