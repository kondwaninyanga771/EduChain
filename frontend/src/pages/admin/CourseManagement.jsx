import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function CourseManagementPage() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [enrollmentActionLoading, setEnrollmentActionLoading] = useState(null);
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [lecturers, setLecturers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseLecturerId, setNewCourseLecturerId] = useState('');
  const [newCourseProgramIds, setNewCourseProgramIds] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Modal State
  const [editingCourse, setEditingCourse] = useState(null);
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editCourseName, setEditCourseName] = useState('');
  const [editCourseLecturerId, setEditCourseLecturerId] = useState('');
  const [editCourseProgramIds, setEditCourseProgramIds] = useState([]);
  const [editLoading, setEditLoading] = useState(false);

  // View Modal State
  const [viewingCourse, setViewingCourse] = useState(null);

  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses', {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json();
      setCourses(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses.');
      setLoading(false);
    }
  };

  const fetchPendingEnrollments = async () => {
    try {
      const response = await fetch('/api/admin/enrollments/pending', { credentials: 'include' });
      if (response.ok) {
        setPendingEnrollments(await response.json());
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchPendingEnrollments();
  }, [navigate]);

  // Fetch lecturers and programs for modals
  useEffect(() => {
    if ((isCreateModalOpen || editingCourse) && lecturers.length === 0) {
      const fetchLecturers = async () => {
        try {
          const response = await fetch('/api/admin/users', { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            setLecturers(data.filter(u => u.role === 'LECTURER'));
          }
        } catch (err) {
          console.error("Failed to fetch lecturers", err);
        }
      };
      fetchLecturers();
    }
  }, [isCreateModalOpen, editingCourse, lecturers.length]);

  useEffect(() => {
    if ((isCreateModalOpen || editingCourse) && programs.length === 0) {
      const fetchPrograms = async () => {
        try {
          const response = await fetch('/api/admin/programs', { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            setPrograms(data);
          }
        } catch (err) {
          console.error("Failed to fetch programs", err);
        }
      };
      fetchPrograms();
    }
  }, [isCreateModalOpen, editingCourse, programs.length]);

  // Populate edit form
  useEffect(() => {
    if (editingCourse) {
      setEditCourseCode(editingCourse.code);
      setEditCourseName(editingCourse.name);
      setEditCourseLecturerId(editingCourse.lecturerId || '');
      setEditCourseProgramIds(editingCourse.programs ? editingCourse.programs.map(p => p.id) : []);
    }
  }, [editingCourse]);

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      
      const response = await fetch(`/api/admin/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken
        },
        body: JSON.stringify({
          courseCode: editCourseCode,
          courseName: editCourseName,
          lecturerId: editCourseLecturerId || null,
          programIds: editCourseProgramIds
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update course');
      }
      const updatedCourse = await response.json();
      setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      setEditingCourse(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      // Get CSRF Token
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken
        },
        body: JSON.stringify({
          courseCode: newCourseCode,
          courseName: newCourseName,
          lecturerId: newCourseLecturerId || null,
          programIds: newCourseProgramIds
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create course');
      }
      const newCourse = await response.json();
      setCourses([newCourse, ...courses]);
      setIsCreateModalOpen(false);
      setNewCourseCode('');
      setNewCourseName('');
      setNewCourseLecturerId('');
      setNewCourseProgramIds([]);
    } catch (err) {
      alert(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteCourse = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete the course "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(id);
      
      // Get CSRF Token
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();

      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfData.csrfToken
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to delete course');
      }
      
      // Update local state by removing the deleted course
      setCourses(courses.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Failed to delete course.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnrollmentAction = async (studentId, courseId, status) => {
    try {
      setEnrollmentActionLoading(`${studentId}-${courseId}`);
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      
      const response = await fetch(`/api/admin/enrollments/${studentId}/${courseId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken
        },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update status');
      
      await fetchPendingEnrollments();
    } catch (err) {
      alert(err.message);
    } finally {
      setEnrollmentActionLoading(null);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lecturer.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Error Loading Courses</h2>
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
          <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage academic courses and lecturer assignments.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Course
        </Button>
      </div>

      {/* Pending Enrollments Section */}
      {!loadingEnrollments && pendingEnrollments.length > 0 && (
        <Card className="mb-8 border-amber-200 dark:border-amber-900/50">
          <CardHeader className="bg-amber-50 dark:bg-amber-900/20 pb-4 border-b border-amber-100 dark:border-amber-900/30">
            <CardTitle className="text-amber-800 dark:text-amber-500 flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" /> Pending Course Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Applied At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingEnrollments.map((e) => (
                  <TableRow key={`${e.studentId}-${e.courseId}`}>
                    <TableCell>
                      <div className="font-medium">{e.studentName}</div>
                      <div className="text-sm text-slate-500">{e.studentEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{e.courseName}</div>
                      <div className="text-sm text-slate-500">{e.courseCode}</div>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {new Date(e.enrolledAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleEnrollmentAction(e.studentId, e.courseId, 'REJECTED')}
                          disabled={enrollmentActionLoading === `${e.studentId}-${e.courseId}`}
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleEnrollmentAction(e.studentId, e.courseId, 'APPROVED')}
                          disabled={enrollmentActionLoading === `${e.studentId}-${e.courseId}`}
                        >
                          {enrollmentActionLoading === `${e.studentId}-${e.courseId}` ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input 
                placeholder="Search by course code, name, or lecturer..." 
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
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Assigned Lecturer</TableHead>
                <TableHead>Programs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow 
                  key={course.id}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => setViewingCourse(course)}
                >
                  <TableCell>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <BookOpen className="h-3 w-3" /> {course.code}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell className="text-slate-500">{course.lecturer}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {course.programs && course.programs.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {course.programs.map(p => (
                          <span key={p.id} className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800/30 text-xs">
                            {p.code}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Edit Course" onClick={(e) => { e.stopPropagation(); setEditingCourse(course); }}>
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Delete Course"
                        onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id, course.name); }}
                        disabled={actionLoading === course.id}
                      >
                        {actionLoading === course.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCourses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                    No courses found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    {/* Create Course Modal */}
    {isCreateModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Create New Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
              <Input 
                required 
                placeholder="e.g. CS101" 
                value={newCourseCode} 
                onChange={(e) => setNewCourseCode(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Name</label>
              <Input 
                required 
                placeholder="e.g. Intro to Computer Science" 
                value={newCourseName} 
                onChange={(e) => setNewCourseName(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign Lecturer (Optional)</label>
              <select 
                className="w-full flex h-10 rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:border-slate-800 dark:text-slate-50 dark:bg-slate-950"
                value={newCourseLecturerId}
                onChange={(e) => setNewCourseLecturerId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {lecturers.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Assign Programs <span className="text-red-500">*</span></label>
              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-2">
                {programs.map(p => (
                  <div key={p.id} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={`prog-create-${p.id}`}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      checked={newCourseProgramIds.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewCourseProgramIds([...newCourseProgramIds, p.id]);
                        } else {
                          setNewCourseProgramIds(newCourseProgramIds.filter(id => id !== p.id));
                        }
                      }}
                    />
                    <label htmlFor={`prog-create-${p.id}`} className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      {p.name} ({p.code})
                    </label>
                  </div>
                ))}
                {programs.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No programs available.</p>
                )}
              </div>
              {newCourseProgramIds.length === 0 && (
                 <p className="text-xs text-red-500 mt-1">Please select at least one program.</p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createLoading || newCourseProgramIds.length === 0}>
                {createLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Course
              </Button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Edit Course Modal */}
    {editingCourse && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Edit Course</h2>
          <form onSubmit={handleUpdateCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
              <Input 
                required 
                placeholder="e.g. CS101" 
                value={editCourseCode} 
                onChange={(e) => setEditCourseCode(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Name</label>
              <Input 
                required 
                placeholder="e.g. Intro to Computer Science" 
                value={editCourseName} 
                onChange={(e) => setEditCourseName(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign Lecturer (Optional)</label>
              <select 
                className="w-full flex h-10 rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:border-slate-800 dark:text-slate-50 dark:bg-slate-950"
                value={editCourseLecturerId}
                onChange={(e) => setEditCourseLecturerId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {lecturers.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Assign Programs <span className="text-red-500">*</span></label>
              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-2">
                {programs.map(p => (
                  <div key={p.id} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={`prog-edit-${p.id}`}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      checked={editCourseProgramIds.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditCourseProgramIds([...editCourseProgramIds, p.id]);
                        } else {
                          setEditCourseProgramIds(editCourseProgramIds.filter(id => id !== p.id));
                        }
                      }}
                    />
                    <label htmlFor={`prog-edit-${p.id}`} className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      {p.name} ({p.code})
                    </label>
                  </div>
                ))}
                {programs.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No programs available.</p>
                )}
              </div>
              {editCourseProgramIds.length === 0 && (
                 <p className="text-xs text-red-500 mt-1">Please select at least one program.</p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingCourse(null)}>Cancel</Button>
              <Button type="submit" disabled={editLoading || editCourseProgramIds.length === 0}>
                {editLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* View Course Details Modal */}
    {viewingCourse && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary-600" /> Course Details
            </h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 font-medium">Course ID:</span>
              <span className="text-sm text-slate-900 dark:text-slate-100 col-span-2 break-all font-mono">
                {viewingCourse.id}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 font-medium">Course Code:</span>
              <span className="text-sm text-slate-900 dark:text-slate-100 col-span-2 font-semibold">
                {viewingCourse.code}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 font-medium">Course Name:</span>
              <span className="text-sm text-slate-900 dark:text-slate-100 col-span-2 font-medium">
                {viewingCourse.name}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 font-medium">Lecturer:</span>
              <span className="text-sm text-slate-900 dark:text-slate-100 col-span-2">
                {viewingCourse.lecturer || <span className="text-slate-400 italic">Unassigned</span>}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 font-medium">Programs:</span>
              <span className="text-sm text-slate-900 dark:text-slate-100 col-span-2">
                {viewingCourse.programs && viewingCourse.programs.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {viewingCourse.programs.map(p => (
                      <span key={p.id} className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800/30 text-xs">
                        {p.code}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">None</span>
                )}
              </span>
            </div>
          </div>
          <div className="flex justify-end pt-6">
            <Button onClick={() => setViewingCourse(null)}>Close</Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
