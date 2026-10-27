import { sampleClasses } from './sampleData';

const CLASSES_STORAGE_KEY = 'rollcall_classes_v1';
const ATTENDANCE_STORAGE_PREFIX = 'rollcall_records_';

/**
 * Get all classes from LocalStorage or seed with samples if empty
 */
export function getClasses() {
  try {
    const raw = localStorage.getItem(CLASSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(sampleClasses));
      return sampleClasses;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : sampleClasses;
  } catch (err) {
    console.error("Failed to load classes from localStorage:", err);
    return sampleClasses;
  }
}

/**
 * Save classes list to LocalStorage
 */
export function saveClasses(classes) {
  try {
    localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
  } catch (err) {
    console.error("Failed to save classes to localStorage:", err);
  }
}

/**
 * Add or update a class
 */
export function upsertClass(newClass) {
  const classes = getClasses();
  const index = classes.findIndex(c => c.id === newClass.id);
  if (index >= 0) {
    classes[index] = newClass;
  } else {
    classes.push(newClass);
  }
  saveClasses(classes);
  return classes;
}

/**
 * Delete a class
 */
export function deleteClass(classId) {
  const classes = getClasses().filter(c => c.id !== classId);
  saveClasses(classes);
  // Also clean attendance records for this class
  localStorage.removeItem(`${ATTENDANCE_STORAGE_PREFIX}${classId}`);
  return classes;
}

/**
 * Get all attendance records for a class (keyed by date YYYY-MM-DD)
 */
export function getClassAttendanceRecords(classId) {
  try {
    const raw = localStorage.getItem(`${ATTENDANCE_STORAGE_PREFIX}${classId}`);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error(`Failed to load attendance for class ${classId}:`, err);
    return {};
  }
}

/**
 * Get attendance for a class on a specific date
 */
export function getAttendanceForDate(classId, dateString) {
  const records = getClassAttendanceRecords(classId);
  return records[dateString] || null;
}

/**
 * Save attendance session for a class on a specific date
 * session: {
 *   date: "2026-10-26",
 *   records: { [rollNo]: 'present' | 'absent' },
 *   summary: { total, present, absent, percentage },
 *   timestamp: number
 * }
 */
export function saveAttendanceSession(classId, session) {
  try {
    const allRecords = getClassAttendanceRecords(classId);
    allRecords[session.date] = {
      ...session,
      updatedAt: Date.now()
    };
    localStorage.setItem(`${ATTENDANCE_STORAGE_PREFIX}${classId}`, JSON.stringify(allRecords));
  } catch (err) {
    console.error(`Failed to save attendance for class ${classId}:`, err);
  }
}

/**
 * Delete attendance for a specific date
 */
export function deleteAttendanceForDate(classId, dateString) {
  try {
    const allRecords = getClassAttendanceRecords(classId);
    if (allRecords[dateString]) {
      delete allRecords[dateString];
      localStorage.setItem(`${ATTENDANCE_STORAGE_PREFIX}${classId}`, JSON.stringify(allRecords));
    }
  } catch (err) {
    console.error(`Failed to delete attendance for class ${classId} on date ${dateString}:`, err);
  }
}

/**
 * Export attendance record to CSV format and trigger download
 */
export function exportAttendanceToCSV(selectedClass, dateString, session) {
  if (!session || !session.records) return;

  const headers = ["Roll Number", "Student Name", "Gender", "Date", "Status"];
  const rows = selectedClass.students.map(student => {
    const status = session.records[student.rollNo] || "unmarked";
    return [
      student.rollNo,
      `"${(student.name || '').replace(/"/g, '""')}"`,
      student.gender || 'Unspecified',
      dateString,
      status.toUpperCase()
    ];
  });

  const students = selectedClass.students || [];
  const maleStudents = students.filter(s => (s.gender || '').toLowerCase() === 'male');
  const femaleStudents = students.filter(s => (s.gender || '').toLowerCase() === 'female');
  
  const malePresent = maleStudents.filter(s => session.records[s.rollNo] === 'present').length;
  const femalePresent = femaleStudents.filter(s => session.records[s.rollNo] === 'present').length;

  const summaryRows = [
    [],
    ["Summary", "", "", ""],
    ["Total Students", session.summary.total, "", ""],
    ["Present", session.summary.present, "", ""],
    ["Absent", session.summary.absent, "", ""],
    ["Overall Attendance Rate", `${session.summary.percentage}%`, "", ""],
    [],
    ["Gender Breakdown", "", "", ""],
    ["Boys (Male) Enrolled", maleStudents.length, "", ""],
    ["Boys (Male) Present", malePresent, "", ""],
    ["Boys (Male) Absent", maleStudents.length - malePresent, "", ""],
    ["Boys Attendance Rate", `${maleStudents.length > 0 ? Math.round((malePresent / maleStudents.length) * 100) : 0}%`, "", ""],
    [],
    ["Girls (Female) Enrolled", femaleStudents.length, "", ""],
    ["Girls (Female) Present", femalePresent, "", ""],
    ["Girls (Female) Absent", femaleStudents.length - femalePresent, "", ""],
    ["Girls Attendance Rate", `${femaleStudents.length > 0 ? Math.round((femalePresent / femaleStudents.length) * 100) : 0}%`, "", ""]
  ];

  const csvContent = "data:text/csv;charset=utf-8," + 
    [headers.join(","), ...rows.map(e => e.join(",")), ...summaryRows.map(e => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Attendance_${selectedClass.name.replace(/\s+/g, '_')}_${dateString}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
