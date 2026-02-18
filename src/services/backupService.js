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
        checksum: this.generateChecksum(JSON.stringify({ courses, users, settings })),
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
      localStorage.setItem(
        this.SETTINGS_STORAGE_KEY,
        JSON.stringify({
          systemName: settings?.systemName,
          dateFormat: settings?.dateFormat,
          language: settings?.language,
          timezone: settings?.timezone,
          theme: settings?.theme,
          backupTimestamp: timestamp,
          backupId,
        })
      );

      console.log('Backup created successfully:', backupId);
      return {
        success: true,
        backupId,
        timestamp,
        size: backupData.size,
        totalItems: backupData.totalCourses + backupData.totalUsers,
      };
    } catch (error) {
      console.error('Backup creation error:', error);
      return {
        success: false,
        error: error.message,
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
        backupData = backups.find((b) => b.id === backupId);
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
        window.dispatchEvent(
          new CustomEvent('backupRestored', {
            detail: {
              backupId: backupData.id,
              timestamp: new Date().toISOString(),
            },
          })
        );

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
            settings: Object.keys(backupData.settings || {}).length,
          },
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
        addNotification('Restore Failed', `Failed to restore system: ${error.message}`, 'error');
      }

      return {
        success: false,
        error: error.message,
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
        highContrast: localStorage.getItem('highContrast'),
      },
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
    return backups.find((b) => b.id === backupId);
  },

  // Delete a backup
  deleteBackup(backupId) {
    try {
      const backups = this.getBackupHistory();
      const filteredBackups = backups.filter((b) => b.id !== backupId);
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
        remaining: filteredBackups.length,
      };
    } catch (error) {
      console.error('Error deleting backup:', error);
      return {
        success: false,
        error: error.message,
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
      const backup =
        backupId === 'latest'
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
      a.download = `${filename}_${backup.id}_${new Date(backup.timestamp)
        .toISOString()
        .split('T')[0]}.json`;
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
            addNotification('Backup Imported', `Successfully imported backup: ${backupData.name}`, 'success');
          }

          resolve({
            success: true,
            backupId: backupData.id,
            name: backupData.name,
            timestamp: backupData.timestamp,
          });
        } catch (error) {
          console.error('Error importing backup:', error);

          if (addNotification) {
            addNotification('Import Failed', `Failed to import backup: ${error.message}`, 'error');
          }

          resolve({
            success: false,
            error: error.message,
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file',
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
        settings: backupData.settings,
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
      hash = (hash << 5) - hash + char;
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
        users: backupData.users?.length || 0,
      },
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
      latestBackup: latestBackup
        ? {
            id: latestBackup.id,
            timestamp: latestBackup.timestamp,
            name: latestBackup.name,
            size: latestBackup.size,
          }
        : null,
      totalSize,
      lastBackupDate: latestBackup?.timestamp || null,
      hasBackups: backups.length > 0,
    };
  },

  // Initialize auto-backup schedule
  initializeAutoBackup(callback) {
    // Check if auto-backup is enabled
    const autoBackupEnabled = localStorage.getItem('autoBackupEnabled') !== 'false';
    const autoBackupInterval =
      parseInt(localStorage.getItem('autoBackupInterval') || '24') * 60 * 60 * 1000; // Convert to milliseconds

    if (autoBackupEnabled && autoBackupInterval > 0) {
      // Schedule auto-backup
      setInterval(async () => {
        const lastBackup = localStorage.getItem('lastAutoBackup');
        const now = Date.now();

        if (!lastBackup || now - parseInt(lastBackup) > autoBackupInterval) {
          console.log('Auto-backup triggered');
          localStorage.setItem('lastAutoBackup', now.toString());

          // Trigger backup creation
          if (typeof callback === 'function') {
            callback();
          }
        }
      }, 60 * 60 * 1000); // Check every hour
    }
  },
};

export default BackupService;
