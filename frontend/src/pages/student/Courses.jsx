import React, { useState, useEffect } from 'react';
import { BookOpen, Search, User, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { fetchWithCSRF } from '../../utils/api';

export function StudentCoursesPage() {
  const [activeTab, setActiveTab] = useState('available');
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const [availRes, enrollRes] = await Promise.all([
        fetchWithCSRF('/api/student/courses/available'),
        fetchWithCSRF('/api/student/courses/enrolled')
      ]);
      
      if (availRes.ok && enrollRes.ok) {
        setAvailableCourses(await availRes.json());
        setEnrolledCourses(await enrollRes.json());
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    try {
      const response = await fetchWithCSRF('/api/student/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to enroll');
      }
      
      // Refresh the lists
      await fetchCourses();
      // Switch to enrolled tab
      setActiveTab('enrolled');
    } catch (err) {
      alert(err.message);
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredAvailable = availableCourses.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
          <p className="text-slate-500 dark:text-slate-400">Browse available courses and manage your enrollments.</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-xl w-max dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'available'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Available Courses
        </button>
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'enrolled'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          My Enrollments
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : activeTab === 'available' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search courses..." 
              className="pl-10 bg-white dark:bg-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredAvailable.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
              <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No courses found</h3>
              <p className="mt-2 text-slate-500">You are enrolled in all available courses or none match your search.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAvailable.map(course => (
                <Card key={course.id} className="flex flex-col hover:border-primary-300 dark:hover:border-primary-800 transition-colors">
                  <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="text-xs font-semibold tracking-wider text-primary-600 uppercase mb-1">{course.code}</div>
                        <CardTitle className="text-lg leading-tight">{course.name}</CardTitle>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 flex-grow space-y-3">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <User className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">{course.lecturer}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      className="w-full" 
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingId === course.id}
                    >
                      {enrollingId === course.id ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling...</>
                      ) : (
                        "Enroll Now"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
              <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No enrollments yet</h3>
              <p className="mt-2 text-slate-500">Browse the available courses to find something to learn.</p>
              <Button className="mt-4" onClick={() => setActiveTab('available')}>Browse Courses</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => (
                <Card key={course.id} className="flex flex-col border-emerald-100 dark:border-emerald-900/30">
                  <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1">{course.code}</div>
                        <CardTitle className="text-lg leading-tight">{course.name}</CardTitle>
                      </div>
                      {course.status === 'APPROVED' ? (
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      ) : course.status === 'REJECTED' ? (
                        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 flex-grow space-y-3">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <User className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">{course.lecturer}</span>
                    </div>
                    <div>
                      {course.status === 'APPROVED' ? (
                        <Badge variant="success">Active</Badge>
                      ) : course.status === 'REJECTED' ? (
                        <Badge variant="danger">Application Rejected</Badge>
                      ) : (
                        <Badge variant="warning">Pending Approval</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
