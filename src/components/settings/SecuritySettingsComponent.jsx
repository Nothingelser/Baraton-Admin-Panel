import React, { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

function SecuritySettingsComponent({ addNotification }) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    return localStorage.getItem('twoFactorEnabled') === 'true' || false;
  });
  const [sessionTimeout, setSessionTimeout] = useState(() => {
    return localStorage.getItem('sessionTimeout') || '30';
  });
  const [passwordPolicy, setPasswordPolicy] = useState(() => {
    const saved = localStorage.getItem('passwordPolicy');
    return saved
      ? JSON.parse(saved)
      : {
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
    return saved
      ? JSON.parse(saved)
      : [
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
        ip: '192.168.1.100',
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
      ip: '192.168.1.100',
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
      ip: '192.168.1.100',
    };
    const updatedLogs = [newLog, ...securityLogs.slice(0, 9)];
    setSecurityLogs(updatedLogs);
    localStorage.setItem('securityLogs', JSON.stringify(updatedLogs));

    if (addNotification) {
      addNotification('Password Policy Updated', 'Password policy settings have been updated', 'success');
    }
  };

  const handleAddIp = () => {
    if (
      newIp &&
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(newIp)
    ) {
      setIpWhitelist([...ipWhitelist, newIp]);

      const newLog = {
        id: Date.now(),
        action: `IP added to whitelist: ${newIp}`,
        timestamp: Date.now(),
        user: 'Admin',
        ip: '192.168.1.100',
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
    const updatedList = ipWhitelist.filter((ip) => ip !== ipToRemove);
    setIpWhitelist(updatedList);

    const newLog = {
      id: Date.now(),
      action: `IP removed from whitelist: ${ipToRemove}`,
      timestamp: Date.now(),
      user: 'Admin',
      ip: '192.168.1.100',
    };
    const updatedLogs = [newLog, ...securityLogs.slice(0, 9)];
    setSecurityLogs(updatedLogs);
    localStorage.setItem('securityLogs', JSON.stringify(updatedLogs));

    if (addNotification) {
      addNotification('IP Whitelist Updated', `IP address ${ipToRemove} removed from whitelist`, 'success');
    }
  };

  const clearSecurityLogs = () => {
    const defaultLogs = [{ id: 1, action: 'Security logs cleared', timestamp: Date.now(), user: 'Admin', ip: '192.168.1.100' }];
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
              <button onClick={handleAddIp} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                Add
              </button>
            </div>

            <div className="space-y-2">
              {ipWhitelist.map((ip, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded"
                >
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
              <div
                key={log.id}
                className="flex items-center justify-between text-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
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

export default SecuritySettingsComponent;

