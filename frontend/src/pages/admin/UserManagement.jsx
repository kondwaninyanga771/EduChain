import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Eye, UserMinus, UserCheck, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('STUDENT');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  
  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // View Modal State
  const [viewingUser, setViewingUser] = useState(null);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [navigate]);

  useEffect(() => {
    if (editingUser) {
      setEditName(editingUser.name);
      setEditRole(editingUser.role);
    }
  }, [editingUser]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
          password: newUserPassword
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      const newUser = await response.json();
      setUsers([newUser, ...users]);
      setIsCreateModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('STUDENT');
      setNewUserPassword('');
    } catch (err) {
      alert(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken
        },
        body: JSON.stringify({
          name: editName,
          role: editRole
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setEditingUser(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      setActionLoading(id);
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();

      const response = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'X-CSRF-Token': csrfData.csrfToken
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      const data = await response.json();
      // Update local state
      setUsers(users.map(u => u.id === id ? { ...u, status: data.status } : u));
    } catch (err) {
      console.error('Error toggling status:', err);
      alert('Failed to update user status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}? This action cannot be undone.`)) return;
    
    try {
      setActionLoading(id + '_delete');
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();

      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfData.csrfToken
        },
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.message || 'Failed to delete user.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
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
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Error Loading Users</h2>
        <p className="text-slate-500 max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage all students, lecturers, and administrative accounts.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>Add New User</Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input 
                placeholder="Search by name, email, or role..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-11 px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow dark:text-white"
              >
                <option value="all">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="LECTURER">Lecturers</option>
                <option value="ADMIN">Admins</option>
              </select>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow 
                  key={user.id} 
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => setViewingUser(user)}
                >
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-slate-500">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'primary' : user.role === 'Lecturer' ? 'warning' : 'default'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Edit User" onClick={(e) => { e.stopPropagation(); setEditingUser(user); }}>
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Delete User"
                        className="hover:bg-red-50 hover:text-red-600"
                        onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id, user.name); }}
                        disabled={actionLoading === user.id + '_delete'}
                      >
                        {actionLoading === user.id + '_delete' ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    {/* Create User Modal */}
    {isCreateModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Create New User</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <Input 
                required 
                placeholder="User's Full Name" 
                value={newUserName} 
                onChange={(e) => setNewUserName(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <Input 
                required 
                type="email"
                placeholder="email@educhain.edu" 
                value={newUserEmail} 
                onChange={(e) => setNewUserEmail(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <select 
                className="w-full flex h-10 rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:border-slate-800 dark:text-slate-50 dark:bg-slate-950"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
              >
                <option value="STUDENT">Student</option>
                <option value="LECTURER">Lecturer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Temporary Password</label>
              <Input 
                required 
                type="password"
                placeholder="Password" 
                value={newUserPassword} 
                onChange={(e) => setNewUserPassword(e.target.value)} 
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createLoading}>
                {createLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create User
              </Button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Edit User Modal */}
    {editingUser && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Edit User</h2>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <Input 
                required 
                placeholder="User's Full Name" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <select 
                className="w-full flex h-10 rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:border-slate-800 dark:text-slate-50 dark:bg-slate-950"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
              >
                <option value="STUDENT">Student</option>
                <option value="LECTURER">Lecturer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* View Details Modal */}
    {viewingUser && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Details</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 font-medium">
                {viewingUser.role === 'STUDENT' ? 'Student No:' : viewingUser.role === 'LECTURER' ? 'Lecturer ID:' : 'Admin ID:'}
              </span>
              <span className="text-sm text-slate-900 dark:text-slate-100 col-span-2 break-all font-mono">
                {viewingUser.id}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 font-medium">Full Name:</span>
              <span className="text-sm text-slate-900 dark:text-slate-100 col-span-2 font-medium">{viewingUser.name}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 font-medium">Email:</span>
              <span className="text-sm text-slate-900 dark:text-slate-100 col-span-2">{viewingUser.email}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 font-medium">Role:</span>
              <span className="text-sm col-span-2">
                <Badge variant={viewingUser.role === 'ADMIN' ? 'primary' : viewingUser.role === 'LECTURER' ? 'warning' : 'default'}>
                  {viewingUser.role}
                </Badge>
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 font-medium">Joined:</span>
              <span className="text-sm text-slate-900 dark:text-slate-100 col-span-2">
                {new Date(viewingUser.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 font-medium">Email Verified:</span>
              <span className="text-sm text-slate-900 dark:text-slate-100 col-span-2">
                {viewingUser.isEmailVerified ? 'Yes' : 'No'}
              </span>
            </div>

            {viewingUser.walletAddress && (
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500 font-medium">Wallet:</span>
                <span className="text-sm text-slate-900 dark:text-slate-100 col-span-2 break-all font-mono">
                  {viewingUser.walletAddress}
                </span>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 font-medium">Failed Logins:</span>
              <span className="text-sm text-slate-900 dark:text-slate-100 col-span-2">
                {viewingUser.failedLoginAttempts || 0}
              </span>
            </div>

            {viewingUser.role === 'STUDENT' && (
              <>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500 font-medium">Program:</span>
                  <span className="text-sm text-slate-900 dark:text-slate-100 col-span-2">
                    {viewingUser.program?.name || 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500 font-medium">Year/Semester:</span>
                  <span className="text-sm text-slate-900 dark:text-slate-100 col-span-2">
                    {viewingUser.year ? `Year ${viewingUser.year}` : 'N/A'} / {viewingUser.semester ? `Sem ${viewingUser.semester}` : 'N/A'}
                  </span>
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-end pt-6">
            <Button onClick={() => setViewingUser(null)}>Close</Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
