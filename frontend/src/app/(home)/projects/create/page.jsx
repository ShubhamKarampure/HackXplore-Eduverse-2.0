'use client'

// app/projects/create/page.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function CreateProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    status: 'not-started',
    githubRepoName: '' ,
    githubRepoUrl:''// Added this field as it's required by your model
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data for courses - replace with API call
  const courses = [
    { id: '67e7af5a792f6aa80daff4d3', title: 'Web Development Fundamentals' },
    { id: '67e7af5a792f6aa80daff4d3', title: 'Full Stack JavaScript' },
    { id: '67e7af5a792f6aa80daff4d3', title: 'Mobile App Development' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Send the formData directly, not wrapped in jsonFormData
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projects`, formData);

      console.log(response.data);

      router.push('/projects');
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      setError('Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">Create New Project</h1>

        {error && (
          <div className="mb-4 p-3 bg-danger bg-opacity-10 text-danger flex items-center gap-2 rounded-md">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Project Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
              placeholder="Enter project title"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
              placeholder="Describe your project"
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="courseId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Course
            </label>
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
              required
            >
              <option value="">Select a course</option>
              {courses.map((course,index) => (
                <option key={index} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="githubRepoUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              GitHub Repository URL
            </label>
            <input
              type="text"
              id="githubRepoUrl"
              name="githubRepoUrl"
              value={formData.githubRepoUrl}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
              placeholder="Repository URL"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-stroke dark:border-strokedark py-3 px-4 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-meta-4 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-white font-medium py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all disabled:bg-opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}