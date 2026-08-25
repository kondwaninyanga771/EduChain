import React, { useState, useEffect } from 'react';
import { Save, UploadCloud, ShieldCheck, Key, Smartphone, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import logo from '../../assets/logo.png';

export function SettingsPage() {
  // Settings state
  const [institutionName, setInstitutionName] = useState(localStorage.getItem('institutionName') || 'EduChain University');
  const [settingsStatus, setSettingsStatus] = useState(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });

  const navigate = useNavigate();


  const handleSaveSettings = () => {
    localStorage.setItem('institutionName', institutionName);
    setSettingsStatus('Settings saved successfully!');
    setTimeout(() => setSettingsStatus(null), 3000);
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordStatus({ type: 'error', message: 'Both password fields are required.' });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/admin/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          if (data.error === 'Incorrect current password') {
            setPasswordStatus({ type: 'error', message: data.error });
          } else {
            navigate('/login');
          }
        } else {
          setPasswordStatus({ type: 'error', message: data.error || 'Failed to update password.' });
        }
      } else {
        setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      console.error('Password update error:', err);
      setPasswordStatus({ type: 'error', message: 'Network error occurred.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Configure global platform settings, appearance, and security policies.</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Update the institution identity and basic configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Institution Name</label>
              <Input 
                value={institutionName} 
                onChange={(e) => setInstitutionName(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Platform Logo</label>
              <div className="flex items-center gap-6 mt-2">
                <img src={logo} alt="Current Logo" className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
                <div className="flex-1">
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <UploadCloud className="h-6 w-6 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-900 dark:text-white font-medium">Click to upload new logo</p>
                    <p className="text-xs text-slate-500 mt-1">SVG, PNG, or JPG (max 2MB)</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 justify-between items-center">
            <div>
              {settingsStatus && (
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> {settingsStatus}
                </span>
              )}
            </div>
            <Button onClick={handleSaveSettings}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </CardFooter>
        </Card>


        {/* Security & Access */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <CardTitle>Security & Access Control</CardTitle>
            </div>
            <CardDescription>Manage your administrator credentials and authentication requirements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Key className="h-4 w-4" /> Change Administrator Password
              </h4>
              <div className="grid md:grid-cols-2 gap-4 pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500">Current Password</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-500">New Password</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  {passwordStatus.message && (
                    <div className={`mb-3 p-3 rounded-lg text-sm flex items-center gap-2 ${
                      passwordStatus.type === 'error' 
                        ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    }`}>
                      {passwordStatus.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      {passwordStatus.message}
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={handlePasswordUpdate} disabled={isUpdatingPassword}>
                    {isUpdatingPassword && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Update Password
                  </Button>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
