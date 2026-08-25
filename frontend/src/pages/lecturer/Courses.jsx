import React, { useState, useEffect } from 'react';
import { Users, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/lecturer/courses', {
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

    fetchCourses();
  }, [navigate]);

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
          <h1 className="text-3xl font-bold tracking-tight">Courses Managed</h1>
          <p className="text-slate-500 dark:text-slate-400">View and manage the academic courses assigned to you.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
            You have not been assigned any courses yet.
          </div>
        ) : (
          courses.map((course) => (
            <Card key={course.id} className="hover:border-primary-200 hover:shadow-md transition-all group">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {course.code}
                </div>
              </div>
              <CardTitle className="mt-4 text-xl line-clamp-1">{course.title}</CardTitle>
              <CardDescription>{course.code}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                <Users className="h-4 w-4 mr-2" />
                {course.students} Enrolled Students
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <Button variant="ghost" className="w-full justify-between group-hover:text-primary-600 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                Open Course <ExternalLink className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          ))
        )}
      </div>
    </div>
  );
}
