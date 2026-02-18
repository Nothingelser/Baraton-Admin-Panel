import React, { useEffect, useState } from 'react';

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
      systemAlerts,
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

export default NotificationSettings;

