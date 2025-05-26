'use client'

// app/projects/page.js
import { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import { useRouter } from 'next/navigation';
import ProjectCard from '@/components/github/projectCard';
import GithubLinkModal from '@/components/github/githubLinkModal';
import ProjectSkeleton from '@/components/github/projectSkeleton';
import axios from 'axios';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const router = useRouter();

  // Function to fetch GitHub repo data
  const fetchGitHubRepoData = async (project) => {
    if (!project.githubRepoUrl) return project;

    try {
      // Initialize Octokit
      const octokit = new Octokit({
        auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN, // Optional: Use if you need higher rate limits
      });
      
      // Extract owner and repo from GitHub URL
      const urlParts = project.githubRepoUrl
        .replace('https://github.com/', '')
        .replace('.git', '')
        .replace(/\/$/, '') // Remove trailing slash if present
        .split('/');
      
      if (urlParts.length >= 2) {
        const owner = urlParts[0];
        const repo = urlParts[1];
        
        // Fetch repository details from GitHub
        const { data: repoData } = await octokit.repos.get({
          owner,
          repo,
        });
        
        // Add GitHub data to the project
        return {
          ...project,
          githubRepo: repoData,
          githubRepoName: `${owner}/${repo}`,
          githubRepoError: null
        };
      }
      
      return {
        ...project,
        githubRepo: null,
        githubRepoError: "Invalid repository URL format"
      };
    } catch (error) {
      console.error('Error fetching GitHub repo:', error);
      
      // Set appropriate error information
      return {
        ...project,
        githubRepo: null,
        githubRepoError: error.status === 404 
          ? "Repository not found or is private" 
          : error.message || "Failed to fetch repository data"
      };
    }
  };

  // Function to fetch all projects and their GitHub data
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projects`);
      const projectsData = response.data.data;
      
      // Enrich projects with GitHub data
      const enrichedProjects = await Promise.all(
        projectsData.map(fetchGitHubRepoData)
      );
      
      setProjects(enrichedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleLinkGithub = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleRefreshRepo = async (project) => {
    // Set loading state for that specific project
    setProjects(currentProjects => 
      currentProjects.map(p => 
        p._id === project._id 
          ? { ...p, isRefreshing: true } 
          : p
      )
    );
    
    // Fetch the updated repository data
    const updatedProject = await fetchGitHubRepoData(project);
    
    // Update the projects array with the refreshed project
    setProjects(currentProjects => 
      currentProjects.map(p => 
        p._id === project._id 
          ? { ...updatedProject, isRefreshing: false } 
          : p
      )
    );
  };

  const handleCreateProject = () => {
    // Navigate to project creation form using Next.js router
    router.push('/projects/create');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Student Projects</h1>
        <button
          onClick={handleCreateProject}
          className="bg-primary text-white font-medium px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all"
        >
          Create New Project
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <ProjectSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <ProjectCard 
              key={index} 
              project={project} 
              onLinkGithub={() => handleLinkGithub(project)}
              onRefreshRepo={handleRefreshRepo}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <GithubLinkModal
          project={selectedProject}
          onClose={() => setIsModalOpen(false)}
          onSuccess={async (updatedProject) => {
            // When a project is successfully updated, fetch new GitHub data and update it in the projects array
            const enrichedProject = await fetchGitHubRepoData(updatedProject);
            
            setProjects(projects.map(p => 
              p._id === enrichedProject._id ? enrichedProject : p
            ));
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}