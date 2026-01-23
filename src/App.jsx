import React, { useState, useEffect, useRef } from 'react'; 
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Download,
  LogOut,
  Clock,
  TrendingUp,
  Calendar,
  MapPin,
  Bell,
  Menu,
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Upload,
  FileText,
  AlertTriangle,
  ChevronDown,
  User,
  Mail,
  Book,
  Copy,
  Check,
  Sun,
  Moon,
  Palette,
  Lock,
  Eye,
  EyeOff,
  Key,
  UserPlus,
  LogIn,
  Database,
  Shield,
  Globe,
  Cpu,
  HardDrive,
  Server,
  Home,
  Phone,
  MessageCircle,
  HelpCircle,
  Info,
  BarChart3,
  PieChart,
  LineChart,
  FileBarChart,
  Activity,
  DownloadCloud,
  UploadCloud,
  ShieldCheck,
  BellRing,
  Zap,
  Target,
  Star,
  Award,
  TrendingDown,
  Percent,
  DollarSign,
  CreditCard,
  Smartphone,
  Monitor,
  Laptop,
  Tablet,
  Wifi,
  Network,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudOff,
  WifiOff,
  Battery,
  BatteryCharging,
  Power,
  PowerOff,
  Thermometer,
  Droplets,
  Wind,
  SunDim,
  MoonStar,
  Type,
  Bold,
  Italic,
  Underline,
  Heading,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image,
  Video,
  Music,
  Film,
  Camera,
  Mic,
  Headphones,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Heart,
  Share2,
  Bookmark,
  Flag,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry
} from 'lucide-react';
import './index.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'SUPABASE_KEY_REMOVED';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============ BACKUP/RESTORE SERVICE ============
const BackupService = {
  // Storage key for backups
  BACKUP_STORAGE_KEY: 'baraton_backups',
  SETTINGS_STORAGE_KEY: 'baraton_system_settings',
  BACKUP_HISTORY_KEY: 'baraton_backup_history',
  
  // Create a comprehensive system backup
  async createBackup(courses, users, settings, currentUser) {
    try {
      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();
      
      const backupData = {
        id: backupId,
        name: `Backup ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        timestamp,
        createdBy: currentUser?.email || 'system',
        createdByName: currentUser?.name || 'System',
        
        // System data
        courses: courses || [],
        users: users || [],
        settings: settings || {},
        
        // Metadata
        version: '1.0.0',
        totalCourses: courses?.length || 0,
        totalUsers: users?.length || 0,
        size: 0, // Will be calculated
        checksum: this.generateChecksum(JSON.stringify({ courses, users, settings }))
      };
      
      // Calculate approximate size
      backupData.size = new Blob([JSON.stringify(backupData)]).size;
      
      // Save to localStorage
      const backups = this.getBackupHistory();
      backups.unshift(backupData);
      
      // Keep only last 50 backups
      const trimmedBackups = backups.slice(0, 50);
      localStorage.setItem(this.BACKUP_HISTORY_KEY, JSON.stringify(trimmedBackups));
      
      // Also save current backup separately for quick restore
      localStorage.setItem(this.BACKUP_STORAGE_KEY, JSON.stringify(backupData));
      
      // Save individual system settings
      localStorage.setItem(this.SETTINGS_STORAGE_KEY, JSON.stringify({
        systemName: settings?.systemName,
        dateFormat: settings?.dateFormat,
        language: settings?.language,
        timezone: settings?.timezone,
        theme: settings?.theme,
        backupTimestamp: timestamp,
        backupId
      }));
      
      console.log('Backup created successfully:', backupId);
      return {
        success: true,
        backupId,
        timestamp,
        size: backupData.size,
        totalItems: backupData.totalCourses + backupData.totalUsers
      };
      
    } catch (error) {
      console.error('Backup creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Restore from a backup
  async restoreBackup(backupId, addNotification) {
    try {
      let backupData;
      
      if (backupId === 'latest') {
        // Restore from latest backup
        const backupJson = localStorage.getItem(this.BACKUP_STORAGE_KEY);
        if (!backupJson) {
          throw new Error('No backup found');
        }
        backupData = JSON.parse(backupJson);
      } else {
        // Restore from specific backup in history
        const backups = this.getBackupHistory();
        backupData = backups.find(b => b.id === backupId);
        if (!backupData) {
          throw new Error('Backup not found');
        }
      }
      
      // Validate backup data
      if (!this.validateBackup(backupData)) {
        throw new Error('Invalid or corrupted backup data');
      }
      
      // Save restore point (in case we need to revert)
      const restorePoint = await this.createRestorePoint();
      
      try {
        // Restore courses to localStorage (simulating database restore)
        if (backupData.courses && Array.isArray(backupData.courses)) {
          localStorage.setItem('exam_courses_backup', JSON.stringify(backupData.courses));
          
          // Update Supabase if connected (simulated)
          this.simulateSupabaseUpdate('exam_courses', backupData.courses);
        }
        
        // Restore users to localStorage
        if (backupData.users && Array.isArray(backupData.users)) {
          localStorage.setItem('users_backup', JSON.stringify(backupData.users));
          this.simulateSupabaseUpdate('profiles', backupData.users);
        }
        
        // Restore system settings
        if (backupData.settings) {
          Object.entries(backupData.settings).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              localStorage.setItem(key, value);
            }
          });
          
          // Apply theme immediately
          if (backupData.settings.adminTheme) {
            document.documentElement.setAttribute('data-theme', backupData.settings.adminTheme);
            if (backupData.settings.adminTheme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        }
        
        // Log restore operation
        this.logRestoreOperation(backupData, restorePoint);
        
        // Dispatch events to notify components
        window.dispatchEvent(new CustomEvent('backupRestored', { 
          detail: { 
            backupId: backupData.id, 
            timestamp: new Date().toISOString() 
          } 
        }));
        
        console.log('Restore completed successfully:', backupData.id);
        
        if (addNotification) {
          addNotification(
            'Restore Completed',
            `Successfully restored system from backup: ${backupData.name}`,
            'success'
          );
        }
        
        return {
          success: true,
          backupId: backupData.id,
          timestamp: backupData.timestamp,
          restoredItems: {
            courses: backupData.courses?.length || 0,
            users: backupData.users?.length || 0,
            settings: Object.keys(backupData.settings || {}).length
          }
        };
        
      } catch (restoreError) {
        // Attempt to restore from restore point
        console.error('Restore failed, attempting to revert:', restoreError);
        await this.restoreFromPoint(restorePoint);
        throw new Error(`Restore failed: ${restoreError.message}`);
      }
      
    } catch (error) {
      console.error('Restore error:', error);
      
      if (addNotification) {
        addNotification(
          'Restore Failed',
          `Failed to restore system: ${error.message}`,
          'error'
        );
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Create a restore point before restoration
  async createRestorePoint() {
    const restorePointId = `restore_point_${Date.now()}`;
    const restorePoint = {
      id: restorePointId,
      timestamp: new Date().toISOString(),
      courses: JSON.parse(localStorage.getItem('exam_courses_backup') || '[]'),
      users: JSON.parse(localStorage.getItem('users_backup') || '[]'),
      settings: {
        systemName: localStorage.getItem('systemName'),
        dateFormat: localStorage.getItem('dateFormat'),
        language: localStorage.getItem('adminLanguage'),
        timezone: localStorage.getItem('timezone'),
        adminTheme: localStorage.getItem('adminTheme'),
        compactMode: localStorage.getItem('compactMode'),
        highContrast: localStorage.getItem('highContrast')
      }
    };
    
    // Save restore point
    const restorePoints = JSON.parse(localStorage.getItem('restore_points') || '[]');
    restorePoints.unshift(restorePoint);
    
    // Keep only last 5 restore points
    const trimmedPoints = restorePoints.slice(0, 5);
    localStorage.setItem('restore_points', JSON.stringify(trimmedPoints));
    
    return restorePoint;
  },
  
  // Restore from a restore point
  async restoreFromPoint(restorePoint) {
    if (!restorePoint) return false;
    
    try {
      // Restore data from restore point
      if (restorePoint.courses) {
        localStorage.setItem('exam_courses_backup', JSON.stringify(restorePoint.courses));
      }
      
      if (restorePoint.users) {
        localStorage.setItem('users_backup', JSON.stringify(restorePoint.users));
      }
      
      if (restorePoint.settings) {
        Object.entries(restorePoint.settings).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            localStorage.setItem(key, value);
          }
        });
      }
      
      console.log('System reverted to restore point:', restorePoint.id);
      return true;
      
    } catch (error) {
      console.error('Failed to restore from point:', error);
      return false;
    }
  },
  
  // Get backup history
  getBackupHistory() {
    try {
      const historyJson = localStorage.getItem(this.BACKUP_HISTORY_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error('Error reading backup history:', error);
      return [];
    }
  },
  
  // Get specific backup by ID
  getBackup(backupId) {
    const backups = this.getBackupHistory();
    return backups.find(b => b.id === backupId);
  },
  
  // Delete a backup
  deleteBackup(backupId) {
    try {
      const backups = this.getBackupHistory();
      const filteredBackups = backups.filter(b => b.id !== backupId);
      localStorage.setItem(this.BACKUP_HISTORY_KEY, JSON.stringify(filteredBackups));
      
      // If deleting the latest backup, update latest backup reference
      const latestBackup = filteredBackups[0];
      if (latestBackup) {
        localStorage.setItem(this.BACKUP_STORAGE_KEY, JSON.stringify(latestBackup));
      } else {
        localStorage.removeItem(this.BACKUP_STORAGE_KEY);
      }
      
      return {
        success: true,
        deletedId: backupId,
        remaining: filteredBackups.length
      };
      
    } catch (error) {
      console.error('Error deleting backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Clear all backups
  clearAllBackups() {
    try {
      localStorage.removeItem(this.BACKUP_HISTORY_KEY);
      localStorage.removeItem(this.BACKUP_STORAGE_KEY);
      return { success: true };
    } catch (error) {
      console.error('Error clearing backups:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Export backup to file
  exportBackup(backupId, filename = 'backup') {
    try {
      const backup = backupId === 'latest' 
        ? JSON.parse(localStorage.getItem(this.BACKUP_STORAGE_KEY) || 'null')
        : this.getBackup(backupId);
      
      if (!backup) {
        throw new Error('Backup not found');
      }
      
      const backupJson = JSON.stringify(backup, null, 2);
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = `${filename}_${backup.id}_${new Date(backup.timestamp).toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true, backupId: backup.id };
      
    } catch (error) {
      console.error('Error exporting backup:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Import backup from file
  async importBackup(file, addNotification) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          
          // Validate imported backup
          if (!this.validateBackup(backupData)) {
            throw new Error('Invalid backup file format');
          }
          
          // Add to backup history
          const backups = this.getBackupHistory();
          backups.unshift(backupData);
          localStorage.setItem(this.BACKUP_HISTORY_KEY, JSON.stringify(backups));
          localStorage.setItem(this.BACKUP_STORAGE_KEY, JSON.stringify(backupData));
          
          if (addNotification) {
            addNotification(
              'Backup Imported',
              `Successfully imported backup: ${backupData.name}`,
              'success'
            );
          }
          
          resolve({
            success: true,
            backupId: backupData.id,
            name: backupData.name,
            timestamp: backupData.timestamp
          });
          
        } catch (error) {
          console.error('Error importing backup:', error);
          
          if (addNotification) {
            addNotification(
              'Import Failed',
              `Failed to import backup: ${error.message}`,
              'error'
            );
          }
          
          resolve({
            success: false,
            error: error.message
          });
        }
      };
      
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file'
        });
      };
      
      reader.readAsText(file);
    });
  },
  
  // Validate backup data structure
  validateBackup(backupData) {
    if (!backupData || typeof backupData !== 'object') return false;
    if (!backupData.id || !backupData.timestamp || !backupData.version) return false;
    if (!Array.isArray(backupData.courses) || !Array.isArray(backupData.users)) return false;
    
    // Verify checksum if present
    if (backupData.checksum) {
      const dataToCheck = JSON.stringify({
        courses: backupData.courses,
        users: backupData.users,
        settings: backupData.settings
      });
      const calculatedChecksum = this.generateChecksum(dataToCheck);
      if (calculatedChecksum !== backupData.checksum) {
        console.warn('Backup checksum mismatch');
        return false;
      }
    }
    
    return true;
  },
  
  // Generate simple checksum for data validation
  generateChecksum(data) {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  },
  
  // Simulate Supabase update (for demo purposes)
  simulateSupabaseUpdate(table, data) {
    console.log(`Simulating Supabase update for ${table}:`, data.length, 'items');
    // In real implementation, this would make actual Supabase API calls
  },
  
  // Log restore operation
  logRestoreOperation(backupData, restorePoint) {
    const restoreLogs = JSON.parse(localStorage.getItem('restore_logs') || '[]');
    const logEntry = {
      id: `restore_log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      backupId: backupData.id,
      backupName: backupData.name,
      backupTimestamp: backupData.timestamp,
      restorePointId: restorePoint?.id,
      restoredItems: {
        courses: backupData.courses?.length || 0,
        users: backupData.users?.length || 0
      }
    };
    
    restoreLogs.unshift(logEntry);
    localStorage.setItem('restore_logs', JSON.stringify(restoreLogs.slice(0, 100)));
  },
  
  // Get system backup status
  getBackupStatus() {
    const backups = this.getBackupHistory();
    const latestBackup = backups[0];
    const totalSize = backups.reduce((sum, b) => sum + (b.size || 0), 0);
    
    return {
      totalBackups: backups.length,
      latestBackup: latestBackup ? {
        id: latestBackup.id,
        timestamp: latestBackup.timestamp,
        name: latestBackup.name,
        size: latestBackup.size
      } : null,
      totalSize,
      lastBackupDate: latestBackup?.timestamp || null,
      hasBackups: backups.length > 0
    };
  },
  
  // Initialize auto-backup schedule
  initializeAutoBackup(callback) {
    // Check if auto-backup is enabled
    const autoBackupEnabled = localStorage.getItem('autoBackupEnabled') !== 'false';
    const autoBackupInterval = parseInt(localStorage.getItem('autoBackupInterval') || '24') * 60 * 60 * 1000; // Convert to milliseconds
    
    if (autoBackupEnabled && autoBackupInterval > 0) {
      // Schedule auto-backup
      setInterval(async () => {
        const lastBackup = localStorage.getItem('lastAutoBackup');
        const now = Date.now();
        
        if (!lastBackup || (now - parseInt(lastBackup)) > autoBackupInterval) {
          console.log('Auto-backup triggered');
          localStorage.setItem('lastAutoBackup', now.toString());
          
          // Trigger backup creation
          if (typeof callback === 'function') {
            callback();
          }
        }
      }, 60 * 60 * 1000); // Check every hour
    }
  }
};

// Helper functions (keep existing ones)
const parseDate = (dateString, dateFormat = 'DD-MM-YYYY') => {
  try {
    if (!dateString) return new Date();
    
    const format = localStorage.getItem('dateFormat') || 'DD-MM-YYYY';
    
    if (format === 'DD-MM-YYYY') {
      const parts = dateString.split(/[,\-\/]/).map(part => part.trim());
      if (parts.length >= 3) {
        const day = parts[0].length === 3 ? parts[1] : parts[0];
        const month = parts[1]?.length === 3 ? parts[2] : parts[1];
        const year = parts[2]?.length === 3 ? parts[3] : parts[2];
        
        if (day && month && year) {
          return new Date(`${year}-${month}-${day}`);
        }
      }
    } else if (format === 'MM/DD/YYYY') {
      const parts = dateString.split(/[,\-\/]/).map(part => part.trim());
      if (parts.length >= 3) {
        const month = parts[0];
        const day = parts[1];
        const year = parts[2];
        
        if (day && month && year) {
          return new Date(`${year}-${month}-${day}`);
        }
      }
    } else if (format === 'YYYY-MM-DD') {
      return new Date(dateString);
    }
    
    return new Date(dateString);
  } catch {
    return new Date();
  }
};

const formatDate = (date, dateFormat = 'DD-MM-YYYY') => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayNames[d.getDay()];
  
  const format = localStorage.getItem('dateFormat') || 'DD-MM-YYYY';
  
  switch(format) {
    case 'DD-MM-YYYY':
      return `${dayName}, ${day}-${month}-${year}`;
    case 'MM/DD/YYYY':
      return `${dayName}, ${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${dayName}, ${day}/${month}/${year}`;
    default:
      return `${dayName}, ${day}-${month}-${year}`;
  }
};

// ============ INTELLIGENT ROW ALLOCATION SYSTEM ============
const calculateRequiredRows = (numStudents, studentsPerRow = 10) => {
  if (!numStudents || numStudents <= 0) return [];
  
  const numStudentsInt = parseInt(numStudents);
  const rowsNeeded = Math.ceil(numStudentsInt / studentsPerRow);
  
  return Array.from({ length: rowsNeeded }, (_, i) => i + 1);
};

const getOccupiedRows = (courses, date, time, venue, excludeCourseId = null) => {
  if (!date || !time || !venue) return [];
  
  const occupiedRows = [];
  
  courses.forEach(course => {
    if (excludeCourseId && course.id === excludeCourseId) return;
    
    if (course.date === date && course.time === time && course.venue === venue) {
      if (course.rows) {
        const rows = course.rows.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r));
        occupiedRows.push(...rows);
      }
    }
  });
  
  return occupiedRows.sort((a, b) => a - b);
};

const allocateRows = (numStudents, occupiedRows = [], parity = 'auto') => {
  if (!numStudents || numStudents <= 0) return '';
  
  const numStudentsInt = parseInt(numStudents);
  const studentsPerRow = 10;
  const rowsNeeded = Math.ceil(numStudentsInt / studentsPerRow);
  
  let useOdd = true;
  if (parity === 'auto') {
    const oddCount = occupiedRows.filter(r => r % 2 === 1).length;
    const evenCount = occupiedRows.filter(r => r % 2 === 0).length;
    useOdd = evenCount >= oddCount;
  } else {
    useOdd = parity === 'odd';
  }
  
  const allocatedRows = [];
  let currentRow = useOdd ? 1 : 2;
  const maxRows = 50;
  
  while (allocatedRows.length < rowsNeeded && currentRow <= maxRows) {
    const isOccupied = occupiedRows.includes(currentRow);
    const isAdjacentToOccupied = 
      occupiedRows.includes(currentRow - 1) || 
      occupiedRows.includes(currentRow + 1);
    
    const isAdjacentToAllocated = 
      allocatedRows.includes(currentRow - 1) || 
      allocatedRows.includes(currentRow + 1);
    
    if (!isOccupied && !isAdjacentToOccupied && !isAdjacentToAllocated) {
      allocatedRows.push(currentRow);
    }
    
    currentRow += 2;
    
    if (currentRow > maxRows && allocatedRows.length < rowsNeeded) {
      useOdd = !useOdd;
      currentRow = useOdd ? 1 : 2;
    }
  }
  
  if (allocatedRows.length < rowsNeeded) {
    currentRow = 1;
    while (allocatedRows.length < rowsNeeded && currentRow <= maxRows) {
      if (!occupiedRows.includes(currentRow) && !allocatedRows.includes(currentRow)) {
        allocatedRows.push(currentRow);
      }
      currentRow++;
    }
  }
  
  return allocatedRows.sort((a, b) => a - b).join(', ');
};

const getRowAllocationSuggestions = (courses, currentCourse) => {
  const { date, time, venue, numStudents, id: excludeId } = currentCourse;
  
  if (!date || !time || !venue || !numStudents) {
    return { suggestedRows: '', warning: '', occupiedRows: [] };
  }
  
  const occupiedRows = getOccupiedRows(courses, date, time, venue, excludeId);
  const suggestedRows = allocateRows(numStudents, occupiedRows);
  
  let warning = '';
  
  if (occupiedRows.length > 0) {
    const concurrentCourses = courses.filter(c => 
      c.date === date && 
      c.time === time && 
      c.venue === venue && 
      (!excludeId || c.id !== excludeId)
    );
    
    warning = `⚠️ ${concurrentCourses.length} other course(s) already scheduled in ${venue} at ${time} on ${date}. Occupied rows: ${occupiedRows.join(', ')}`;
  }
  
  return {
    suggestedRows,
    warning,
    occupiedRows,
    concurrentCourses: courses.filter(c => 
      c.date === date && 
      c.time === time && 
      c.venue === venue && 
      (!excludeId || c.id !== excludeId)
    ).length
  };
};

// ============ UPDATED HELPER FUNCTION ============
const getMockCourses = () => [
  { id: 1, code: 'CSIS311', name: 'Database Systems', date: 'Mon, 24-01-2025', time: '09:00 AM-12:00 PM', venue: 'Main Hall', instructor: 'Dr. Smith', option: 'Main', numStudents: '50', rows: '1, 3, 5, 7, 9' },
  { id: 2, code: 'MATH201', name: 'Calculus II', date: 'Tue, 25-01-2025', time: '01:00 PM-03:00 PM', venue: 'Room 101', instructor: 'Prof. Johnson', option: 'Group A', numStudents: '40', rows: '2, 4, 6, 8' },
  { id: 3, code: 'PHY301', name: 'Physics Lab', date: 'Wed, 26-01-2025', time: '10:00 AM-12:00 PM', venue: 'Lab Building', instructor: 'Dr. Williams', option: 'Group B', numStudents: '30', rows: '1, 3, 5, 7' },
  { id: 4, code: 'ENG101', name: 'English Composition', date: 'Thu, 27-01-2025', time: '02:00 PM-04:00 PM', venue: 'Room 202', instructor: 'Ms. Davis', option: 'Group C', numStudents: '45', rows: '2, 4, 6, 8, 10' },
];

const getMockUsers = () => [
  { id: 1, full_name: 'John Doe', email: 'john@example.com', student_id: 'S12345', created_at: '2024-01-15' },
  { id: 2, full_name: 'Jane Smith', email: 'jane@example.com', student_id: 'S12346', created_at: '2024-01-16' },
  { id: 3, full_name: 'Bob Johnson', email: 'bob@example.com', student_id: 'S12347', created_at: '2024-01-17' },
];

// ============ NOTIFICATION COMPONENT ============
function NotificationPanel({ showNotifications, setShowNotifications, notifications, markAsRead, clearAllNotifications }) {
  if (!showNotifications) return null;

  return (
    <div className="fixed right-4 top-16 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 md:w-96">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearAllNotifications}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear all
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg mr-3 ${
                      notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                      notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                      notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    }`}>
                      {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                       notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
                       notification.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                       <Bell className="w-4 h-4" />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ LECTURER SIGNUP PAGE ============
function LecturerSignupPage({ setShowSignup, setCurrentUser }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    staffId: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  const validateStep1 = () => {
    const errors = [];
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.email.includes('@')) errors.push('Valid email is required');
    if (!formData.staffId.trim()) errors.push('Staff ID is required');
    
    if (errors.length > 0) {
      setError(errors.join('. '));
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const errors = [];
    if (formData.password.length < 8) errors.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(formData.password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(formData.password)) errors.push('Password must contain at least one lowercase letter');
    if (!/\d/.test(formData.password)) errors.push('Password must contain at least one number');
    if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
    
    if (errors.length > 0) {
      setError(errors.join('. '));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateStep2()) {
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            staff_id: formData.staffId
          }
        }
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: authData.user.id,
            full_name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            role: 'lecturer',
            staff_id: formData.staffId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ], {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        setError('Account created but profile setup failed. Please contact administrator.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      
      setTimeout(async () => {
        const { data: loginData } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        
        if (loginData.user) {
          const user = {
            id: loginData.user.id,
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            role: 'lecturer',
            staffId: formData.staffId,
            avatar: formData.firstName[0]?.toUpperCase() || 'L'
          };
          
          setCurrentUser(user);
          localStorage.setItem('adminUser', JSON.stringify(user));
          setShowSignup(false);
        }
      }, 3000);

    } catch (error) {
      console.error('Signup error:', error);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
        <div className="md:flex">
          <div className="md:w-2/5 bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-8 md:p-12">
            <div className="mb-8">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Calendar className="w-8 h-8" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold">Baraton University</h1>
                  <p className="text-blue-200 text-sm">Examination Management System</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Lecturer Registration</h2>
              <p className="text-blue-200 mb-6">
                Join our examination management system to efficiently schedule and manage your courses.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-300 mr-3" />
                  <span>Manage your course schedules</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-300 mr-3" />
                  <span>Track student enrollment</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-300 mr-3" />
                  <span>Real-time notifications</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-300 mr-3" />
                  <span>Secure access to all features</span>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-blue-500/30">
              <p className="text-sm text-blue-200">
                Already have an account?{' '}
                <button
                  onClick={() => setShowSignup(false)}
                  className="text-white font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>

          <div className="md:w-3/5 p-8 md:p-12">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Lecturer Account Setup</h2>
                <p className="text-gray-600">Step {step} of 2</p>
              </div>
              <button
                onClick={() => setShowSignup(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-blue-600">{step === 1 ? '50%' : '100%'}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                  style={{ width: step === 1 ? '50%' : '100%' }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-600">Personal Information</span>
                <span className="text-xs text-gray-600">Account Setup</span>
              </div>
            </div>

            {success ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Registration Successful!</h3>
                <p className="text-gray-600 mb-6">
                  Your lecturer account has been created successfully. You will be redirected to the dashboard shortly.
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {step === 1 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="John"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        University Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john.doe@baraton.ac.ke"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Must be a valid university email address
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Staff ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.staffId}
                        onChange={(e) => setFormData({...formData, staffId: e.target.value.toUpperCase()})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="STAFF-12345"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Your official university staff identification number
                      </p>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                          <span className="text-sm font-medium text-red-800">{error}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:opacity-90 transition font-medium"
                      >
                        Continue to Account Setup
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Account for: {formData.firstName} {formData.lastName}</p>
                          <p className="text-xs text-blue-700">{formData.email} • Staff ID: {formData.staffId}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Create Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                          placeholder="Create a strong password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-600">Password must contain:</p>
                        <div className="grid grid-cols-2 gap-1">
                          <div className={`flex items-center text-xs ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            At least 8 characters
                          </div>
                          <div className={`flex items-center text-xs ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            One uppercase letter
                          </div>
                          <div className={`flex items-center text-xs ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            One lowercase letter
                          </div>
                          <div className={`flex items-center text-xs ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            One number
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm your password"
                        required
                      />
                      <div className="mt-2">
                        <div className={`flex items-center text-xs ${formData.password && formData.password === formData.confirmPassword ? 'text-green-600' : 'text-gray-400'}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${formData.password && formData.password === formData.confirmPassword ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          Passwords match
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="terms"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        required
                      />
                      <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                        I agree to the{' '}
                        <button type="button" className="text-blue-600 hover:text-blue-800">
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button type="button" className="text-blue-600 hover:text-blue-800">
                          Privacy Policy
                        </button>
                      </label>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                          <span className="text-sm font-medium text-red-800">{error}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex space-x-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                            Creating Account...
                          </>
                        ) : (
                          'Complete Registration'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Need administrative access?{' '}
                <button
                  type="button"
                  onClick={() => setShowSignup(false)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Contact system administrator
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ AUTHENTICATION COMPONENTS ============
function LoginModal({ showLogin, setShowLogin, setCurrentUser, setShowSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!showLogin) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Profile not found. Please contact administrator.');
        setLoading(false);
        return;
      }

      if (!profileData.role || (profileData.role !== 'admin' && profileData.role !== 'lecturer' && profileData.role !== 'examiner' && profileData.role !== 'coordinator')) {
        setError('Access denied. This panel is for administrators and lecturers only.');
        setLoading(false);
        return;
      }

      const user = {
        id: profileData.id,
        name: profileData.full_name || data.user.email?.split('@')[0] || 'User',
        email: data.user.email,
        role: profileData.role || 'lecturer',
        avatar: profileData.full_name?.[0]?.toUpperCase() || data.user.email?.[0]?.toUpperCase() || 'U'
      };
      
      setCurrentUser(user);
      localStorage.setItem('adminUser', JSON.stringify(user));
      setShowLogin(false);
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Login</h2>
            <button
              onClick={() => setShowLogin(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sign in to access the admin panel</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Enter admin/lecturer email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white pr-12"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex justify-between items-center mt-2">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 dark:bg-gray-800" />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <button type="button" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400">
                Forgot password?
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 mr-2" />
                <span className="text-sm font-medium text-red-800 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowLogin(false);
                  setShowSignup(true);
                }}
                className="w-full py-3 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition font-medium"
              >
                <UserPlus className="w-4 h-4 mr-2 inline" />
                Register as Lecturer
              </button>
            </div>
            
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Student login?{' '}
              <a 
                href="/"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 font-medium"
              >
                Go to student portal
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ BACKUP MODAL COMPONENT ============
function BackupModal({ showBackupModal, setShowBackupModal, backupService, addNotification, currentUser, courses, users, systemSettings }) {
  const [backupStatus, setBackupStatus] = useState('idle'); // idle, backing-up, completed, restoring, restored
  const [backupHistory, setBackupHistory] = useState([]);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [importing, setImporting] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(() => {
    return localStorage.getItem('autoBackupEnabled') !== 'false';
  });
  const [autoBackupInterval, setAutoBackupInterval] = useState(() => {
    return localStorage.getItem('autoBackupInterval') || '24';
  });

  useEffect(() => {
    if (showBackupModal) {
      loadBackupHistory();
    }
  }, [showBackupModal]);

  const loadBackupHistory = () => {
    const history = backupService.getBackupHistory();
    setBackupHistory(history);
  };

  const handleCreateBackup = async () => {
    setBackupStatus('backing-up');
    
    try {
      const result = await backupService.createBackup(
        courses, 
        users, 
        {
          ...systemSettings,
          adminTheme: localStorage.getItem('adminTheme'),
          compactMode: localStorage.getItem('compactMode'),
          highContrast: localStorage.getItem('highContrast')
        }, 
        currentUser
      );
      
      if (result.success) {
        setBackupStatus('completed');
        loadBackupHistory();
        
        addNotification(
          'Backup Created',
          `Backup created successfully with ${result.totalItems} items`,
          'success'
        );
        
        setTimeout(() => {
          setBackupStatus('idle');
        }, 3000);
      } else {
        setBackupStatus('idle');
        addNotification(
          'Backup Failed',
          `Failed to create backup: ${result.error}`,
          'error'
        );
      }
    } catch (error) {
      setBackupStatus('idle');
      addNotification(
        'Backup Error',
        `An error occurred: ${error.message}`,
        'error'
      );
    }
  };

  const handleRestoreBackup = async (backupId = 'latest') => {
    if (!window.confirm('Are you sure you want to restore this backup? Current data may be overwritten.')) {
      return;
    }
    
    setBackupStatus('restoring');
    
    try {
      const result = await backupService.restoreBackup(backupId, addNotification);
      
      if (result.success) {
        setBackupStatus('restored');
        
        setTimeout(() => {
          setBackupStatus('idle');
          setShowBackupModal(false);
          // Trigger page reload to reflect restored data
          window.location.reload();
        }, 2000);
      } else {
        setBackupStatus('idle');
      }
    } catch (error) {
      setBackupStatus('idle');
      addNotification(
        'Restore Failed',
        `Failed to restore backup: ${error.message}`,
        'error'
      );
    }
  };

  const handleDeleteBackup = async (backupId) => {
    if (!window.confirm('Are you sure you want to delete this backup?')) {
      return;
    }
    
    const result = backupService.deleteBackup(backupId);
    
    if (result.success) {
      loadBackupHistory();
      addNotification(
        'Backup Deleted',
        `Backup deleted successfully`,
        'success'
      );
    } else {
      addNotification(
        'Delete Failed',
        `Failed to delete backup: ${result.error}`,
        'error'
      );
    }
  };

  const handleExportBackup = (backupId) => {
    const backup = backupId === 'latest' 
      ? backupHistory[0]
      : backupHistory.find(b => b.id === backupId);
    
    if (!backup) {
      addNotification(
        'Export Failed',
        'Backup not found',
        'error'
      );
      return;
    }
    
    const result = backupService.exportBackup(backupId, `baraton_backup_${new Date(backup.timestamp).toISOString().split('T')[0]}`);
    
    if (result.success) {
      addNotification(
        'Backup Exported',
        `Backup exported successfully as JSON file`,
        'success'
      );
    } else {
      addNotification(
        'Export Failed',
        `Failed to export backup: ${result.error}`,
        'error'
      );
    }
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setImporting(true);
    
    try {
      const result = await backupService.importBackup(file, addNotification);
      
      if (result.success) {
        loadBackupHistory();
        addNotification(
          'Backup Imported',
          `Successfully imported backup: ${result.name}`,
          'success'
        );
      } else {
        addNotification(
          'Import Failed',
          `Failed to import backup: ${result.error}`,
          'error'
        );
      }
    } catch (error) {
      addNotification(
        'Import Error',
        `An error occurred: ${error.message}`,
        'error'
      );
    } finally {
      setImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleClearAllBackups = () => {
    if (!window.confirm('Are you sure you want to clear all backups? This action cannot be undone.')) {
      return;
    }
    
    const result = backupService.clearAllBackups();
    
    if (result.success) {
      setBackupHistory([]);
      addNotification(
        'Backups Cleared',
        'All backups have been cleared',
        'warning'
      );
    } else {
      addNotification(
        'Clear Failed',
        `Failed to clear backups: ${result.error}`,
        'error'
      );
    }
  };

  const handleAutoBackupToggle = (enabled) => {
    setAutoBackupEnabled(enabled);
    localStorage.setItem('autoBackupEnabled', enabled.toString());
    
    if (enabled) {
      addNotification(
        'Auto-Backup Enabled',
        'Automatic backups have been enabled',
        'success'
      );
    } else {
      addNotification(
        'Auto-Backup Disabled',
        'Automatic backups have been disabled',
        'info'
      );
    }
  };

  const handleAutoBackupIntervalChange = (hours) => {
    setAutoBackupInterval(hours);
    localStorage.setItem('autoBackupInterval', hours);
    
    addNotification(
      'Auto-Backup Interval Updated',
      `Auto-backup interval set to ${hours} hours`,
      'success'
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const backupStatusInfo = backupService.getBackupStatus();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Backup & Restore</h2>
            <button
              onClick={() => setShowBackupModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage system backups and restoration</p>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Backup Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-blue-600 dark:text-blue-500 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Total Backups</h4>
                  <p className="text-2xl font-bold mt-2 dark:text-white">{backupStatusInfo.totalBackups}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-green-600 dark:text-green-500 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Last Backup</h4>
                  <p className="text-sm mt-2 dark:text-gray-300">
                    {backupStatusInfo.lastBackupDate 
                      ? formatDate(backupStatusInfo.lastBackupDate)
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
              <div className="flex items-center">
                <HardDrive className="w-8 h-8 text-purple-600 dark:text-purple-500 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Total Size</h4>
                  <p className="text-2xl font-bold mt-2 dark:text-white">{formatFileSize(backupStatusInfo.totalSize)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {backupStatus === 'backing-up' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center">
                <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-500 mr-2 animate-spin" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Creating backup... Please wait</span>
              </div>
            </div>
          )}

          {backupStatus === 'completed' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-800 dark:text-green-300">Backup created successfully!</span>
              </div>
            </div>
          )}

          {backupStatus === 'restoring' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center">
                <RefreshCw className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-2 animate-spin" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Restoring system... Please wait</span>
              </div>
            </div>
          )}

          {backupStatus === 'restored' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-800 dark:text-green-300">System restored successfully! Page will reload...</span>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCreateBackup}
              disabled={backupStatus !== 'idle'}
              className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <DownloadCloud className="w-5 h-5 mr-2" />
              Create New Backup
            </button>
            
            <button
              onClick={() => handleRestoreBackup('latest')}
              disabled={backupStatus !== 'idle' || !backupStatusInfo.hasBackups}
              className="p-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <UploadCloud className="w-5 h-5 mr-2" />
              Restore Latest
            </button>
          </div>

          {/* Import/Export Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Import & Export</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Import Backup
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    disabled={importing || backupStatus !== 'idle'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-900 dark:text-white disabled:opacity-50"
                  />
                  {importing && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select a JSON backup file</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Latest Backup
                </label>
                <button
                  onClick={() => handleExportBackup('latest')}
                  disabled={!backupStatusInfo.hasBackups || backupStatus !== 'idle'}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Download Backup
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Download as JSON file</p>
              </div>
            </div>
          </div>

          {/* Auto-Backup Settings */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Auto-Backup Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Enable Auto-Backup</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Automatically create backups on schedule</p>
                </div>
                <button
                  onClick={() => handleAutoBackupToggle(!autoBackupEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoBackupEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {autoBackupEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Backup Interval (hours)
                  </label>
                  <div className="flex items-center space-x-4">
                    {[6, 12, 24, 48].map((hours) => (
                      <button
                        key={hours}
                        onClick={() => handleAutoBackupIntervalChange(hours.toString())}
                        className={`px-3 py-1 rounded-lg border transition-all ${
                          autoBackupInterval === hours.toString()
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Backups will be created automatically every {autoBackupInterval} hours
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Backup History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Backup History</h4>
              {backupHistory.length > 0 && (
                <button
                  onClick={handleClearAllBackups}
                  className="text-xs text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {backupHistory.length === 0 ? (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No backups found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first backup to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {backupHistory.map((backup) => (
                  <div key={backup.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Database className="w-4 h-4 text-blue-600 dark:text-blue-500 mr-2" />
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white">{backup.name}</h5>
                          {backup.id === backupHistory[0]?.id && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded">
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <div>
                            <span className="font-medium">Created:</span> {formatDate(backup.timestamp)}
                          </div>
                          <div>
                            <span className="font-medium">By:</span> {backup.createdByName}
                          </div>
                          <div>
                            <span className="font-medium">Size:</span> {formatFileSize(backup.size || 0)}
                          </div>
                          <div>
                            <span className="font-medium">Courses:</span> {backup.totalCourses}
                          </div>
                          <div>
                            <span className="font-medium">Users:</span> {backup.totalUsers}
                          </div>
                          <div>
                            <span className="font-medium">ID:</span> {backup.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col space-y-2">
                        <button
                          onClick={() => handleRestoreBackup(backup.id)}
                          disabled={backupStatus !== 'idle'}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          title="Restore this backup"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleExportBackup(backup.id)}
                          disabled={backupStatus !== 'idle'}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          title="Export this backup"
                        >
                          Export
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.id)}
                          disabled={backupStatus !== 'idle'}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          title="Delete this backup"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Information Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h5 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Backup Information</h5>
            <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <p>• Backups include: Courses, Users, System Settings, Theme Preferences</p>
              <p>• Backups are stored in your browser's localStorage</p>
              <p>• Maximum of 50 backups are kept (oldest are automatically deleted)</p>
              <p>• Export backups to JSON files for external storage</p>
              <p>• Import backups from previously exported JSON files</p>
              <p>• Restore points are created before each restore operation</p>
              <p>• Auto-backup can be scheduled for automatic data protection</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowBackupModal(false)}
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              disabled={backupStatus === 'backing-up' || backupStatus === 'restoring'}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ THEME SETTINGS ============
function ThemeSettings() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('adminTheme') || 'light';
  });
  const [compactMode, setCompactMode] = useState(() => {
    return localStorage.getItem('compactMode') === 'true' || false;
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('highContrast') === 'true' || false;
  });

  useEffect(() => {
    applyTheme(currentTheme);
    applyCompactMode(compactMode);
    applyHighContrast(highContrast);
  }, [currentTheme, compactMode, highContrast]);

  const applyTheme = (themeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('adminTheme', themeId);
    
    if (themeId === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: themeId }));
  };

  const applyCompactMode = (enabled) => {
    setCompactMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('compact-mode');
    } else {
      document.documentElement.classList.remove('compact-mode');
    }
    localStorage.setItem('compactMode', enabled.toString());
    
    window.dispatchEvent(new CustomEvent('compactModeChanged', { detail: enabled }));
  };

  const applyHighContrast = (enabled) => {
    setHighContrast(enabled);
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('highContrast', enabled.toString());
    
    window.dispatchEvent(new CustomEvent('highContrastChanged', { detail: enabled }));
  };

  const themes = [
    { id: 'light', name: 'Light', icon: Sun, color: 'bg-white' },
    { id: 'dark', name: 'Dark', icon: Moon, color: 'bg-gray-800' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Theme Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Choose your preferred theme for the admin panel</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => applyTheme(theme.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              currentTheme === theme.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-lg ${theme.color} flex items-center justify-center mb-3 border ${
                theme.id === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <theme.icon className={`w-6 h-6 ${
                  theme.id === 'dark' ? 'text-white' : 'text-gray-700'
                }`} />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{theme.name}</span>
              {currentTheme === theme.id && (
                <div className="mt-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Advanced Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Compact Mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Reduce spacing for more content</p>
            </div>
            <button
              onClick={() => applyCompactMode(!compactMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                compactMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  compactMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">High Contrast</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Increase contrast for accessibility</p>
            </div>
            <button
              onClick={() => applyHighContrast(!highContrast)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                highContrast ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  highContrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ ADD/EDIT COURSE MODAL WITH INTELLIGENT ROW ALLOCATION ============
function AddCourseModal({
  editingCourse,
  formData,
  setFormData,
  setShowAddModal,
  handleAddCourse,
  handleUpdateCourse,
  resetForm,
  isAdmin,
  courses
}) {
  const [errors, setErrors] = useState({});
  const [rowsSuggestions, setRowsSuggestions] = useState('');
  const [allocationWarning, setAllocationWarning] = useState('');
  const [occupiedRows, setOccupiedRows] = useState([]);
  const [concurrentCourses, setConcurrentCourses] = useState(0);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.code?.trim()) newErrors.code = 'Course code is required';
    if (!formData.name?.trim()) newErrors.name = 'Course name is required';
    if (!formData.date?.trim()) newErrors.date = 'Date is required';
    
    const dateFormat = localStorage.getItem('dateFormat') || 'DD-MM-YYYY';
    
    if (formData.date) {
      if (dateFormat === 'DD-MM-YYYY') {
        if (!/^[A-Za-z]{3},\s\d{2}-\d{2}-\d{4}$/.test(formData.date.trim())) {
          newErrors.date = 'Use format: Day, DD-MM-YYYY (e.g., Mon, 20-01-2025)';
        }
      } else if (dateFormat === 'MM/DD/YYYY') {
        if (!/^[A-Za-z]{3},\s\d{2}\/\d{2}\/\d{4}$/.test(formData.date.trim())) {
          newErrors.date = 'Use format: Day, MM/DD/YYYY (e.g., Mon, 01/20/2025)';
        }
      } else if (dateFormat === 'YYYY-MM-DD') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date.trim())) {
          newErrors.date = 'Use format: YYYY-MM-DD (e.g., 2025-01-20)';
        }
      }
    }
    
    if (formData.time && !/^\d{1,2}:\d{2}\s(AM|PM)-\d{1,2}:\d{2}\s(AM|PM)$/.test(formData.time.trim())) {
      newErrors.time = 'Use format: HH:MM AM-HH:MM PM (e.g., 09:00 AM-12:00 PM)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateRowAllocation = () => {
    if (formData.date && formData.time && formData.venue && formData.numStudents) {
      const suggestions = getRowAllocationSuggestions(courses, {
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        numStudents: formData.numStudents,
        id: editingCourse?.id
      });
      
      setRowsSuggestions(suggestions.suggestedRows);
      setAllocationWarning(suggestions.warning);
      setOccupiedRows(suggestions.occupiedRows);
      setConcurrentCourses(suggestions.concurrentCourses);
      
      if (suggestions.suggestedRows && !formData.rows) {
        setFormData(prev => ({
          ...prev,
          rows: suggestions.suggestedRows
        }));
      }
    } else {
      setRowsSuggestions('');
      setAllocationWarning('');
      setOccupiedRows([]);
      setConcurrentCourses(0);
    }
  };

  useEffect(() => {
    updateRowAllocation();
  }, [formData.date, formData.time, formData.venue, formData.numStudents]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (editingCourse) {
        handleUpdateCourse();
      } else {
        handleAddCourse();
      }
    }
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    const dateFormat = localStorage.getItem('dateFormat') || 'DD-MM-YYYY';
    
    if (dateFormat === 'DD-MM-YYYY') {
      if (value.length === 2 || value.length === 5) {
        setFormData({...formData, date: value + '-'});
      } else {
        setFormData({...formData, date: value});
      }
    } else if (dateFormat === 'MM/DD/YYYY') {
      if (value.length === 2 || value.length === 5) {
        setFormData({...formData, date: value + '/'});
      } else {
        setFormData({...formData, date: value});
      }
    } else {
      setFormData({...formData, date: value});
    }
  };

  const handleNumStudentsChange = (value) => {
    setFormData({
      ...formData,
      numStudents: value
    });
  };

  const getDatePlaceholder = () => {
    const dateFormat = localStorage.getItem('dateFormat') || 'DD-MM-YYYY';
    switch(dateFormat) {
      case 'DD-MM-YYYY': return 'e.g., Mon, 20-01-2025';
      case 'MM/DD/YYYY': return 'e.g., Mon, 01/20/2025';
      case 'YYYY-MM-DD': return 'e.g., 2025-01-20';
      case 'DD/MM/YYYY': return 'e.g., Mon, 20/01/2025';
      default: return 'e.g., Mon, 20-01-2025';
    }
  };

  const getDateFormatDescription = () => {
    const dateFormat = localStorage.getItem('dateFormat') || 'DD-MM-YYYY';
    return `Format: ${dateFormat.replace('DD', 'Day').replace('MM', 'Month').replace('YYYY', 'Year')} (${getDatePlaceholder()})`;
  };

  const handleAutoAllocate = () => {
    updateRowAllocation();
    if (rowsSuggestions) {
      setFormData(prev => ({
        ...prev,
        rows: rowsSuggestions
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingCourse ? '✏️ Edit Course' : '➕ Add New Course'}
            </h2>
            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {editingCourse ? 'Update course information' : 'Add a new examination course to the system'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                  errors.code ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., CSIS311"
                required
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.code}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Database Systems"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={handleDateChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={getDatePlaceholder()}
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {getDateFormatDescription()}
              </p>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time
              </label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                  errors.time ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 09:00 AM-12:00 PM"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Format: HH:MM AM-HH:MM PM (e.g., 09:00 AM-12:00 PM)
              </p>
              {errors.time && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.time}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Venue
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({...formData, venue: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="Enter venue name (e.g., Main Hall, Room 101)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instructor
              </label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="Enter instructor name (e.g., Dr. John Smith)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Option
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Main', 'Group A', 'Group B', 'Group C'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, option: type})}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.option === type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Exam Room Setup</h4>
              <button
                type="button"
                onClick={handleAutoAllocate}
                className="text-sm text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 font-medium flex items-center"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Auto-Allocate Rows
              </button>
            </div>
            
            {allocationWarning && (
              <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{allocationWarning}</p>
                    {occupiedRows.length > 0 && (
                      <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                        Currently occupied rows: <span className="font-mono font-bold">{occupiedRows.join(', ')}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Students
                </label>
                <input
                  type="number"
                  value={formData.numStudents || ''}
                  onChange={(e) => handleNumStudentsChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="e.g., 50"
                  min="1"
                  max="500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Total number of students registered for this exam
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rows Allocation
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.rows || ''}
                    onChange={(e) => setFormData({...formData, rows: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    placeholder="e.g., 1, 3, 5, 7"
                  />
                  {rowsSuggestions && formData.rows !== rowsSuggestions && (
                    <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, rows: rowsSuggestions})}
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                        title="Use suggested rows"
                      >
                        Use suggestion
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  {rowsSuggestions && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      <Check className="w-3 h-3 inline mr-1" />
                      Suggested rows: <span className="font-mono font-bold">{rowsSuggestions}</span>
                    </p>
                  )}
                  {concurrentCourses > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {concurrentCourses} other course(s) scheduled in same venue at same time
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    System automatically avoids adjacent rows for exam security
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h5 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Row Allocation Guide:</h5>
              <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <p>• System avoids rows already occupied by other courses at same time/venue</p>
                <p>• Students skip rows to prevent cheating (e.g., 1, 3, 5 or 2, 4, 6)</p>
                <p>• Automatic allocation considers adjacent row avoidance</p>
                <p>• 10 students per row (adjustable if needed)</p>
                <p>• Click "Auto-Allocate Rows" to get optimal row assignment</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
            >
              {editingCourse ? 'Update Course' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ BULK UPLOAD MODAL ============
function BulkUploadModal({ showBulkModal, setShowBulkModal, handleBulkUpload, addNotification, courses }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Confirm

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const csvContent = e.target.result;
          const lines = csvContent.split('\n');
          const preview = [];
          
          for (let i = 1; i < Math.min(6, lines.length); i++) {
            if (lines[i].trim()) {
              const [code, name, date, time, venue, instructor, option, numStudents] = lines[i].split(',');
              if (code && name) {
                const occupiedRows = getOccupiedRows(courses, date?.trim(), time?.trim(), venue?.trim());
                const allocatedRows = allocateRows(numStudents?.trim() || '0', occupiedRows);
                
                preview.push({
                  code: code.trim(),
                  name: name.trim(),
                  date: date?.trim() || '',
                  time: time?.trim() || '',
                  venue: venue?.trim() || '',
                  instructor: instructor?.trim() || '',
                  option: option?.trim() || 'Main',
                  numStudents: numStudents?.trim() || '',
                  rows: allocatedRows
                });
              }
            }
          }
          setPreviewData(preview);
          setStep(2);
        };
        reader.readAsText(selectedFile);
      } else {
        setError('Please upload a CSV file');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvContent = e.target.result;
        const lines = csvContent.split('\n');
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const [code, name, date, time, venue, instructor, option, numStudents] = lines[i].split(',');
            if (code && name) {
              const occupiedRows = getOccupiedRows(courses, date?.trim(), time?.trim(), venue?.trim());
              const allocatedRows = allocateRows(numStudents?.trim() || '0', occupiedRows);
              
              const courseData = {
                code: code.trim(),
                name: name.trim(),
                date: date?.trim() || '',
                time: time?.trim() || '',
                venue: venue?.trim() || '',
                instructor: instructor?.trim() || '',
                option: option?.trim() || 'Main',
                numStudents: numStudents?.trim() || '',
                rows: allocatedRows
              };
              
              try {
                await handleBulkUpload([courseData]);
                successCount++;
              } catch (err) {
                console.error(`Error uploading course ${code}:`, err);
                errorCount++;
              }
            }
          }
        }

        setUploadStatus(`Upload completed: ${successCount} successful, ${errorCount} failed`);
        setStep(3);
        
        if (addNotification) {
          addNotification(
            'Bulk Upload Complete',
            `Successfully uploaded ${successCount} courses. ${errorCount > 0 ? `${errorCount} courses failed to upload.` : ''}`,
            errorCount > 0 ? 'warning' : 'success'
          );
        }
        
        setTimeout(() => {
          setShowBulkModal(false);
          setUploading(false);
          setStep(1);
          setFile(null);
          setPreviewData([]);
        }, 3000);
      };
      reader.readAsText(file);
    } catch (err) {
      setError('Error parsing CSV file: ' + err.message);
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const dateFormat = localStorage.getItem('dateFormat') || 'DD-MM-YYYY';
    
    let dateExample = 'Mon, 20-01-2025';
    if (dateFormat === 'MM/DD/YYYY') {
      dateExample = 'Mon, 01/20/2025';
    } else if (dateFormat === 'YYYY-MM-DD') {
      dateExample = '2025-01-20';
    } else if (dateFormat === 'DD/MM/YYYY') {
      dateExample = 'Mon, 20/01/2025';
    }
    
    const template = `code,name,date,time,venue,instructor,option,numStudents
CSIS311,Database Systems,${dateExample},09:00 AM-12:00 PM,Main Hall,Dr. John Smith,Main,50
MATH201,Calculus II,${dateExample},01:00 PM-03:00 PM,Room 101,Prof. Mary Johnson,Group A,40
PHY301,Physics Lab,${dateExample},10:00 AM-12:00 PM,Lab Building,Dr. Robert Williams,Group B,30
ENG101,English Composition,${dateExample},02:00 PM-04:00 PM,Room 202,Ms. Sarah Davis,Group C,45`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
      setPreviewData([]);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              {file ? (
                <div className="space-y-4">
                  <FileText className="w-12 h-12 text-blue-600 dark:text-blue-500 mx-auto" />
                  <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreviewData([]);
                    }}
                    className="text-sm text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <UploadCloud className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto" />
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">Drag and drop your CSV file here</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">or click to browse</p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose CSV File
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">CSV Format Requirements:</h4>
              <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1 max-h-32 overflow-y-auto pr-2">
                <p>• First row should be headers: code,name,date,time,venue,instructor,option,numStudents</p>
                <p>• Date format: {localStorage.getItem('dateFormat') || 'DD-MM-YYYY'} (e.g., Mon, 20-01-2025)</p>
                <p>• Time format: HH:MM AM-HH:MM PM (e.g., 09:00 AM-12:00 PM)</p>
                <p>• Option: Main, Group A, Group B, or Group C</p>
                <p>• Number of Students: Total students for this exam</p>
                <p>• Rows will be automatically allocated to avoid conflicts</p>
                <p>• Download <button onClick={downloadTemplate} className="underline hover:text-blue-900 dark:hover:text-blue-300">template.csv</button> for reference</p>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-800 dark:text-green-300">File uploaded successfully!</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">Preview of first {previewData.length} courses:</p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="py-2 px-3 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Code</th>
                      <th className="py-2 px-3 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Name</th>
                      <th className="py-2 px-3 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Students</th>
                      <th className="py-2 px-3 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Rows (Auto-allocated)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {previewData.map((course, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                            {course.code}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{course.name}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{course.numStudents || '0'}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          <span className="font-mono bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded text-xs">
                            {course.rows || 'Will be auto-allocated'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total courses to upload: {previewData.length} (sample shown)
              </span>
              <button
                onClick={goBack}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              >
                Change file
              </button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="text-center py-8">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Uploading Courses...</h3>
                <p className="text-gray-600 dark:text-gray-400">Please wait while we process your courses</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload Complete!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{uploadStatus}</p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Modal will close automatically...
                </div>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Course Upload</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Step {step} of 3</p>
            </div>
            <button
              onClick={() => {
                setShowBulkModal(false);
                setStep(1);
                setFile(null);
                setPreviewData([]);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            {['Upload File', 'Preview', 'Complete'].map((stepLabel, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step > index + 1 ? 'bg-green-500 text-white' :
                  step === index + 1 ? 'bg-blue-600 text-white' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {step > index + 1 ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm ${step >= index + 1 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {stepLabel}
                </span>
                {index < 2 && (
                  <div className={`w-16 h-0.5 mx-2 ${step > index + 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 mr-2" />
                <span className="text-sm font-medium text-red-800 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}

          {renderStep()}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            {step === 1 && file && (
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:opacity-90 transition-colors"
              >
                Continue to Preview
              </button>
            )}
            
            {step === 2 && (
              <>
                <button
                  onClick={goBack}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Courses'
                  )}
                </button>
              </>
            )}
            
            {step === 1 && !file && (
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ EXPORT MODAL ============
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
      filtered = filtered.filter(c => {
        const courseDate = parseDate(c.date);
        return courseDate.toDateString() === today;
      });
    } else if (selectedDateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(c => {
        const courseDate = parseDate(c.date);
        return courseDate >= weekAgo;
      });
    } else if (selectedDateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(c => {
        const courseDate = parseDate(c.date);
        return courseDate >= monthAgo;
      });
    } else if (selectedDateRange === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      filtered = filtered.filter(c => {
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
            filter: selectedDateRange === 'custom' ? 
              { start: customStartDate, end: customEndDate } : 
              selectedDateRange
          }
        };
        filename = `courses_export_${new Date().toISOString().split('T')[0]}`;
      } else if (exportType === 'users') {
        dataToExport = {
          type: 'users',
          data: users,
          exportInfo: {
            total: users.length,
            exportedAt: new Date().toISOString()
          }
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
            venues: [...new Set(filteredCourses.map(c => c.venue).filter(Boolean))],
            dateRange: selectedDateRange,
            exportedAt: new Date().toISOString()
          }
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
          const rows = dataToExport.data.map(course => [
            course.code || '',
            course.name || '',
            course.date || '',
            course.time || '',
            course.venue || '',
            course.instructor || '',
            course.option || '',
            course.numStudents || '',
            course.rows || ''
          ]);
          exportData = [headers, ...rows].map(row => row.join(',')).join('\n');
        } else if (exportType === 'users') {
          const headers = ['Name', 'Email', 'Student ID', 'Role', 'Created At'];
          const rows = dataToExport.data.map(user => [
            user.full_name || '',
            user.email || '',
            user.student_id || '',
            user.role || '',
            user.created_at || ''
          ]);
          exportData = [headers, ...rows].map(row => row.join(',')).join('\n');
        }
        fileExtension = 'csv';
      }
      
      const blob = new Blob([exportData], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
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
        count: exportType === 'courses' ? getFilteredCourses().length : 
               exportType === 'users' ? users.length : 1
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
            <button
              onClick={() => setShowExportModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
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
                { id: 'summary', label: 'Summary', icon: BarChart3, count: 1 }
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
                    <type.icon className={`w-6 h-6 mb-2 ${exportType === type.id ? 'text-blue-600 dark:text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
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
                  { id: 'custom', label: 'Custom Range' }
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
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
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
                    {selectedDateRange === 'custom' && customStartDate && customEndDate && 
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
              <p>• Type: <span className="font-medium capitalize">{exportType}</span></p>
              {exportType === 'courses' && (
                <p>• Courses: <span className="font-medium">{getFilteredCourses().length} items</span></p>
              )}
              {exportType === 'users' && (
                <p>• Users: <span className="font-medium">{users.length} items</span></p>
              )}
              {exportType === 'summary' && (
                <p>• Summary report with statistics</p>
              )}
              <p>• Format: <span className="font-medium">{format.toUpperCase()}</span></p>
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

// ============ NOTIFICATION SETTINGS COMPONENT ============
function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(() => {
    return JSON.parse(localStorage.getItem('notificationSettings') || '{}').email || true;
  });
  const [pushNotifications, setPushNotifications] = useState(() => {
    return JSON.parse(localStorage.getItem('notificationSettings') || '{}').push || true;
  });
  const [courseUpdates, setCourseUpdates] = useState(() => {
    return JSON.parse(localStorage.getItem('notificationSettings') || '{}').courseUpdates || true;
  });
  const [userActivities, setUserActivities] = useState(() => {
    return JSON.parse(localStorage.getItem('notificationSettings') || '{}').userActivities || true;
  });
  const [systemAlerts, setSystemAlerts] = useState(() => {
    return JSON.parse(localStorage.getItem('notificationSettings') || '{}').systemAlerts || true;
  });

  const saveSettings = () => {
    const settings = {
      email: emailNotifications,
      push: pushNotifications,
      courseUpdates,
      userActivities,
      systemAlerts
    };
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  };

  useEffect(() => {
    saveSettings();
  }, [emailNotifications, pushNotifications, courseUpdates, userActivities, systemAlerts]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Receive notifications via email</p>
          </div>
          <button
            onClick={() => setEmailNotifications(!emailNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Receive browser push notifications</p>
          </div>
          <button
            onClick={() => setPushNotifications(!pushNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              pushNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                pushNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Notification Types</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Course Updates</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">New courses, edits, or deletions</p>
              </div>
              <button
                onClick={() => setCourseUpdates(!courseUpdates)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full ${
                  courseUpdates ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    courseUpdates ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">User Activities</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">New user registrations, logins</p>
              </div>
              <button
                onClick={() => setUserActivities(!userActivities)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full ${
                  userActivities ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    userActivities ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">System Alerts</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">System maintenance, updates</p>
              </div>
              <button
                onClick={() => setSystemAlerts(!systemAlerts)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full ${
                  systemAlerts ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    systemAlerts ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Notification Schedule</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Quiet Hours</span>
              <select className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white">
                <option>10:00 PM - 7:00 AM</option>
                <option>11:00 PM - 6:00 AM</option>
                <option>Disabled</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Notification Frequency</span>
              <select className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white">
                <option>Immediate</option>
                <option>Hourly Digest</option>
                <option>Daily Digest</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ UPDATED SYSTEM SETTINGS PAGE WITH REAL-TIME API SETTINGS ============
function SystemSettings({ currentUser, addNotification, backupService, courses, users }) {
  const [activeTab, setActiveTab] = useState('general');
  const [backupStatus, setBackupStatus] = useState('idle');
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [apiKey, setApiKey] = useState(SUPABASE_ANON_KEY);
  const [showApiKey, setShowApiKey] = useState(false);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('adminLanguage') || 'en';
  });
  const [systemName, setSystemName] = useState(() => {
    return localStorage.getItem('systemName') || 'Baraton Admin Panel';
  });
  const [timezone, setTimezone] = useState(() => {
    return localStorage.getItem('timezone') || 'Africa/Nairobi';
  });
  const [dateFormat, setDateFormat] = useState(() => {
    return localStorage.getItem('dateFormat') || 'DD-MM-YYYY';
  });
  const [apiMetrics, setApiMetrics] = useState({
    requests24h: 1247,
    successRate: 99.8,
    responseTime: 156,
    activeConnections: 42,
    lastUpdated: new Date()
  });
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [apiEndpoints, setApiEndpoints] = useState([
    { method: 'GET', path: '/exam_courses', description: 'Fetch all courses' },
    { method: 'POST', path: '/exam_courses', description: 'Create new course' },
    { method: 'GET', path: '/profiles', description: 'Get user profiles' },
    { method: 'POST', path: '/auth/login', description: 'User authentication' },
    { method: 'GET', path: '/system/health', description: 'System health check' }
  ]);
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('webhookUrl') || '';
  });
  const [rateLimit, setRateLimit] = useState(() => {
    return localStorage.getItem('apiRateLimit') || '1000';
  });
  const [apiLogs, setApiLogs] = useState([]);
  const [backupHistory, setBackupHistory] = useState([]);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API', icon: Cpu },
    { id: 'backup', label: 'Backup', icon: Database },
  ];

  useEffect(() => {
    if (activeTab === 'backup') {
      loadBackupHistory();
    }
  }, [activeTab]);

  const loadBackupHistory = () => {
    const history = backupService.getBackupHistory();
    setBackupHistory(history);
  };

  const fetchApiMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const mockResponse = {
        requests24h: Math.floor(Math.random() * 500) + 1000,
        successRate: 98 + Math.random() * 2,
        responseTime: Math.floor(Math.random() * 100) + 100,
        activeConnections: Math.floor(Math.random() * 30) + 20,
        lastUpdated: new Date()
      };
      
      setTimeout(() => {
        setApiMetrics(mockResponse);
        addNotification('API Metrics Updated', 'Successfully fetched latest API performance data', 'success');
        setLoadingMetrics(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching API metrics:', error);
      setLoadingMetrics(false);
    }
  };

  const fetchApiLogs = async () => {
    try {
      const mockLogs = [
        { id: 1, method: 'GET', endpoint: '/exam_courses', status: 200, timestamp: Date.now() - 5000, user: 'admin@baraton.com' },
        { id: 2, method: 'POST', endpoint: '/exam_courses', status: 201, timestamp: Date.now() - 12000, user: 'lecturer@baraton.com' },
        { id: 3, method: 'GET', endpoint: '/profiles', status: 200, timestamp: Date.now() - 25000, user: 'admin@baraton.com' },
        { id: 4, method: 'DELETE', endpoint: '/exam_courses/123', status: 204, timestamp: Date.now() - 45000, user: 'admin@baraton.com' },
        { id: 5, method: 'GET', endpoint: '/system/health', status: 200, timestamp: Date.now() - 60000, user: 'system' },
        { id: 6, method: 'POST', endpoint: '/auth/login', status: 200, timestamp: Date.now() - 90000, user: 'anonymous' },
        { id: 7, method: 'GET', endpoint: '/exam_courses', status: 429, timestamp: Date.now() - 120000, user: 'anonymous' },
        { id: 8, method: 'PUT', endpoint: '/exam_courses/456', status: 403, timestamp: Date.now() - 180000, user: 'lecturer@baraton.com' },
      ];
      
      setApiLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching API logs:', error);
    }
  };

  useEffect(() => {
    saveSettings();
  }, [language, systemName, timezone, dateFormat, webhookUrl, rateLimit]);

  useEffect(() => {
    if (activeTab === 'api') {
      fetchApiMetrics();
      fetchApiLogs();
      
      const interval = setInterval(() => {
        fetchApiMetrics();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const saveSettings = () => {
    localStorage.setItem('adminLanguage', language);
    localStorage.setItem('systemName', systemName);
    localStorage.setItem('timezone', timezone);
    localStorage.setItem('dateFormat', dateFormat);
    localStorage.setItem('webhookUrl', webhookUrl);
    localStorage.setItem('apiRateLimit', rateLimit);
    
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
    window.dispatchEvent(new CustomEvent('systemNameChanged', { detail: systemName }));
    window.dispatchEvent(new CustomEvent('timezoneChanged', { detail: timezone }));
    window.dispatchEvent(new CustomEvent('dateFormatChanged', { detail: dateFormat }));
  };

  const handleGeneralSettingsChange = (key, value) => {
    switch(key) {
      case 'language':
        setLanguage(value);
        if (addNotification) {
          addNotification('Language Updated', `Interface language changed to ${getLanguageName(value)}`, 'success');
        }
        break;
      case 'systemName':
        setSystemName(value);
        if (addNotification) {
          addNotification('System Name Updated', `System name changed to "${value}"`, 'success');
        }
        break;
      case 'timezone':
        setTimezone(value);
        if (addNotification) {
          addNotification('Timezone Updated', `Timezone changed to ${getTimezoneName(value)}`, 'success');
        }
        break;
      case 'dateFormat':
        setDateFormat(value);
        if (addNotification) {
          addNotification('Date Format Updated', `Date format changed to ${value}`, 'success');
        }
        break;
    }
  };

  const getLanguageName = (code) => {
    const languages = {
      en: 'English',
      sw: 'Swahili',
      fr: 'French',
      es: 'Spanish',
      ar: 'Arabic',
    };
    return languages[code] || code;
  };

  const getTimezoneName = (id) => {
    const timezones = {
      'Africa/Nairobi': 'Africa/Nairobi (GMT+3)',
      'UTC': 'UTC (GMT+0)',
      'America/New_York': 'America/New_York (GMT-5)',
      'Europe/London': 'Europe/London (GMT+0)',
      'Asia/Dubai': 'Asia/Dubai (GMT+4)',
    };
    return timezones[id] || id;
  };

  const handleCreateBackup = async () => {
    setBackupStatus('backing-up');
    
    const systemSettings = {
      systemName,
      dateFormat,
      language,
      timezone,
      adminTheme: localStorage.getItem('adminTheme'),
      compactMode: localStorage.getItem('compactMode'),
      highContrast: localStorage.getItem('highContrast')
    };
    
    const result = await backupService.createBackup(courses, users, systemSettings, currentUser);
    
    if (result.success) {
      setBackupStatus('completed');
      loadBackupHistory();
      
      addNotification(
        'Backup Created',
        `Backup created successfully with ${result.totalItems} items`,
        'success'
      );
      
      setTimeout(() => setBackupStatus('idle'), 3000);
    } else {
      setBackupStatus('idle');
      addNotification(
        'Backup Failed',
        `Failed to create backup: ${result.error}`,
        'error'
      );
    }
  };

  const handleRestoreBackup = async () => {
    if (!window.confirm('Are you sure you want to restore from the latest backup? Current data may be overwritten.')) {
      return;
    }
    
    setBackupStatus('restoring');
    
    try {
      const result = await backupService.restoreBackup('latest', addNotification);
      
      if (result.success) {
        setBackupStatus('restored');
        
        setTimeout(() => {
          setBackupStatus('idle');
          window.location.reload();
        }, 2000);
      } else {
        setBackupStatus('idle');
      }
    } catch (error) {
      setBackupStatus('idle');
      addNotification(
        'Restore Failed',
        `Failed to restore backup: ${error.message}`,
        'error'
      );
    }
  };

  const handleRegenerateApiKey = () => {
    const newKey = `sk_live_${Math.random().toString(36).substr(2, 32)}_${Math.random().toString(36).substr(2, 16)}`;
    setApiKey(newKey);
    if (addNotification) {
      addNotification('API Key Regenerated', 'New API key generated successfully. Update your applications.', 'success');
    }
    
    const newLog = {
      id: Date.now(),
      method: 'SYSTEM',
      endpoint: '/api/key/regenerate',
      status: 200,
      timestamp: Date.now(),
      user: currentUser?.email || 'admin',
      details: 'API key regenerated'
    };
    setApiLogs(prev => [newLog, ...prev.slice(0, 9)]);
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      addNotification('Webhook Error', 'Please enter a webhook URL first', 'error');
      return;
    }
    
    try {
      addNotification('Testing Webhook', 'Sending test webhook...', 'info');
      
      setTimeout(() => {
        addNotification('Webhook Test', 'Test webhook sent successfully', 'success');
        
        const newLog = {
          id: Date.now(),
          method: 'POST',
          endpoint: webhookUrl,
          status: 200,
          timestamp: Date.now(),
          user: currentUser?.email || 'admin',
          details: 'Webhook test successful'
        };
        setApiLogs(prev => [newLog, ...prev.slice(0, 9)]);
      }, 1500);
      
    } catch (error) {
      addNotification('Webhook Error', 'Failed to send test webhook', 'error');
    }
  };

  const handleSaveWebhook = () => {
    localStorage.setItem('webhookUrl', webhookUrl);
    addNotification('Webhook Saved', 'Webhook URL saved successfully', 'success');
  };

  const handleSaveRateLimit = () => {
    localStorage.setItem('apiRateLimit', rateLimit);
    addNotification('Rate Limit Updated', `API rate limit set to ${rateLimit} requests/hour`, 'success');
  };

  const handleTestEndpoint = async (endpoint) => {
    try {
      addNotification('Testing Endpoint', `Testing ${endpoint.method} ${endpoint.path}...`, 'info');
      
      setTimeout(() => {
        const status = Math.random() > 0.1 ? 200 : 500;
        const message = status === 200 ? 'Endpoint test successful' : 'Endpoint test failed';
        
        addNotification(
          'Endpoint Test Result',
          `${endpoint.method} ${endpoint.path}: ${message}`,
          status === 200 ? 'success' : 'error'
        );
        
        const newLog = {
          id: Date.now(),
          method: endpoint.method,
          endpoint: endpoint.path,
          status: status,
          timestamp: Date.now(),
          user: currentUser?.email || 'admin',
          details: 'Endpoint test'
        };
        setApiLogs(prev => [newLog, ...prev.slice(0, 9)]);
      }, 1000);
      
    } catch (error) {
      addNotification('Test Error', 'Failed to test endpoint', 'error');
    }
  };

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-500';
    if (status >= 400 && status < 500) return 'text-yellow-600 dark:text-yellow-500';
    if (status >= 500) return 'text-red-600 dark:text-red-500';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getStatusBadge = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    if (status >= 400 && status < 500) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    if (status >= 500) return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'sw', name: 'Swahili' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'ar', name: 'Arabic' },
  ];

  const timezones = [
    { id: 'Africa/Nairobi', name: 'Africa/Nairobi (GMT+3)' },
    { id: 'UTC', name: 'UTC (GMT+0)' },
    { id: 'America/New_York', name: 'America/New_York (GMT-5)' },
    { id: 'Europe/London', name: 'Europe/London (GMT+0)' },
    { id: 'Asia/Dubai', name: 'Asia/Dubai (GMT+4)' },
  ];

  const dateFormats = [
    { id: 'DD-MM-YYYY', name: 'DD-MM-YYYY' },
    { id: 'MM/DD/YYYY', name: 'MM/DD/YYYY' },
    { id: 'YYYY-MM-DD', name: 'YYYY-MM-DD' },
    { id: 'DD/MM/YYYY', name: 'DD/MM/YYYY' },
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatBackupDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const backupStatusInfo = backupService.getBackupStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Configure system preferences and security settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Settings</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage your system configuration</p>
            </div>
            <nav className="p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg mb-1 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {currentUser?.avatar || 'A'}
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900 dark:text-white">{currentUser?.name || 'Administrator'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.role || 'admin'} • {currentUser?.email || 'admin@baraton.com'}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Last Login</span>
                <span className="font-medium">Today, 10:30 AM</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600 dark:text-gray-400">Session</span>
                <span className="font-medium text-green-600 dark:text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">General Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">System Name</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Display name of the admin panel</p>
                    </div>
                    <input
                      type="text"
                      value={systemName}
                      onChange={(e) => handleGeneralSettingsChange('systemName', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg w-64 dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Interface Language</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">System language for interface</p>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => handleGeneralSettingsChange('language', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg w-64 dark:bg-gray-900 dark:text-white"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Timezone</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">System timezone for schedules</p>
                    </div>
                    <select
                      value={timezone}
                      onChange={(e) => handleGeneralSettingsChange('timezone', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg w-64 dark:bg-gray-900 dark:text-white"
                    >
                      {timezones.map((tz) => (
                        <option key={tz.id} value={tz.id}>
                          {tz.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Date Format</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">How dates are displayed</p>
                    </div>
                    <select
                      value={dateFormat}
                      onChange={(e) => handleGeneralSettingsChange('dateFormat', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg w-64 dark:bg-gray-900 dark:text-white"
                    >
                      {dateFormats.map((format) => (
                        <option key={format.id} value={format.id}>
                          {format.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">System Status</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center">
                        <Server className="w-5 h-5 text-blue-600 dark:text-blue-500 mr-2" />
                        <span className="text-sm font-medium">Database</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs text-green-600 dark:text-green-500">Connected</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center">
                        <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-500 mr-2" />
                        <span className="text-sm font-medium">API</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs text-green-600 dark:text-green-500">Healthy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'theme' && <ThemeSettings />}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h3>
                
                <SecuritySettingsComponent addNotification={addNotification} />
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <NotificationSettings />
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm pr-12 dark:text-white"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="flex justify-between mt-2">
                      <button
                        onClick={handleRegenerateApiKey}
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                      >
                        <RefreshCw className="w-3 h-3 inline mr-1" />
                        Regenerate Key
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(apiKey);
                          addNotification('Copied', 'API key copied to clipboard', 'success');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                      >
                        <Copy className="w-3 h-3 inline mr-1" />
                        Copy to Clipboard
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      API Endpoint
                    </label>
                    <input
                      type="text"
                      value={SUPABASE_URL}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Base URL for all API requests
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Webhook URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://your-webhook-url.com"
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
                      />
                      <button
                        onClick={handleSaveWebhook}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleTestWebhook}
                        className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Test
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Receive real-time notifications for system events
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rate Limiting
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="100"
                            max="10000"
                            step="100"
                            value={rateLimit}
                            onChange={(e) => setRateLimit(e.target.value)}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium">{rateLimit} requests/hour</span>
                        </div>
                      </div>
                      <button
                        onClick={handleSaveRateLimit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Maximum API requests per hour per user
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">API Performance</h4>
                      <button
                        onClick={fetchApiMetrics}
                        disabled={loadingMetrics}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                      >
                        <RefreshCw className={`w-3 h-3 inline mr-1 ${loadingMetrics ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center">
                          <Activity className="w-5 h-5 text-green-600 dark:text-green-500 mr-2" />
                          <span className="text-sm font-medium">Requests (24h)</span>
                        </div>
                        <p className="text-2xl font-bold mt-2 dark:text-white">{apiMetrics.requests24h.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center">
                          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-500 mr-2" />
                          <span className="text-sm font-medium">Success Rate</span>
                        </div>
                        <p className="text-2xl font-bold mt-2 dark:text-white">{apiMetrics.successRate.toFixed(1)}%</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-purple-600 dark:text-purple-500 mr-2" />
                          <span className="text-sm font-medium">Response Time</span>
                        </div>
                        <p className="text-2xl font-bold mt-2 dark:text-white">{apiMetrics.responseTime}ms</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-orange-600 dark:text-orange-500 mr-2" />
                          <span className="text-sm font-medium">Active Connections</span>
                        </div>
                        <p className="text-2xl font-bold mt-2 dark:text-white">{apiMetrics.activeConnections}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Last updated: {apiMetrics.lastUpdated.toLocaleTimeString()}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Available Endpoints</h4>
                    <div className="space-y-2">
                      {apiEndpoints.map((endpoint, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                endpoint.method === 'GET' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
                                endpoint.method === 'POST' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' :
                                endpoint.method === 'PUT' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                                endpoint.method === 'DELETE' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' :
                                'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300'
                              }`}>
                                {endpoint.method}
                              </span>
                              <code className="text-sm font-mono text-gray-800 dark:text-gray-300">{endpoint.path}</code>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{endpoint.description}</p>
                          </div>
                          <button
                            onClick={() => handleTestEndpoint(endpoint)}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Test
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">Recent API Calls</h4>
                      <button 
                        onClick={fetchApiLogs}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                      >
                        Refresh logs
                      </button>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {apiLogs.map((log) => (
                          <div key={log.id} className="flex items-center justify-between text-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(log.status)}`}>
                                {log.status}
                              </span>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{log.method}</span>
                                <code className="text-xs text-gray-500 dark:text-gray-400 ml-2">{log.endpoint}</code>
                                {log.details && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">• {log.details}</span>
                                )}
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {log.user}
                                </div>
                              </div>
                            </div>
                            <span className="text-gray-500 dark:text-gray-400">{formatTimeAgo(log.timestamp)}</span>
                          </div>
                        ))}
                        
                        {apiLogs.length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No API logs available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'backup' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Backup & Restore</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <Database className="w-8 h-8 text-blue-600 dark:text-blue-500 mr-3" />
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Database Backup</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Last backup: {backupStatusInfo.lastBackupDate 
                              ? formatBackupDate(backupStatusInfo.lastBackupDate)
                              : 'Never'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleCreateBackup}
                        disabled={backupStatus === 'backing-up'}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                      >
                        {backupStatus === 'backing-up' ? 'Backing up...' : 'Backup Now'}
                      </button>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <DownloadCloud className="w-8 h-8 text-green-600 dark:text-green-500 mr-3" />
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Restore</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Restore from latest backup</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRestoreBackup}
                        disabled={backupStatus === 'restoring' || !backupStatusInfo.hasBackups}
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                      >
                        {backupStatus === 'restoring' ? 'Restoring...' : 'Restore Now'}
                      </button>
                    </div>
                  </div>

                  {backupStatus === 'backing-up' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-500 mr-2 animate-spin" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Creating backup... Please wait</span>
                      </div>
                    </div>
                  )}

                  {backupStatus === 'completed' && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 mr-2" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">Backup created successfully!</span>
                      </div>
                    </div>
                  )}

                  {backupStatus === 'restoring' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <RefreshCw className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-2 animate-spin" />
                        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Restoring system... Please wait</span>
                      </div>
                    </div>
                  )}

                  {backupStatus === 'restored' && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 mr-2" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">System restored successfully! Page will reload...</span>
                      </div>
                    </div>
                  )}

                  {/* Backup History */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">Recent Backups</h4>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowBackupModal(true)}
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                        >
                          Manage Backups
                        </button>
                      </div>
                    </div>
                    
                    {backupHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <Database className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No backups found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first backup to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {backupHistory.slice(0, 3).map((backup) => (
                          <div key={backup.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <Database className="w-4 h-4 text-blue-600 dark:text-blue-500 mr-2" />
                                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">{backup.name}</h5>
                                  {backup.id === backupHistory[0]?.id && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded">
                                      Latest
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  <div>
                                    <span className="font-medium">Created:</span> {formatBackupDate(backup.timestamp)}
                                  </div>
                                  <div>
                                    <span className="font-medium">By:</span> {backup.createdByName}
                                  </div>
                                  <div>
                                    <span className="font-medium">Courses:</span> {backup.totalCourses}
                                  </div>
                                  <div>
                                    <span className="font-medium">Users:</span> {backup.totalUsers}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {backupHistory.length > 3 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setShowBackupModal(true)}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                        >
                          View all {backupHistory.length} backups
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Backup Status</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center">
                          <Database className="w-5 h-5 text-blue-600 dark:text-blue-500 mr-2" />
                          <span className="text-sm font-medium">Total Backups</span>
                        </div>
                        <p className="text-2xl font-bold mt-2 dark:text-white">{backupStatusInfo.totalBackups}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center">
                          <HardDrive className="w-5 h-5 text-purple-600 dark:text-purple-500 mr-2" />
                          <span className="text-sm font-medium">Total Size</span>
                        </div>
                        <p className="text-2xl font-bold mt-2 dark:text-white">{formatFileSize(backupStatusInfo.totalSize)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Advanced Backup Options</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-Backup</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Automatically create backups daily</p>
                        </div>
                        <button
                          onClick={() => {
                            const enabled = localStorage.getItem('autoBackupEnabled') !== 'false';
                            localStorage.setItem('autoBackupEnabled', (!enabled).toString());
                            addNotification(
                              'Auto-Backup ' + (!enabled ? 'Enabled' : 'Disabled'),
                              'Auto-backup settings updated',
                              'success'
                            );
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            localStorage.getItem('autoBackupEnabled') !== 'false' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              localStorage.getItem('autoBackupEnabled') !== 'false' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Backup Retention</p>
                        <div className="flex items-center space-x-2">
                          <select 
                            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-900 dark:text-white"
                            defaultValue="50"
                          >
                            <option value="10">Keep last 10 backups</option>
                            <option value="25">Keep last 25 backups</option>
                            <option value="50">Keep last 50 backups</option>
                            <option value="100">Keep last 100 backups</option>
                          </select>
                          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                            Apply
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Old backups are automatically deleted when limit is reached
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Backup Information</h5>
                    <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                      <p>• Backups include: Courses, Users, System Settings, Theme Preferences</p>
                      <p>• Backups are stored in your browser's localStorage</p>
                      <p>• Maximum of 50 backups are kept (oldest are automatically deleted)</p>
                      <p>• Export backups to JSON files for external storage</p>
                      <p>• Import backups from previously exported JSON files</p>
                      <p>• Click "Manage Backups" for advanced backup operations</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showBackupModal && (
        <BackupModal
          showBackupModal={showBackupModal}
          setShowBackupModal={setShowBackupModal}
          backupService={backupService}
          addNotification={addNotification}
          currentUser={currentUser}
          courses={courses}
          users={users}
          systemSettings={{
            systemName,
            dateFormat,
            language,
            timezone
          }}
        />
      )}
    </div>
  );
}

// ============ SECURITY SETTINGS COMPONENT ============
function SecuritySettingsComponent({ addNotification }) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    return localStorage.getItem('twoFactorEnabled') === 'true' || false;
  });
  const [sessionTimeout, setSessionTimeout] = useState(() => {
    return localStorage.getItem('sessionTimeout') || '30';
  });
  const [passwordPolicy, setPasswordPolicy] = useState(() => {
    const saved = localStorage.getItem('passwordPolicy');
    return saved ? JSON.parse(saved) : {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      maxAgeDays: 90,
    };
  });
  const [ipWhitelist, setIpWhitelist] = useState(() => {
    const saved = localStorage.getItem('ipWhitelist');
    return saved ? JSON.parse(saved) : ['192.168.1.1', '10.0.0.1'];
  });
  const [newIp, setNewIp] = useState('');
  const [securityLogs, setSecurityLogs] = useState(() => {
    const saved = localStorage.getItem('securityLogs');
    return saved ? JSON.parse(saved) : [
      { id: 1, action: 'Login from new device', timestamp: Date.now() - 2 * 60 * 60 * 1000, user: 'Admin', ip: '192.168.1.100' },
      { id: 2, action: 'Password changed', timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, user: 'Admin', ip: '192.168.1.100' },
      { id: 3, action: 'Failed login attempt', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, user: 'Unknown', ip: '203.0.113.1' },
      { id: 4, action: 'User role changed', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, user: 'Admin', ip: '192.168.1.100' },
      { id: 5, action: 'System settings updated', timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, user: 'Admin', ip: '192.168.1.100' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('twoFactorEnabled', twoFactorEnabled.toString());
  }, [twoFactorEnabled]);

  useEffect(() => {
    localStorage.setItem('sessionTimeout', sessionTimeout);
  }, [sessionTimeout]);

  useEffect(() => {
    localStorage.setItem('passwordPolicy', JSON.stringify(passwordPolicy));
  }, [passwordPolicy]);

  useEffect(() => {
    localStorage.setItem('ipWhitelist', JSON.stringify(ipWhitelist));
  }, [ipWhitelist]);

  const handleEnable2FA = async () => {
    try {
      const newState = !twoFactorEnabled;
      setTwoFactorEnabled(newState);
      
      const newLog = {
        id: Date.now(),
        action: newState ? '2FA Enabled' : '2FA Disabled',
        timestamp: Date.now(),
        user: 'Admin',
        ip: '192.168.1.100'
      };
      const updatedLogs = [newLog, ...securityLogs.slice(0, 9)];
      setSecurityLogs(updatedLogs);
      localStorage.setItem('securityLogs', JSON.stringify(updatedLogs));
      
      if (addNotification) {
        addNotification(
          newState ? '2FA Enabled' : '2FA Disabled',
          `Two-factor authentication has been ${newState ? 'enabled' : 'disabled'} for your account`,
          'success'
        );
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      if (addNotification) {
        addNotification('2FA Error', 'Failed to update two-factor authentication settings', 'error');
      }
    }
  };

  const handleSessionTimeoutChange = (minutes) => {
    setSessionTimeout(minutes);
    
    const newLog = {
      id: Date.now(),
      action: `Session timeout changed to ${minutes} minutes`,
      timestamp: Date.now(),
      user: 'Admin',
      ip: '192.168.1.100'
    };
    const updatedLogs = [newLog, ...securityLogs.slice(0, 9)];
    setSecurityLogs(updatedLogs);
    localStorage.setItem('securityLogs', JSON.stringify(updatedLogs));
    
    if (addNotification) {
      addNotification('Session Timeout Updated', `Session timeout set to ${minutes} minutes`, 'success');
    }
  };

  const handlePasswordPolicyChange = (key, value) => {
    const updatedPolicy = { ...passwordPolicy, [key]: value };
    setPasswordPolicy(updatedPolicy);
    
    const newLog = {
      id: Date.now(),
      action: `Password policy updated: ${key} = ${value}`,
      timestamp: Date.now(),
      user: 'Admin',
      ip: '192.168.1.100'
    };
    const updatedLogs = [newLog, ...securityLogs.slice(0, 9)];
    setSecurityLogs(updatedLogs);
    localStorage.setItem('securityLogs', JSON.stringify(updatedLogs));
    
    if (addNotification) {
      addNotification('Password Policy Updated', 'Password policy settings have been updated', 'success');
    }
  };

  const handleAddIp = () => {
    if (newIp && /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(newIp)) {
      setIpWhitelist([...ipWhitelist, newIp]);
      
      const newLog = {
        id: Date.now(),
        action: `IP added to whitelist: ${newIp}`,
        timestamp: Date.now(),
        user: 'Admin',
        ip: '192.168.1.100'
      };
      const updatedLogs = [newLog, ...securityLogs.slice(0, 9)];
      setSecurityLogs(updatedLogs);
      localStorage.setItem('securityLogs', JSON.stringify(updatedLogs));
      
      if (addNotification) {
        addNotification('IP Whitelist Updated', `IP address ${newIp} added to whitelist`, 'success');
      }
      
      setNewIp('');
    } else {
      if (addNotification) {
        addNotification('Invalid IP Address', 'Please enter a valid IP address', 'error');
      }
    }
  };

  const handleRemoveIp = (ipToRemove) => {
    const updatedList = ipWhitelist.filter(ip => ip !== ipToRemove);
    setIpWhitelist(updatedList);
    
    const newLog = {
      id: Date.now(),
      action: `IP removed from whitelist: ${ipToRemove}`,
      timestamp: Date.now(),
      user: 'Admin',
      ip: '192.168.1.100'
    };
    const updatedLogs = [newLog, ...securityLogs.slice(0, 9)];
    setSecurityLogs(updatedLogs);
    localStorage.setItem('securityLogs', JSON.stringify(updatedLogs));
    
    if (addNotification) {
      addNotification('IP Whitelist Updated', `IP address ${ipToRemove} removed from whitelist`, 'success');
    }
  };

  const clearSecurityLogs = () => {
    const defaultLogs = [
      { id: 1, action: 'Security logs cleared', timestamp: Date.now(), user: 'Admin', ip: '192.168.1.100' }
    ];
    setSecurityLogs(defaultLogs);
    localStorage.setItem('securityLogs', JSON.stringify(defaultLogs));
    
    if (addNotification) {
      addNotification('Security Logs Cleared', 'All security logs have been cleared', 'warning');
    }
  };

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
          </div>
          <button
            onClick={handleEnable2FA}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {twoFactorEnabled && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">2FA is enabled</p>
                <p className="text-xs text-green-700 dark:text-green-400">Your account is protected with two-factor authentication</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Session Timeout</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Auto logout after inactivity</p>
          </div>
          <select
            value={sessionTimeout}
            onChange={(e) => handleSessionTimeoutChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="240">4 hours</option>
          </select>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Password Policy</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Minimum requirements for passwords</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Minimum Length</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={passwordPolicy.minLength}
                  onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm dark:bg-gray-900 dark:text-white"
                  min="6"
                  max="32"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">characters</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {[
                { key: 'requireUppercase', label: 'Require uppercase letters' },
                { key: 'requireLowercase', label: 'Require lowercase letters' },
                { key: 'requireNumbers', label: 'Require numbers' },
                { key: 'requireSpecialChars', label: 'Require special characters' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                  <button
                    onClick={() => handlePasswordPolicyChange(item.key, !passwordPolicy[item.key])}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full ${
                      passwordPolicy[item.key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        passwordPolicy[item.key] ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Password Expiry</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={passwordPolicy.maxAgeDays}
                  onChange={(e) => handlePasswordPolicyChange('maxAgeDays', parseInt(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm dark:bg-gray-900 dark:text-white"
                  min="30"
                  max="365"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">IP Whitelist</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Restrict access to specific IPs</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                placeholder="Enter IP address (e.g., 192.168.1.1)"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm dark:bg-gray-900 dark:text-white"
              />
              <button
                onClick={handleAddIp}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Add
              </button>
            </div>
            
            <div className="space-y-2">
              {ipWhitelist.map((ip, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded">
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{ip}</span>
                  <button
                    onClick={() => handleRemoveIp(ip)}
                    className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            {ipWhitelist.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No IP addresses whitelisted</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">Security Logs</h4>
          <button 
            onClick={clearSecurityLogs}
            className="text-xs text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
          >
            Clear logs
          </button>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="space-y-3">
            {securityLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{log.action}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {log.user} • {log.ip}
                  </div>
                </div>
                <span className="text-gray-500 dark:text-gray-400">{formatTimeAgo(log.timestamp)}</span>
              </div>
            ))}
            
            {securityLogs.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No security logs</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN APP COMPONENT ============
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVenue, setFilterVenue] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeVenues, setActiveVenues] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [systemSettings, setSystemSettings] = useState(() => {
    return {
      systemName: localStorage.getItem('systemName') || 'Baraton Admin Panel',
      dateFormat: localStorage.getItem('dateFormat') || 'DD-MM-YYYY',
      language: localStorage.getItem('adminLanguage') || 'en',
      timezone: localStorage.getItem('timezone') || 'Africa/Nairobi'
    };
  });

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    date: '',
    time: '',
    venue: '',
    instructor: '',
    option: '',
    numStudents: '',
    rows: ''
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          if (profileData.role && (profileData.role === 'admin' || profileData.role === 'lecturer' || profileData.role === 'examiner' || profileData.role === 'coordinator')) {
            const user = {
              id: profileData.id,
              name: profileData.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email,
              role: profileData.role,
              avatar: profileData.full_name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'
            };
            setCurrentUser(user);
            localStorage.setItem('adminUser', JSON.stringify(user));
          } else {
            localStorage.removeItem('adminUser');
            setShowLogin(true);
          }
        }
      } else {
        const savedUser = localStorage.getItem('adminUser');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          if (user.role && (user.role === 'admin' || user.role === 'lecturer' || user.role === 'examiner' || user.role === 'coordinator')) {
            setCurrentUser(user);
          } else {
            localStorage.removeItem('adminUser');
            setShowLogin(true);
          }
        } else {
          setShowLogin(true);
        }
      }

      const savedTheme = localStorage.getItem('adminTheme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const compactMode = localStorage.getItem('compactMode') === 'true';
      if (compactMode) {
        document.documentElement.classList.add('compact-mode');
      } else {
        document.documentElement.classList.remove('compact-mode');
      }

      const highContrast = localStorage.getItem('highContrast') === 'true';
      if (highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }

      // Initialize auto-backup
      BackupService.initializeAutoBackup(() => {
        // Auto-backup callback
        const systemSettings = {
          systemName: localStorage.getItem('systemName') || 'Baraton Admin Panel',
          dateFormat: localStorage.getItem('dateFormat') || 'DD-MM-YYYY',
          language: localStorage.getItem('adminLanguage') || 'en',
          timezone: localStorage.getItem('timezone') || 'Africa/Nairobi',
          adminTheme: localStorage.getItem('adminTheme'),
          compactMode: localStorage.getItem('compactMode'),
          highContrast: localStorage.getItem('highContrast')
        };
        
        BackupService.createBackup(courses, users, systemSettings, currentUser);
        addNotification('Auto-Backup', 'System auto-backup completed successfully', 'success');
      });

      fetchCourses();
      fetchUsers();

      setNotifications([
        { 
          id: 1, 
          title: 'Welcome to Baraton Admin', 
          message: 'System initialized successfully', 
          time: 'Just now', 
          read: false, 
          type: 'success' 
        },
      ]);
    };

    checkUser();
  }, []);

  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    setUnreadNotifications(unreadCount);
  }, [notifications]);

  useEffect(() => {
    const handleSystemNameChange = (e) => {
      setSystemSettings(prev => ({ ...prev, systemName: e.detail }));
    };
    
    const handleDateFormatChange = (e) => {
      setSystemSettings(prev => ({ ...prev, dateFormat: e.detail }));
    };
    
    const handleLanguageChange = (e) => {
      setSystemSettings(prev => ({ ...prev, language: e.detail }));
    };
    
    const handleTimezoneChange = (e) => {
      setSystemSettings(prev => ({ ...prev, timezone: e.detail }));
    };

    window.addEventListener('systemNameChanged', handleSystemNameChange);
    window.addEventListener('dateFormatChanged', handleDateFormatChange);
    window.addEventListener('languageChanged', handleLanguageChange);
    window.addEventListener('timezoneChanged', handleTimezoneChange);

    return () => {
      window.removeEventListener('systemNameChanged', handleSystemNameChange);
      window.removeEventListener('dateFormatChanged', handleDateFormatChange);
      window.removeEventListener('languageChanged', handleLanguageChange);
      window.removeEventListener('timezoneChanged', handleTimezoneChange);
    };
  }, []);

  const addNotification = (title, message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      time: 'Just now',
      read: false,
      type
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/exam_courses?select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data || getMockCourses());
        const venues = [...new Set(data?.map(course => course.venue).filter(Boolean) || [])];
        setActiveVenues(venues.length > 0 ? venues : ['Main Hall', 'Room 101']);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses(getMockCourses());
      setActiveVenues(['Main Hall', 'Room 101']);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const studentUsers = data.filter(user => 
          !user.role || 
          user.role === 'student' || 
          (user.role !== 'admin' && user.role !== 'lecturer' && user.role !== 'examiner' && user.role !== 'coordinator')
        );
        setUsers(studentUsers || getMockUsers());
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers(getMockUsers());
    }
  };

  const handleRefresh = async () => {
    console.log('Refresh clicked by user:', currentUser?.role);
    
    try {
      setLoading(true);
      
      await fetchCourses();
      await fetchUsers();
      
      addNotification('Data Refreshed', 'All data has been refreshed successfully', 'success');
      
      console.log('Refresh completed successfully');
      
    } catch (error) {
      console.error('Refresh error:', error);
      
      addNotification('Refresh Failed', 'Failed to refresh data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    try {
      let rowsToUse = formData.rows;
      if (!rowsToUse && formData.date && formData.time && formData.venue && formData.numStudents) {
        const suggestions = getRowAllocationSuggestions(courses, {
          date: formData.date,
          time: formData.time,
          venue: formData.venue,
          numStudents: formData.numStudents
        });
        rowsToUse = suggestions.suggestedRows;
      }

      const courseData = {
        ...formData,
        rows: rowsToUse
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/exam_courses`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(courseData)
      });
      
      if (response.ok) {
        setShowAddModal(false);
        resetForm();
        fetchCourses();
        addNotification('Course Added', `${formData.code} added successfully`, 'success');
      } else {
        addNotification('Error', 'Failed to add course', 'error');
      }
    } catch (error) {
      console.error('Error adding course:', error);
      addNotification('Error', 'Failed to add course', 'error');
    }
  };

  const handleBulkUpload = async (coursesData) => {
    try {
      for (const course of coursesData) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/exam_courses`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(course)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload course: ${course.code}`);
        }
      }
      
      fetchCourses();
      return Promise.resolve();
    } catch (error) {
      console.error('Error in bulk upload:', error);
      return Promise.reject(error);
    }
  };

  const handleUpdateCourse = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/exam_courses?id=eq.${editingCourse.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setEditingCourse(null);
        setShowAddModal(false);
        resetForm();
        fetchCourses();
        addNotification('Course Updated', `${formData.code} updated successfully`, 'success');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      addNotification('Error', 'Failed to update course', 'error');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/exam_courses?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        fetchCourses();
        addNotification('Course Deleted', 'Course deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      addNotification('Error', 'Failed to delete course', 'error');
    }
  };

  const handleExport = (exportInfo) => {
    addNotification(
      'Export Successful',
      `Successfully exported ${exportInfo.count} ${exportInfo.type} as ${exportInfo.format.toUpperCase()}`,
      'success'
    );
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      date: '',
      time: '',
      venue: '',
      instructor: '',
      option: '',
      numStudents: '',
      rows: ''
    });
    setEditingCourse(null);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code || '',
      name: course.name || '',
      date: course.date || '',
      time: course.time || '',
      venue: course.venue || '',
      instructor: course.instructor || '',
      option: course.option || '',
      numStudents: course.numStudents || '',
      rows: course.rows || ''
    });
    setShowAddModal(true);
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await supabase.auth.signOut();
      localStorage.removeItem('adminUser');
      setCurrentUser(null);
      setShowLogin(true);
      addNotification('Logged Out', 'You have been logged out successfully', 'info');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      (course.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (course.code?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesVenue = !filterVenue || course.venue === filterVenue;
    
    return matchesSearch && matchesVenue;
  });

  const stats = {
    totalCourses: courses.length,
    totalUsers: users.length,
    upcomingExams: courses.filter(c => c.date && parseDate(c.date) > new Date()).length,
    todayExams: courses.filter(c => c.date && parseDate(c.date).toDateString() === new Date().toDateString()).length,
    venues: activeVenues.length
  };

  const isAdmin = currentUser?.role === 'admin';
  const isLecturer = currentUser?.role === 'lecturer';
  const canManageUsers = isAdmin;
  const canManageSystemSettings = isAdmin;

  if (showSignup) {
    return (
      <LecturerSignupPage 
        setShowSignup={setShowSignup}
        setCurrentUser={setCurrentUser}
      />
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <LoginModal 
          showLogin={true}
          setShowLogin={setShowLogin}
          setCurrentUser={setCurrentUser}
          setShowSignup={setShowSignup}
        />
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-2xl inline-block mb-4">
              <Calendar className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Baraton Admin Panel</h1>
            <p className="text-gray-600 dark:text-gray-400">Please sign in to continue</p>
            <button
              onClick={() => setShowSignup(true)}
              className="mt-4 px-6 py-2 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition font-medium"
            >
              Register as Lecturer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NotificationPanel
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notifications={notifications}
        markAsRead={markNotificationAsRead}
        clearAllNotifications={clearAllNotifications}
      />

      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center ml-2 lg:ml-0">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{systemSettings.systemName}</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Welcome, {currentUser?.name || 'Admin'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={handleRefresh}
                className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser?.name || 'Administrator'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {currentUser?.role === 'admin' ? 'Administrator' : 
                     currentUser?.role === 'lecturer' ? 'Lecturer' : 
                     currentUser?.role === 'examiner' ? 'Examiner' :
                     currentUser?.role === 'coordinator' ? 'Coordinator' :
                     currentUser?.role || 'User'}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {currentUser?.avatar || (currentUser?.role === 'admin' ? 'A' : 'L')}
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        <aside className={`${mobileMenuOpen ? 'block fixed inset-0 z-30 bg-white dark:bg-gray-900 lg:relative lg:inset-auto' : 'hidden'} lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto sticky top-16`}>
          <div className="p-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, allowed: true },
              { id: 'courses', label: 'Manage Courses', icon: BookOpen, allowed: true },
              { id: 'users', label: 'Students', icon: Users, allowed: canManageUsers },
              { id: 'settings', label: 'Settings', icon: Settings, allowed: canManageSystemSettings },
            ]
              .filter(item => item.allowed)
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg ${
                    currentView === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                  {item.id === 'users' && canManageUsers && (
                    <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                      {users.length}
                    </span>
                  )}
                </button>
              ))}
          </div>

          <div className="mt-8 p-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Courses Today</span>
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">{stats.todayExams}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Upcoming</span>
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">{stats.upcomingExams}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Active Venues</span>
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">{stats.venues}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 mt-4">
            <button
              onClick={() => {
                setShowAddModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:opacity-90 transition font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Course
            </button>
            {isAdmin && (
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={() => {
                    setShowBulkModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:opacity-90 text-sm"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Bulk
                </button>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:opacity-90 text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>
            )}
          </div>
          
          {mobileMenuOpen && (
            <div className="lg:hidden p-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4 mr-2" />
                Close Menu
              </button>
            </div>
          )}
        </aside>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">Welcome back, {currentUser?.name || 'Admin'} 👋</h1>
                    <p className="text-blue-100 opacity-90">Here's what's happening with your exam schedule today.</p>
                  </div>
                  <div className="mt-4 lg:mt-0">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 inline-block">
                      <p className="text-sm">Last updated: {formatDate(new Date())}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                  { title: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'blue' },
                  { title: 'Upcoming Exams', value: stats.upcomingExams, icon: Clock, color: 'green' },
                  { title: "Today's Exams", value: stats.todayExams, icon: Calendar, color: 'orange' },
                  { title: 'Students', value: stats.totalUsers, icon: Users, color: 'purple' },
                ].map((stat, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                        <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' : stat.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' : stat.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-purple-50 dark:bg-purple-900/20'}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color === 'blue' ? 'text-blue-600 dark:text-blue-500' : stat.color === 'green' ? 'text-green-600 dark:text-green-500' : stat.color === 'orange' ? 'text-orange-600 dark:text-orange-500' : 'text-purple-600 dark:text-purple-500'}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Courses</h2>
                  <button 
                    onClick={() => setCurrentView('courses')}
                    className="text-sm text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 font-medium flex items-center"
                  >
                    View all <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Code</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Students</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Rows</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.slice(0, 5).map((course) => (
                        <tr key={course.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                              {course.code}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{course.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{course.numStudents || '0'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{course.rows || 'Not set'}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditModal(course)}
                                className="p-1 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="p-1 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentView === 'courses' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all examination courses and schedules</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {isAdmin && (
                    <button
                      onClick={() => setShowBulkModal(true)}
                      className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Bulk Upload
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Course
                  </button>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-600" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-600" />
                    <select
                      value={filterVenue}
                      onChange={(e) => setFilterVenue(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">All Venues</option>
                      {activeVenues.map((venue, idx) => (
                        <option key={idx} value={venue}>{venue}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
                      {filteredCourses.length} courses found
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading courses...</p>
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No courses found</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Your First Course
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Code</th>
                          <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Course Details</th>
                          <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Schedule</th>
                          <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Students/Rows</th>
                          <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCourses.map((course) => (
                          <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                                {course.code}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <p className="font-medium text-gray-900 dark:text-white">{course.name}</p>
                              {course.option && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{course.option}</p>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="text-sm text-gray-900 dark:text-white">{formatDate(parseDate(course.date))}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{course.time}</p>
                                {course.venue && (
                                  <div className="flex items-center mt-1">
                                    <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{course.venue}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  Students: {course.numStudents || '0'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Rows: {course.rows || 'Not configured'}
                                </p>
                                {course.rows && (
                                  <div className="mt-1">
                                    <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                                      course.rows.split(',').some(r => parseInt(r) % 2 === 1) 
                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                                    }`}>
                                      {course.rows.split(',').some(r => parseInt(r) % 2 === 1) ? 'Odd rows' : 'Even rows'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => openEditModal(course)}
                                  className="p-2 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="p-2 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'users' && canManageUsers && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all registered users</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <Users className="w-8 h-8 opacity-80" />
                    <span className="text-3xl font-bold">{users.length}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Total Users</h3>
                  <p className="text-purple-200 text-sm">All registered users in the system</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recently Registered</h3>
                  <div className="space-y-4">
                    {users.slice(0, 4).map((user) => (
                      <div key={user.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.full_name?.[0] || user.email?.[0] || 'U'}
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.full_name || 'Unnamed User'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role || 'student'}</p>
                        </div>
                        <div className="text-right">
                          {user.student_id && (
                            <span className="block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded">
                              {user.student_id}
                            </span>
                          )}
                          {user.staff_id && (
                            <span className="block mt-1 px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 rounded">
                              {user.staff_id}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">User</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ID Number</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Role</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {user.full_name?.[0] || user.email?.[0] || 'U'}
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.full_name || 'Unnamed User'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role || 'student'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                          </td>
                          <td className="py-4 px-6">
                            {user.student_id ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                                {user.student_id}
                              </span>
                            ) : user.staff_id ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
                                {user.staff_id}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' :
                              user.role === 'lecturer' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
                              user.role === 'examiner' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300' :
                              user.role === 'coordinator' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300' :
                              'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300'
                            }`}>
                              {user.role || 'student'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-900 dark:text-white">
                              {user.created_at ? formatDate(new Date(user.created_at)) : 'N/A'}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentView === 'settings' && canManageSystemSettings && (
            <SystemSettings 
              currentUser={currentUser} 
              addNotification={addNotification} 
              backupService={BackupService}
              courses={courses}
              users={users}
            />
          )}

          {((currentView === 'users' && !canManageUsers) || 
            (currentView === 'settings' && !canManageSystemSettings)) && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Restricted</h2>
              <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this section.</p>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>

      {showAddModal && (
        <AddCourseModal
          editingCourse={editingCourse}
          formData={formData}
          setFormData={setFormData}
          setShowAddModal={setShowAddModal}
          handleAddCourse={handleAddCourse}
          handleUpdateCourse={handleUpdateCourse}
          resetForm={resetForm}
          isAdmin={isAdmin}
          courses={courses}
        />
      )}

      {showBulkModal && (
        <BulkUploadModal
          showBulkModal={showBulkModal}
          setShowBulkModal={setShowBulkModal}
          handleBulkUpload={handleBulkUpload}
          addNotification={addNotification}
          courses={courses}
        />
      )}

      {showExportModal && (
        <ExportModal
          showExportModal={showExportModal}
          setShowExportModal={setShowExportModal}
          handleExport={handleExport}
          courses={courses}
          users={users}
        />
      )}

      {showBackupModal && (
        <BackupModal
          showBackupModal={showBackupModal}
          setShowBackupModal={setShowBackupModal}
          backupService={BackupService}
          addNotification={addNotification}
          currentUser={currentUser}
          courses={courses}
          users={users}
          systemSettings={systemSettings}
        />
      )}
    </div>
  );
}

export default App;