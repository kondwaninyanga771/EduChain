import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchWithCSRF } from '../../utils/api';
import { ArrowLeft, FileText, CheckCircle2, Send, Download, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export function GradeAssignmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await fetchWithCSRF(`/api/lecturer/submissions/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch submission details');
        }
        const data = await response.json();
        setSubmission(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmission();
  }, [id]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const response = await fetchWithCSRF(`/api/lecturer/submissions/${id}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score: parseInt(score, 10), feedback })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to publish grade');
      
      // Navigate back to grade center on success
      navigate('/lecturer/grades');
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleViewIPFS = () => {
    if (submission?.ipfsHash?.startsWith('QmMockedIpfsHash')) {
      alert(`This is a local development mock hash (${submission.ipfsHash}). In production, this would download the file from Pinata IPFS.`);
    } else {
      window.open(`https://gateway.pinata.cloud/ipfs/${submission.ipfsHash}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Error Loading Submission</h2>
        <p className="text-slate-500 max-w-md">{error || 'Submission not found'}</p>
        <Link to="/lecturer/grades">
          <Button variant="outline">Back to Grade Center</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <Link to="/lecturer/grades" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Grade Center
        </Link>
        <Badge variant={submission.status === 'Needs Grading' ? 'warning' : 'success'}>
          {submission.status}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-full pb-6">
        {/* Left Panel - Submission Preview */}
        <div className="lg:col-span-2 h-full flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{submission.fileName}</CardTitle>
                  <CardDescription className="font-mono text-xs mt-1 truncate max-w-sm">
                    IPFS: {submission.ipfsHash}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleViewIPFS}>
                  <Download className="mr-2 h-4 w-4" /> View IPFS File
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 bg-slate-100/50 dark:bg-slate-950 flex items-center justify-center">
              {/* Mock PDF Viewer */}
              <div className="text-center p-8">
                <FileText className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">PDF Document Preview Not Supported</p>
                <p className="text-sm text-slate-400 mt-2">Click "View IPFS File" to open the submission directly.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Grading Form */}
        <div className="h-full flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <CardTitle className="text-lg">Grading Panel</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 pt-6 overflow-y-auto">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Student</p>
                <p className="font-semibold text-slate-900 dark:text-white">{submission.studentName} <span className="text-slate-400 font-normal text-sm">({submission.studentId})</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Assessment</p>
                <p className="font-semibold text-slate-900 dark:text-white">{submission.assessment}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Submitted</p>
                <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  {new Date(submission.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  {submission.isLate && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                      Late
                    </span>
                  )}
                </p>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">Score (0-100)</label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100" 
                    placeholder="e.g. 85" 
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="text-lg font-semibold"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">Feedback</label>
                  <textarea 
                    className="w-full min-h-[150px] p-3 bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow dark:text-white resize-none"
                    placeholder="Provide constructive feedback for the student..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-900/50 pt-4 pb-4 flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <Button 
                className="w-full" 
                onClick={handlePublish}
                disabled={isPublishing || !score}
              >
                {isPublishing ? 'Publishing to Blockchain...' : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Publish Result On-Chain
                  </>
                )}
              </Button>
              <Button variant="outline" className="w-full bg-white dark:bg-slate-950">
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Save as Draft
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
