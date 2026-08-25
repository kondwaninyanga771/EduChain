import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, ShieldCheck, BarChart2, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export function PublishedResultsPage() {
  const [data, setData] = useState({ summary: null, results: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStats, setSelectedStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch('/api/lecturer/results', {
          credentials: 'include'
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch published results');
        }
        const json = await response.json();
        setData(json);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching published results:', err);
        setError('Failed to load published results data.');
        setLoading(false);
      }
    };

    fetchResults();
  }, [navigate]);

  const filteredResults = data.results.filter(r => 
    r.assessment.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.course.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Error Loading Data</h2>
        <p className="text-slate-500 max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Published Results</h1>
          <p className="text-slate-500 dark:text-slate-400">Overview of all finalized grades published to the blockchain.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-900/50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-primary-900 dark:text-primary-300">Total Assessments Graded</h3>
            <p className="text-3xl font-bold mt-2 text-primary-700 dark:text-primary-400">{data.summary?.totalAssessmentsGraded || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-300">Overall Average Score</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-700 dark:text-emerald-400">{data.summary?.overallAverageScore || 0}%</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300">Students Graded</h3>
            <p className="text-3xl font-bold mt-2 text-blue-700 dark:text-blue-400">{data.summary?.studentsGraded || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input 
                placeholder="Search assessments or courses..." 
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
                <TableHead>Assessment</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Published Date</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead className="text-center">Avg. Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.assessment}</TableCell>
                  <TableCell>{result.course}</TableCell>
                  <TableCell>{new Date(result.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{result.students}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={result.averageScore >= 80 ? 'success' : result.averageScore >= 60 ? 'primary' : 'warning'}>
                      {result.averageScore}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="View Statistics" onClick={() => setSelectedStats(result)}>
                        <BarChart2 className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate('/lecturer/records')}>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Verify
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredResults.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Statistics Modal */}
      {selectedStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <CardTitle>Assessment Statistics</CardTitle>
                <CardDescription>{selectedStats.assessment}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedStats(null)}>
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500 mb-1">Average Score</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedStats.averageScore}%</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500 mb-1">Students Graded</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedStats.students}</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500 mb-1">Course</p>
                  <p className="font-medium text-slate-900 dark:text-white truncate" title={selectedStats.course}>{selectedStats.course}</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500 mb-1">Date Published</p>
                  <p className="font-medium text-slate-900 dark:text-white">{new Date(selectedStats.date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-semibold mb-3">Score Distribution (Simulated)</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-xs text-slate-500">90-100%</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{width: '25%'}}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-xs text-slate-500">80-89%</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{width: '45%'}}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-xs text-slate-500">70-79%</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500" style={{width: '20%'}}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-xs text-slate-500">&lt; 70%</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{width: '10%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
