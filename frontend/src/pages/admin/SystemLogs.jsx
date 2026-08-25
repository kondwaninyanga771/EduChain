import React, { useState, useEffect } from 'react';
import { Search, Filter, LogIn, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function SystemLogsPage() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/admin/logs', {
          credentials: 'include'
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch system logs');
        }
        const data = await response.json();
        setLogs(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Failed to load system logs.');
        setLoading(false);
      }
    };

    fetchLogs();
  }, [navigate]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = categoryFilter === 'all' || log.type === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getLogIcon = (type) => {
    switch(type) {
      case 'login': return <LogIn className="h-4 w-4 text-blue-500" />;
      case 'assessment': return <FileText className="h-4 w-4 text-amber-500" />;
      case 'result': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      default: return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  const getLogBg = (type) => {
    switch(type) {
      case 'login': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'assessment': return 'bg-amber-100 dark:bg-amber-900/30';
      case 'result': return 'bg-emerald-100 dark:bg-emerald-900/30';
      default: return 'bg-slate-100 dark:bg-slate-800';
    }
  };

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
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Error Loading Logs</h2>
        <p className="text-slate-500 max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
          <p className="text-slate-500 dark:text-slate-400">Audit trail of platform activities and user interactions.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input 
                placeholder="Search logs by user or action..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-11 px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow dark:text-white"
              >
                <option value="all">All Events</option>
                <option value="login">Authentication</option>
                <option value="assessment">Assessments</option>
                <option value="result">Results</option>
              </select>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 md:before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pt-2 pb-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="relative flex items-start group">
                <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white dark:border-slate-950 shadow-sm shrink-0 relative z-10 ${getLogBg(log.type)}`}>
                  {getLogIcon(log.type)}
                </div>
                <div className="ml-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm w-full transition-shadow hover:shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{log.action}</h4>
                    <span className="text-xs text-slate-500 font-mono bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded shrink-0 w-fit">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">User: {log.user}</p>
                </div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="pl-16 py-8 text-slate-500">
                No logs match your search criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
