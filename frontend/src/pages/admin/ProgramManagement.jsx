import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function ProgramManagementPage() {
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProgramCode, setNewProgramCode] = useState('');
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramDepartment, setNewProgramDepartment] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Modal State
  const [editingProgram, setEditingProgram] = useState(null);
  const [editProgramCode, setEditProgramCode] = useState('');
  const [editProgramName, setEditProgramName] = useState('');
  const [editProgramDepartment, setEditProgramDepartment] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // View Modal State
  const [viewingProgram, setViewingProgram] = useState(null);

  const navigate = useNavigate();

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/admin/programs', {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch programs');
      }
      const data = await response.json();
      setPrograms(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to load programs.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [navigate]);

  // Populate edit form
  useEffect(() => {
    if (editingProgram) {
      setEditProgramCode(editingProgram.code);
      setEditProgramName(editingProgram.name);
      setEditProgramDepartment(editingProgram.department || '');
    }
  }, [editingProgram]);

  const handleUpdateProgram = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      
      const response = await fetch(`/api/admin/programs/${editingProgram.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken
        },
        body: JSON.stringify({
          code: editProgramCode,
          name: editProgramName,
          department: editProgramDepartment || null
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update program');
      }
      const updatedProgram = await response.json();
      setPrograms(programs.map(p => p.id === updatedProgram.id ? updatedProgram : p));
      setEditingProgram(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      
      const response = await fetch('/api/admin/programs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken
        },
        body: JSON.stringify({
          code: newProgramCode,
          name: newProgramName,
          department: newProgramDepartment || null
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create program');
      }
      const newProgram = await response.json();
      setPrograms([newProgram, ...programs]);
      setIsCreateModalOpen(false);
      setNewProgramCode('');
      setNewProgramName('');
      setNewProgramDepartment('');
    } catch (err) {
      alert(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteProgram = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete the program "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(id);
      
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();

      const response = await fetch(`/api/admin/programs/${id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfData.csrfToken
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to delete program');
      }
      
      setPrograms(programs.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting program:', err);
      alert('Failed to delete program.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPrograms = programs.filter(p => 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.department && p.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Error Loading Programs</h2>
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
          <h1 className="text-3xl font-bold tracking-tight">Program Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage academic programs and departments.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Program
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input 
                placeholder="Search by program code, name, or department..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Program Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrograms.map((program) => (
                <TableRow 
                  key={program.id} 
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  onClick={() => setViewingProgram(program)}
                >
                  <TableCell>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <GraduationCap className="h-3 w-3" /> {program.code}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell className="text-slate-500">{program.department || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Edit Program" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProgram(program);
                        }}
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Delete Program"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProgram(program.id, program.name);
                        }}
                        disabled={actionLoading === program.id}
                      >
                        {actionLoading === program.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPrograms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                    No programs found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    {/* Create Program Modal */}
    {isCreateModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Create New Program</h2>
          <form onSubmit={handleCreateProgram} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Program Code</label>
              <Input 
                required 
                placeholder="e.g. CS101" 
                value={newProgramCode} 
                onChange={(e) => setNewProgramCode(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Program Name</label>
              <Input 
                required 
                placeholder="e.g. Computer Science" 
                value={newProgramName} 
                onChange={(e) => setNewProgramName(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department (Optional)</label>
              <Input 
                placeholder="e.g. School of ICT" 
                value={newProgramDepartment} 
                onChange={(e) => setNewProgramDepartment(e.target.value)} 
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createLoading}>
                {createLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Program
              </Button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Edit Program Modal */}
    {editingProgram && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Edit Program</h2>
          <form onSubmit={handleUpdateProgram} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Program Code</label>
              <Input 
                required 
                placeholder="e.g. CS101" 
                value={editProgramCode} 
                onChange={(e) => setEditProgramCode(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Program Name</label>
              <Input 
                required 
                placeholder="e.g. Computer Science" 
                value={editProgramName} 
                onChange={(e) => setEditProgramName(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department (Optional)</label>
              <Input 
                placeholder="e.g. School of ICT" 
                value={editProgramDepartment} 
                onChange={(e) => setEditProgramDepartment(e.target.value)} 
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingProgram(null)}>Cancel</Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* View Program Modal */}
    {viewingProgram && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary-600" />
                {viewingProgram.name}
              </h2>
              <p className="text-slate-500 text-sm mt-1">Program Details & Information</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Code</p>
                <p className="font-medium text-slate-900 dark:text-slate-200">{viewingProgram.code}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Department</p>
                <p className="font-medium text-slate-900 dark:text-slate-200">{viewingProgram.department || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2">Assigned Courses ({viewingProgram.courses?.length || 0})</p>
              <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/50">
                {viewingProgram.courses && viewingProgram.courses.length > 0 ? (
                  <ul className="space-y-2">
                    {viewingProgram.courses.map(course => (
                      <li key={course.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{course.courseName}</span>
                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-md">{course.courseCode}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 italic py-2 text-center">No courses currently assigned to this program.</p>
                )}
              </div>
            </div>
            
            <div className="pt-2 text-xs text-slate-400 dark:text-slate-500">
              <p>Created: {new Date(viewingProgram.createdAt).toLocaleString()}</p>
              <p>Last Updated: {new Date(viewingProgram.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            <Button onClick={() => setViewingProgram(null)}>Close</Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
