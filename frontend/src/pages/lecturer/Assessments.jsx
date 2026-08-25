import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function AssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editType, setEditType] = useState('FILE_UPLOAD');
  const [editQuestions, setEditQuestions] = useState([]);
  const [editLoading, setEditLoading] = useState(false);

  const navigate = useNavigate();

  const addQuestion = () => {
    setEditQuestions([...editQuestions, { text: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 1 }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...editQuestions];
    updated[index][field] = value;
    setEditQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...editQuestions];
    updated[qIndex].options[oIndex] = value;
    setEditQuestions(updated);
  };

  const removeQuestion = (index) => {
    const updated = [...editQuestions];
    updated.splice(index, 1);
    setEditQuestions(updated);
  };

  useEffect(() => {
    if (editingAssessment) {
      setEditTitle(editingAssessment.title);
      setEditDescription(editingAssessment.description || '');
      setEditDueDate(new Date(editingAssessment.deadline).toISOString().split('T')[0]);
      setEditType(editingAssessment.type || 'FILE_UPLOAD');
      if (editingAssessment.type === 'QUIZ' && editingAssessment.questionsJson) {
        try {
          setEditQuestions(JSON.parse(editingAssessment.questionsJson));
        } catch (e) {
          setEditQuestions([{ text: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 1 }]);
        }
      } else {
        setEditQuestions([{ text: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 1 }]);
      }
    }
  }, [editingAssessment]);

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/lecturer/assessments', {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch assessments');
      }
      const data = await response.json();
      setAssessments(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError('Failed to load assessments.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      // 1. Get CSRF Token
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();

      // 2. Delete Assessment
      const response = await fetch(`/api/assessments/${id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfData.csrfToken },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete assessment');
      }
      
      // Update local state
      setAssessments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting assessment:', err);
      alert('Error deleting assessment. Please try again.');
    }
  };

  const handleUpdateAssessment = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      
      const response = await fetch(`/api/assessments/${editingAssessment.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          dueDate: editDueDate,
          ...(editType === 'QUIZ' && { questions: editQuestions })
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to update assessment');
      }
      
      // Refresh list
      fetchAssessments();
      setEditingAssessment(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const filteredAssessments = assessments.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessments Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Create and manage assignments across your courses.</p>
        </div>
        <Link to="/lecturer/assessments/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Assessment
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input 
                placeholder="Search assessments..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
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
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Total Submissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell className="font-medium">{assessment.title}</TableCell>
                  <TableCell>{assessment.course}</TableCell>
                  <TableCell>{new Date(assessment.deadline).toLocaleDateString()}</TableCell>
                  <TableCell>{assessment.submissions}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Edit Assessment" onClick={() => setEditingAssessment(assessment)}>
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete Assessment" onClick={() => handleDelete(assessment.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAssessments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    No assessments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Assessment</h2>
            </div>
            
            <form onSubmit={handleUpdateAssessment} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <Input 
                    required 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea 
                    className="w-full flex min-h-[100px] rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:border-slate-800 dark:text-slate-50 dark:bg-slate-950"
                    value={editDescription} 
                    onChange={(e) => setEditDescription(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <Input 
                    required 
                    type="date"
                    value={editDueDate} 
                    onChange={(e) => setEditDueDate(e.target.value)} 
                  />
                </div>

                {editType === 'QUIZ' && (
                  <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800 px-2">
                    <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 py-2 z-10 border-b border-slate-200 dark:border-slate-800">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quiz Questions</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                        <Plus className="w-4 h-4 mr-2" /> Add Question
                      </Button>
                    </div>
                    
                    {editQuestions.map((q, qIndex) => (
                      <div key={qIndex} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4 bg-slate-50 dark:bg-slate-800/30">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Question {qIndex + 1}</label>
                            <Input 
                              placeholder="Enter question text..." 
                              required 
                              value={q.text}
                              onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-7"
                            onClick={() => removeQuestion(qIndex)}
                            disabled={editQuestions.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pl-4 border-l-2 border-primary-200 dark:border-primary-900">
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-3">
                              <input 
                                type="radio" 
                                name={`edit-correct-${qIndex}`} 
                                checked={q.correctOptionIndex === oIndex}
                                onChange={() => updateQuestion(qIndex, 'correctOptionIndex', oIndex)}
                                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                required
                              />
                              <Input 
                                placeholder={`Option ${oIndex + 1}`} 
                                required 
                                value={opt}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                className={q.correctOptionIndex === oIndex ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800' : ''}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 flex-shrink-0">
                <Button type="button" variant="outline" onClick={() => setEditingAssessment(null)}>Cancel</Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
