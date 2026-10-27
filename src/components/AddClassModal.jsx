import React, { useState, useEffect } from 'react';
import { X, Plus, Users, Trash2, UserPlus, ClipboardList, Check, Sparkles } from 'lucide-react';

export default function AddClassModal({ isOpen, onClose, onSaveClass, editingClass = null }) {
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [defaultBulkGender, setDefaultBulkGender] = useState('Male');
  const [batchCount, setBatchCount] = useState(10);

  // Initialize form when opening or editing
  useEffect(() => {
    if (editingClass) {
      setClassName(editingClass.name || '');
      setSubject(editingClass.subject || '');
      setStudents(editingClass.students ? JSON.parse(JSON.stringify(editingClass.students)) : []);
    } else {
      setClassName('');
      setSubject('');
      // Default initial 5 student slots ready to type
      setStudents([
        { rollNo: 1, name: '', gender: 'Male' },
        { rollNo: 2, name: '', gender: 'Female' },
        { rollNo: 3, name: '', gender: 'Male' },
        { rollNo: 4, name: '', gender: 'Female' },
        { rollNo: 5, name: '', gender: 'Male' }
      ]);
    }
    setBulkMode(false);
    setBulkText('');
  }, [editingClass, isOpen]);

  if (!isOpen) return null;

  // Add a single student row
  const handleAddStudentRow = () => {
    const nextRoll = students.length > 0 
      ? Math.max(...students.map(s => Number(s.rollNo) || 0)) + 1 
      : 1;
    setStudents([
      ...students,
      { rollNo: nextRoll, name: '', gender: 'Male' }
    ]);
  };

  // Add multiple empty rows at once
  const handleAddBatchRows = () => {
    const count = parseInt(batchCount, 10) || 5;
    let nextRoll = students.length > 0 
      ? Math.max(...students.map(s => Number(s.rollNo) || 0)) + 1 
      : 1;
    const newRows = [];
    for (let i = 0; i < count; i++) {
      newRows.push({
        rollNo: nextRoll + i,
        name: '',
        gender: i % 2 === 0 ? 'Male' : 'Female'
      });
    }
    setStudents([...students, ...newRows]);
  };

  // Update a student's field
  const handleUpdateStudent = (index, field, value) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  // Remove a student row
  const handleRemoveStudent = (index) => {
    const updated = students.filter((_, i) => i !== index);
    setStudents(updated);
  };

  // Parse bulk text
  const handleImportBulk = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    let startRoll = students.length > 0 ? Math.max(...students.map(s => Number(s.rollNo) || 0)) + 1 : 1;

    const imported = lines.map((line, idx) => {
      // Examples: "1, John Doe, Male" or "John Doe, Female" or "John Doe"
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      let roll = startRoll + idx;
      let name = '';
      let gender = defaultBulkGender;

      if (parts.length >= 3 && !isNaN(parseInt(parts[0], 10))) {
        roll = parseInt(parts[0], 10);
        name = parts[1];
        const g = parts[2].toLowerCase();
        gender = g.startsWith('f') || g === 'girl' ? 'Female' : 'Male';
      } else if (parts.length === 2) {
        if (!isNaN(parseInt(parts[0], 10))) {
          roll = parseInt(parts[0], 10);
          name = parts[1];
        } else {
          name = parts[0];
          const g = parts[1].toLowerCase();
          gender = g.startsWith('f') || g === 'girl' ? 'Female' : 'Male';
        }
      } else {
        name = parts[0];
      }

      return {
        rollNo: roll,
        name: name || `Student ${roll}`,
        gender: gender || 'Male'
      };
    });

    setStudents([...students.filter(s => s.name.trim() !== ''), ...imported]);
    setBulkMode(false);
    setBulkText('');
  };

  // Form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!className.trim()) {
      alert("Please enter a class name");
      return;
    }

    // Filter out rows where name is completely blank (unless user wants auto names)
    const validStudents = students.map((s, idx) => ({
      rollNo: Number(s.rollNo) || (idx + 1),
      name: s.name.trim() || `Student ${s.rollNo || idx + 1}`,
      gender: s.gender || 'Male'
    }));

    if (validStudents.length === 0) {
      alert("Please add at least one student");
      return;
    }

    const classData = {
      id: editingClass ? editingClass.id : `class-${Date.now()}`,
      name: className.trim(),
      subject: subject.trim(),
      students: validStudents
    };

    onSaveClass(classData);
    onClose();
  };

  const maleCount = students.filter(s => s.gender === 'Male').length;
  const femaleCount = students.filter(s => s.gender === 'Female').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8 relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {editingClass ? 'Edit Class & Student Roster' : 'Create Class & Add Students'}
              </h3>
              <p className="text-xs text-slate-500">
                Specify student names and assign gender (Boy / Girl)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-1 flex-1">
          
          {/* Class Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Class / Section Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Grade 10 - Section A"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject / Department (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Mathematics, Science"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Student Roster Section */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-800">Student Roster ({students.length})</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                  👦 {maleCount} Boys
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold">
                  👧 {femaleCount} Girls
                </span>
              </div>

              {/* Action toggles */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBulkMode(!bulkMode)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors inline-flex items-center gap-1"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>{bulkMode ? 'Close Bulk' : 'Bulk Paste'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddStudentRow}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Row</span>
                </button>
              </div>
            </div>

            {/* Bulk Paste Area (Collapsible) */}
            {bulkMode && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-indigo-200 space-y-3 animate-slideIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Paste student names (one per line):</span>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span>Default Gender:</span>
                    <select
                      value={defaultBulkGender}
                      onChange={(e) => setDefaultBulkGender(e.target.value)}
                      className="bg-white border rounded px-2 py-0.5 text-xs font-semibold"
                    >
                      <option value="Male">👦 Boy (Male)</option>
                      <option value="Female">👧 Girl (Female)</option>
                    </select>
                  </div>
                </div>
                <textarea
                  rows="4"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Paste here, e.g.:&#10;1, Aarav Sharma, Male&#10;2, Aditi Rao, Female&#10;or simply names:&#10;Rahul Kapoor&#10;Pooja Hegde"
                  className="w-full p-2.5 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkMode(false)}
                    className="text-xs px-3 py-1 text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportBulk}
                    className="text-xs font-bold px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Import Students
                  </button>
                </div>
              </div>
            )}

            {/* Students Table / Rows */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {students.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No students added yet. Click "+ Add Row" or "Bulk Paste" above.
                </div>
              ) : (
                students.map((student, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs group"
                  >
                    {/* Roll No input */}
                    <div className="w-16 shrink-0">
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-[10px] text-slate-400 font-mono">#</span>
                        <input
                          type="number"
                          min="1"
                          required
                          value={student.rollNo}
                          onChange={(e) => handleUpdateStudent(idx, 'rollNo', e.target.value)}
                          className="w-full pl-5 pr-1 py-1.5 text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          title="Roll Number"
                        />
                      </div>
                    </div>

                    {/* Student Name input */}
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={`Student ${student.rollNo} Name`}
                        value={student.name}
                        onChange={(e) => handleUpdateStudent(idx, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
                      />
                    </div>

                    {/* GENDER SELECTOR TOGGLE (Male / Female) */}
                    <div className="flex items-center shrink-0 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleUpdateStudent(idx, 'gender', 'Male')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                          student.gender === 'Male'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-blue-700'
                        }`}
                        title="Set Gender to Male / Boy"
                      >
                        <span>👦 Boy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStudent(idx, 'gender', 'Female')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                          student.gender === 'Female'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-pink-700'
                        }`}
                        title="Set Gender to Female / Girl"
                      >
                        <span>👧 Girl</span>
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(idx)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      title="Remove Student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick Batch Row Adder */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleAddStudentRow}
                className="font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add another student</span>
              </button>

              <div className="flex items-center gap-2">
                <span>Add</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={batchCount}
                  onChange={(e) => setBatchCount(e.target.value)}
                  className="w-12 px-1.5 py-0.5 text-center bg-slate-50 border rounded text-xs font-bold"
                />
                <span>more rows</span>
                <button
                  type="button"
                  onClick={handleAddBatchRows}
                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-semibold text-xs"
                >
                  Generate
                </button>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100 shrink-0">
            <span className="text-xs font-medium text-slate-500">
              Total: <b className="text-slate-800">{students.length}</b> students
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingClass ? 'Update Class' : 'Save Class'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
