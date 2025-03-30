import { useState } from 'react';
import { 
  GitBranch, 
  Star, 
  Eye, 
  File, 
  Calendar, 
  Clock, 
  Link as LinkIcon, 
  GitCommit, 
  AlertCircle,
  ExternalLink,
  Code,
  Lock,
  Unlock,
  UserCircle,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';

export default function ProjectCard({ project, onLinkGithub, onRefreshRepo }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if we have GitHub data or just the URL
  const hasGithubUrl = project.githubRepoUrl && project.githubRepoUrl.trim() !== '';
  const hasGithubData = project.githubRepo !== null && project.githubRepo !== undefined;
  const isRepoAccessible = hasGithubData && !project.githubRepoError;
  const isPrivateRepo = hasGithubUrl && (!isRepoAccessible || (isRepoAccessible && project.githubRepo.private));
  
  // Format date to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get time elapsed since last update
  const getTimeElapsed = (dateString) => {
    if (!dateString) return 'N/A';
    const updateDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - updateDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    } else {
      const diffYears = Math.floor(diffDays / 365);
      return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
    }
  };

  // Extract repo name from URL if GitHub data isn't available
  const getRepoNameFromUrl = (url) => {
    if (!url) return 'Unknown Repository';
    return url.replace('https://github.com/', '')
              .replace('.git', '')
              .replace(/\/$/, ''); // Remove trailing slash if present
  };

  return (
    <div className="border border-stroke dark:border-strokedark rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg bg-white dark:bg-boxdark">
      {/* Project Header */}
      <div className="p-5 border-b border-stroke dark:border-strokedark">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white truncate">
            {project.title}
          </h3>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            project.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
            project.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          }`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
          </span>
        </div>
        
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
          {project.description || "No description provided"}
        </p>
        
        {/* Student and Course Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              {project.student?.avatar ? (
                <img 
                  src={project.student.avatar} 
                  alt={project.student?.name || "Student"} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserCircle className="text-slate-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {project.student?.name || "Student Name"}
              </p>
            </div>
          </div>
          
          {project.course && (
            <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400">
              {project.course.title || "Course Name"}
            </div>
          )}
        </div>
      </div>

      {/* GitHub Repository Section */}
      {hasGithubUrl ? (
        <div>
          {/* GitHub Header */}
          <div 
            className={`p-4 bg-slate-50 dark:bg-slate-800 border-b border-stroke dark:border-strokedark flex justify-between items-center ${isRepoAccessible ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700' : ''} transition-colors`}
            onClick={() => isRepoAccessible && setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              {isPrivateRepo ? (
                <Lock size={18} className="text-amber-500" />
              ) : (
                <GitBranch size={18} className="text-slate-500" />
              )}
              <a 
                href={isRepoAccessible ? project.githubRepo.html_url : project.githubRepoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary truncate hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {isRepoAccessible 
                  ? project.githubRepo.full_name 
                  : getRepoNameFromUrl(project.githubRepoUrl)
                }
              </a>
              {isPrivateRepo && (
                <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full">
                  Private
                </span>
              )}
            </div>
            {isRepoAccessible && (
              <span className="text-xs text-slate-500">
                {isExpanded ? 'Show less' : 'Show more'}
              </span>
            )}
          </div>

          {/* Repository Access Error Message */}
          {hasGithubUrl && !isRepoAccessible && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-stroke dark:border-strokedark">
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <ShieldAlert size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
                    This repository is private or inaccessible with current permissions.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRefreshRepo && onRefreshRepo(project);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-medium rounded-md transition-colors"
                    >
                      <RefreshCw size={12} />
                      <span>Refresh Repository</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLinkGithub && onLinkGithub(project);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary bg-opacity-10 hover:bg-opacity-20 text-primary dark:bg-primary/20 dark:hover:bg-primary/30 text-xs font-medium rounded-md transition-colors"
                    >
                      <LinkIcon size={12} />
                      <span>Update Repository Link</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Basic GitHub Info (only shown if we have repo data) */}
          {isRepoAccessible && (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-500" />
                <div>
                  <span className="font-semibold">{project.githubRepo.stargazers_count}</span>
                  <span className="text-slate-500 ml-1">Stars</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GitBranch size={16} className="text-blue-500" />
                <div>
                  <span className="font-semibold">{project.githubRepo.forks_count}</span>
                  <span className="text-slate-500 ml-1">Forks</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-purple-500" />
                <div>
                  <span className="font-semibold">{project.githubRepo.watchers_count}</span>
                  <span className="text-slate-500 ml-1">Watchers</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500" />
                <div>
                  <span className="font-semibold">{project.githubRepo.open_issues_count}</span>
                  <span className="text-slate-500 ml-1">Issues</span>
                </div>
              </div>
            </div>
          )}

          {/* Expanded GitHub Info (only shown if we have repo data) */}
          {isRepoAccessible && isExpanded && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-stroke dark:border-strokedark">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Code size={14} className="text-slate-500" />
                    <div>
                      <span className="text-xs text-slate-500">Language:</span>
                      <span className="text-xs font-medium ml-1">{project.githubRepo.language || "Not specified"}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-500" />
                    <div>
                      <span className="text-xs text-slate-500">Created:</span>
                      <span className="text-xs font-medium ml-1">{formatDate(project.githubRepo.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-500" />
                    <div>
                      <span className="text-xs text-slate-500">Last updated:</span>
                      <span className="text-xs font-medium ml-1">{getTimeElapsed(project.githubRepo.updated_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {project.githubRepo.private ? (
                      <Lock size={14} className="text-slate-500" />
                    ) : (
                      <Unlock size={14} className="text-slate-500" />
                    )}
                    <div>
                      <span className="text-xs text-slate-500">Visibility:</span>
                      <span className="text-xs font-medium ml-1">{project.githubRepo.private ? "Private" : "Public"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <GitCommit size={14} className="text-slate-500" />
                    <div>
                      <span className="text-xs text-slate-500">Default branch:</span>
                      <span className="text-xs font-medium ml-1">{project.githubRepo.default_branch}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <UserCircle size={14} className="text-slate-500" />
                    <div>
                      <span className="text-xs text-slate-500">Owner:</span>
                      <a 
                        href={project.githubRepo.owner?.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-medium ml-1 text-primary hover:underline"
                      >
                        {project.githubRepo.owner?.login}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                <a 
                  href={project.githubRepo.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-medium rounded-md transition-colors"
                >
                  <ExternalLink size={12} />
                  <span>View on GitHub</span>
                </a>
                
                {project.githubRepo.has_issues && (
                  <a 
                    href={`${project.githubRepo.html_url}/issues`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-medium rounded-md transition-colors"
                  >
                    <AlertCircle size={12} />
                    <span>Issues</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-5 bg-slate-50 dark:bg-slate-800">
          <button
            onClick={() => onLinkGithub(project)}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-500 hover:text-primary hover:border-primary transition-colors bg-white dark:bg-slate-700"
          >
            <LinkIcon size={16} />
            <span>Link GitHub Repository</span>
          </button>
        </div>
      )}
    </div>
  );
}