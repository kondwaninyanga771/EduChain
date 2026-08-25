import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, UploadCloud, File, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { fetchWithCSRF } from '../../utils/api';

export function AssessmentDetailsPage() {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [file, setFile] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetchWithCSRF(`/api/student/assessments/${id}`);
        if (!response.ok) throw new Error('Failed to fetch assessment');
        const data = await response.json();
        setAssessment(data);
        if (data.status !== 'Pending') {
          setIsSubmitted(true);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [id]);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (assessment.type === 'FILE_UPLOAD' && !file) return;
    if (assessment.type === 'QUIZ' && (!assessment.questions || Object.keys(answers).length !== assessment.questions.length)) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('assessmentId', id);
      if (file) formData.append('file', file);
      
      if (assessment.type === 'QUIZ') {
        const answersArr = Object.keys(answers).map(k => ({
          questionIndex: parseInt(k),
          selectedOptionIndex: answers[k]
        }));
        formData.append('answersJson', JSON.stringify(answersArr));
      }

      const response = await fetchWithCSRF('/api/submissions', {
        method: 'POST',
        body: formData // No Content-Type header so browser sets multipart/form-data
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to submit assignment');
      }

      const resData = await response.json();

      setIsSubmitted(true);
      setAssessment(prev => ({ 
        ...prev, 
        status: 'Submitted',
        submission: {
          ...prev.submission,
          submittedAt: resData.submission?.submittedAt || new Date().toISOString()
        }
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Error Loading Assessment</h2>
        <p className="text-slate-500 max-w-md">{error || 'Assessment not found'}</p>
        <Link to="/student/assessments">
          <Button variant="outline">Back to Assessments</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/student/assessments" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Assessments
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{assessment.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">{assessment.course}</p>
        </div>
        <Badge variant="warning" className="text-sm px-3 py-1">Due: {new Date(assessment.deadline).toLocaleString()}</Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {assessment.instructions}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submission</CardTitle>
              <CardDescription>Upload your assignment file securely to IPFS.</CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Assignment Submitted Successfully</h3>
                  {assessment.submission?.submittedAt && (
                    <div className="flex items-center gap-2 mb-2 justify-center">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Submitted: {new Date(assessment.submission.submittedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                      {new Date(assessment.submission.submittedAt) > new Date(assessment.deadline) && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                          Late
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-slate-500 dark:text-slate-400 mb-6 mt-2">Your submission has been securely recorded on the blockchain.</p>
                  <div className="flex gap-4">
                    <Link to="/student/submissions">
                      <Button variant="outline">View Submissions</Button>
                    </Link>
                    {new Date() < new Date(assessment.deadline) && (
                      <Button 
                        variant="ghost" 
                        className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        onClick={() => {
                          setIsSubmitted(false);
                          setFile(null);
                          setAnswers({});
                        }}
                      >
                        Edit Submission
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {assessment.type === 'QUIZ' ? (
                    <div className="space-y-6">
                      {assessment.questions.map((q, qIndex) => (
                        <div key={qIndex} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/30">
                          <p className="font-medium text-slate-900 dark:text-white mb-3">
                            {qIndex + 1}. {q.text}
                          </p>
                          <div className="space-y-2">
                            {q.options.map((opt, oIndex) => (
                              <label key={oIndex} className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                                <input 
                                  type="radio" 
                                  name={`question-${qIndex}`}
                                  checked={answers[qIndex] === oIndex}
                                  onChange={() => setAnswers({...answers, [qIndex]: oIndex})}
                                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-slate-300 mr-3"
                                />
                                <span className="text-slate-700 dark:text-slate-300 text-sm">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {!file ? (
                        <div 
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleDrop}
                          className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        >
                          <input 
                            type="file" 
                            id="file-upload" 
                            className="hidden" 
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.zip"
                          />
                          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                            <div className="h-14 w-14 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
                              <UploadCloud className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                            </div>
                            <p className="text-slate-900 dark:text-white font-medium mb-1">Click to upload or drag and drop</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">PDF, DOCX, or ZIP (max. 50MB)</p>
                          </label>
                        </div>
                      ) : (
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm">
                          <div className="flex items-center gap-4 overflow-hidden">
                            <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                              <File className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          {!isUploading && (
                            <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                              <X className="h-4 w-4 text-slate-500 hover:text-red-500" />
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-600" />
                        <span className="font-medium">Uploading to IPFS...</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    {new Date() > new Date(assessment.deadline) && !isSubmitted && (
                      <div className="flex-1 text-sm text-red-500 font-medium flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" /> This assignment is overdue and will be marked as Late.
                      </div>
                    )}
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isUploading || (assessment.type === 'FILE_UPLOAD' && !file) || (assessment.type === 'QUIZ' && Object.keys(answers).length !== (assessment.questions?.length || 0))}
                      className="w-full sm:w-auto"
                    >
                      {isUploading ? 'Processing...' : 'Submit Assessment'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Lecturer</p>
                <p className="text-slate-900 dark:text-white">{assessment.lecturer}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Format</p>
                <p className="text-slate-900 dark:text-white">{assessment.type === 'QUIZ' ? 'Multiple Choice Quiz' : 'File Upload (PDF/DOC)'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Grading Scheme</p>
                <p className="text-slate-900 dark:text-white">Percentage (0-100)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
