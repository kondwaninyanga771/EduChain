import React, { useState, useEffect } from 'react';
import { User, Mail, Hash, Wallet, ShieldCheck, Key, Smartphone, AlertCircle, Loader2, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { fetchWithCSRF } from '../../utils/api';

export function ProfilePage({ role = 'student' }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchWithCSRF(`/api/${role}/profile`);
        if (!response.ok) {
          let errText = 'Failed to fetch profile';
          try {
            const errData = await response.json();
            errText = errData.message || errData.error || errText;
          } catch (e) {
            errText = `${errText} (Status: ${response.status})`;
          }
          throw new Error(errText);
        }
        const data = await response.json();
        setProfile(data);
        setFullName(data.fullName);
        setEmail(data.email);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(`Could not load profile data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async () => {
    setIsSavingProfile(true);
    setProfileMessage('');
    try {
      const response = await fetchWithCSRF(`/api/${role}/profile`, {
        method: 'PUT',
        body: JSON.stringify({ fullName, email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
      setProfileMessage(err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    setIsSavingPassword(true);
    setPasswordMessage('');
    setPasswordError('');
    try {
      const response = await fetchWithCSRF(`/api/${role}/profile/password`, {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update password');
      setPasswordMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setIsSavingPassword(false);
    }
  };



  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Error Loading Data</h2>
        <p className="text-slate-500 max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your profile, security, and blockchain wallet preferences.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-3 space-y-6">
          
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic academic identity details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Student ID</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input value={profile?.id.substring(0, 8).toUpperCase()} className="pl-10" readOnly />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input value={email} onChange={e => setEmail(e.target.value)} className="pl-10" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 justify-between items-center">
              <div className="text-sm text-emerald-600 font-medium">{profileMessage.includes('successfully') ? profileMessage : <span className="text-red-500">{profileMessage}</span>}</div>
              <Button onClick={handleProfileSave} disabled={isSavingProfile}>
                {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          {/* Wallet Information */}
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Wallet</CardTitle>
              <CardDescription>Your decentralized identity used for signing transactions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start md:items-center justify-between p-4 rounded-xl border border-primary-200 bg-primary-50/50 dark:border-primary-900/30 dark:bg-primary-900/10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center shrink-0">
                    <Wallet className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">MetaMask Connected</h4>
                    <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">{profile?.walletAddress || '0x71C...976F'}</p>
                  </div>
                </div>
                <Badge variant="success" className="ml-4 shrink-0 hidden sm:inline-flex">Active</Badge>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20 p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    <strong>Important:</strong> Do not lose access to this wallet. It is cryptographically tied to your academic identity. Recovering a lost wallet requires administrative intervention and identity verification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password and authentication methods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Key className="h-4 w-4" /> Change Password
                </h4>
                <div className="grid md:grid-cols-2 gap-4 pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500">Current Password</label>
                    <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500">New Password</label>
                    <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between">
                    <div>
                      {passwordError && <span className="text-sm text-red-500 font-medium">{passwordError}</span>}
                      {passwordMessage && <span className="text-sm text-emerald-600 font-medium">{passwordMessage}</span>}
                    </div>
                    <Button variant="outline" size="sm" onClick={handlePasswordSave} disabled={isSavingPassword || !currentPassword || !newPassword}>
                      {isSavingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Password
                    </Button>
                  </div>
                </div>
              </div>


            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
