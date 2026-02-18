import React, { useState } from 'react';
import { BarChart3, BookOpen, Check, Download, RefreshCw, Users, X } from 'lucide-react';
import { parseDate } from '../../utils/dateUtils.js';

function ExportModal({ showExportModal, setShowExportModal, handleExport, courses, users }) {
  const [exportType, setExportType] = useState('courses');
  const [format, setFormat] = useState('json');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  const getFilteredCourses = () => {
    let filtered = [...courses];

    if (selectedDateRange === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter((c) => {
        const courseDate = parseDate(c.date);
        return courseDate.toDateString() === today;
      });
    } else if (selectedDateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((c) => {
        const courseDate = parseDate(c.date);
        return courseDate >= weekAgo;
      });
    } else if (selectedDateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter((c) => {
        const courseDate = parseDate(c.date);
        return courseDate >= monthAgo;
      });
    } else if (selectedDateRange === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      filtered = filtered.filter((c) => {
        const courseDate = parseDate(c.date);
        return courseDate >= start && courseDate <= end;
      });
    }

    return filtered;
  };

  const handleExportData = async () => {
    setExporting(true);

    try {
      let dataToExport;
      let filename;

      if (exportType === 'courses') {
        const filteredCourses = getFilteredCourses();
        dataToExport = {
          type: 'courses',
          data: filteredCourses,
          exportInfo: {
            total: filteredCourses.length,
            dateRange: selectedDateRange,
            exportedAt: new Date().toISOString(),
            filter:
              selectedDateRange === 'custom' ? { start: customStartDate, end: customEndDate } : selectedDateRange,
          },
        };
        filename = `courses_export_${new Date().toISOString().split('T')[0]}`;
      } else if (exportType === 'users') {
        dataToExport = {
          type: 'users',
          data: users,
          exportInfo: {
            total: users.length,
            exportedAt: new Date().toISOString(),
          },
        };
        filename = `users_export_${new Date().toISOString().split('T')[0]}`;
      } else if (exportType === 'summary') {
        const filteredCourses = getFilteredCourses();
        dataToExport = {
          type: 'summary',
          summary: {
            totalCourses: courses.length,
            filteredCourses: filteredCourses.length,
            totalUsers: users.length,
            coursesByType: filteredCourses.reduce((acc, course) => {
              acc[course.option || 'Other'] = (acc[course.option || 'Other'] || 0) + 1;
              return acc;
            }, {}),
            venues: [...new Set(filteredCourses.map((c) => c.venue).filter(Boolean))],
            dateRange: selectedDateRange,
            exportedAt: new Date().toISOString(),
          },
        };
        filename = `summary_export_${new Date().toISOString().split('T')[0]}`;
      }

      let exportData;
      let fileExtension;

      if (format === 'json') {
        exportData = JSON.stringify(dataToExport, null, 2);
        fileExtension = 'json';
      } else if (format === 'csv') {
        if (exportType === 'courses') {
          const headers = ['Code', 'Name', 'Date', 'Time', 'Venue', 'Instructor', 'Option', 'Number of Students', 'Rows'];
          const rows = dataToExport.data.map((course) => [
            course.code || '',
            course.name || '',
            course.date || '',
            course.time || '',
            course.venue || '',
            course.instructor || '',
            course.option || '',
            course.numStudents || '',
            course.rows || '',
          ]);
          exportData = [headers, ...rows].map((row) => row.join(',')).join('\n');
        } else if (exportType === 'users') {
          const headers = ['Name', 'Email', 'Student ID', 'Role', 'Created At'];
          const rows = dataToExport.data.map((user) => [
            user.full_name || '',
            user.email || '',
            user.student_id || '',
            user.role || '',
            user.created_at || '',
          ]);
          exportData = [headers, ...rows].map((row) => row.join(',')).join('\n');
        }
        fileExtension = 'csv';
      }

      const blob = new Blob([exportData], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      handleExport({
        type: exportType,
        format: format,
        count:
          exportType === 'courses'
            ? getFilteredCourses().length
            : exportType === 'users'
              ? users.length
              : 1,
      });

      setTimeout(() => {
        setShowExportModal(false);
        setExporting(false);
      }, 1000);
    } catch (error) {
      console.error('Export error:', error);
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Data</h2>
            <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Select data type and format for export</p>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">What to export?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'courses', label: 'Courses', icon: BookOpen, count: courses.length },
                { id: 'users', label: 'Users', icon: Users, count: users.length },
                { id: 'summary', label: 'Summary', icon: BarChart3, count: 1 },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setExportType(type.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    exportType === type.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <type.icon
                      className={`w-6 h-6 mb-2 ${
                        exportType === type.id ? 'text-blue-600 dark:text-blue-500' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{type.count} items</span>
                    {exportType === type.id && (
                      <div className="mt-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Export Format</h3>
            <div className="flex space-x-4">
              {['json', 'csv'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    format === fmt
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {format === 'json' ? 'Best for data backup and integration' : 'Best for spreadsheet applications'}
            </p>
          </div>

          {exportType === 'courses' || exportType === 'summary' ? (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Date Range</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {[
                  { id: 'all', label: 'All Dates' },
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: 'Last 7 Days' },
                  { id: 'month', label: 'Last 30 Days' },
                  { id: 'custom', label: 'Custom Range' },
                ].map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setSelectedDateRange(range.id)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                      selectedDateRange === range.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {selectedDateRange === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {exportType === 'courses' && (
                  <span>
                    {selectedDateRange === 'all' && `Exporting all ${courses.length} courses`}
                    {selectedDateRange === 'today' && `Exporting today's courses`}
                    {selectedDateRange === 'week' && `Exporting courses from last 7 days`}
                    {selectedDateRange === 'month' && `Exporting courses from last 30 days`}
                    {selectedDateRange === 'custom' &&
                      customStartDate &&
                      customEndDate &&
                      `Exporting courses from ${customStartDate} to ${customEndDate}`}
                  </span>
                )}
              </div>
            </div>
          ) : null}

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Export Summary</h4>
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded">
                {format.toUpperCase()}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>
                • Type: <span className="font-medium capitalize">{exportType}</span>
              </p>
              {exportType === 'courses' && (
                <p>
                  • Courses: <span className="font-medium">{getFilteredCourses().length} items</span>
                </p>
              )}
              {exportType === 'users' && (
                <p>
                  • Users: <span className="font-medium">{users.length} items</span>
                </p>
              )}
              {exportType === 'summary' && <p>• Summary report with statistics</p>}
              <p>
                • Format: <span className="font-medium">{format.toUpperCase()}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowExportModal(false)}
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              disabled={exporting}
            >
              Cancel
            </button>
            <button
              onClick={handleExportData}
              disabled={exporting || (selectedDateRange === 'custom' && (!customStartDate || !customEndDate))}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2 inline" />
                  Export Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;

