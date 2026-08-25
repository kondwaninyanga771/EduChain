import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Send, Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function CreateAssessmentPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  
  const [assessmentType, setAssessmentType] = useState('FILE_UPLOAD');
  const [file, setFile] = useState(null);
  
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 1 }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 1 }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/lecturer/courses', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        }
      } catch (err) {
        console.error('Failed to fetch courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (title.trim().length < 5 || title.trim().length > 100) {
      setFormError('Title must be between 5 and 100 characters.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (description.trim().length < 20) {
      setFormError('Description must be at least 20 characters long.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime()) || parsedDate < new Date()) {
      setFormError('Due date must be a valid future date.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (assessmentType === 'QUIZ') {
      if (questions.length === 0) {
        setFormError('Quizzes must have at least one question.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (q.text.trim().length < 5) {
          setFormError(`Question ${i + 1} text must be at least 5 characters.`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        if (q.options.some(opt => opt.trim().length === 0)) {
          setFormError(`Question ${i + 1} options cannot be empty.`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    }
    if (file && file.size > 50 * 1024 * 1024) {
      setFormError('File size must be less than 50MB.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitLoading(true);
    
    try {
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();

      const formData = new FormData();
      formData.append('title', title);
      formData.append('courseId', courseId);
      formData.append('dueDate', dueDate);
      formData.append('description', description);
      formData.append('type', assessmentType);

      if (assessmentType === 'QUIZ') {
        formData.append('questions', JSON.stringify(questions));
      }

      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfData.csrfToken
        },
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create assessment');
      }

      navigate('/lecturer/assessments');
    } catch (err) {
      setFormError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/lecturer/assessments" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Assessments
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Assessment</h1>
        <p className="text-slate-500 dark:text-slate-400">Design a new assignment and specify upload requirements.</p>
      </div>

      {formError && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">{formError}</p>
        </div>
      )}

      <form onSubmit={handlePublish}>
        <Card>
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
            <CardDescription>Enter the core information for this assignment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assessment Title</label>
                <Input 
                  placeholder="e.g. Midterm Essay: Blockchain Fundamentals" 
                  required 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assessment Type</label>
                <select 
                  className="w-full h-11 px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow dark:text-white"
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value)}
                >
                  <option value="FILE_UPLOAD">File Upload</option>
                  <option value="QUIZ">Multiple Choice Quiz (Auto-Graded)</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course</label>
                <select 
                  className="w-full h-11 px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow dark:text-white disabled:opacity-50"
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  disabled={loading}
                >
                  <option value="" disabled>Select a course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code}: {c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Due Date</label>
                <Input 
                  type="datetime-local" 
                  required 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description & Instructions</label>
              <textarea 
                className="w-full min-h-[100px] p-4 bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow dark:text-white resize-y"
                placeholder="Provide detailed instructions for the students..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload File (Optional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files[0])} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {file ? file.name : "PDF, DOCX, ZIP up to 50MB"}
                  </p>
                </div>
              </div>
            </div>
            
            {assessmentType === 'QUIZ' && (
              <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quiz Questions</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="w-4 h-4 mr-2" /> Add Question
                  </Button>
                </div>
                
                {questions.map((q, qIndex) => (
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
                        disabled={questions.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary-200 dark:border-primary-900">
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name={`correct-${qIndex}`} 
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
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 pt-6 flex justify-between border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline">
              <Save className="mr-2 h-4 w-4" /> Save Draft
            </Button>
            <Button type="submit" disabled={submitLoading}>
              {submitLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Publish Assessment
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
