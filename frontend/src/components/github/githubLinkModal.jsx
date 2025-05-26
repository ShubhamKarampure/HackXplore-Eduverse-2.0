import { useState } from 'react';
import { Octokit } from '@octokit/rest';
import { X, Search, AlertCircle, Star, GitBranch } from 'lucide-react';
import axios from 'axios';

export default function GithubLinkModal({ project, onClose, onSuccess }) {
  const [accessToken, setAccessToken] = useState('');
  const [step, setStep] = useState('token'); // token, search, confirm
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate token
      const octokit = new Octokit({
        auth: accessToken
      });
      
      // Just to check if token is valid
      await octokit.users.getAuthenticated();
      
      setStep('search');
    } catch (error) {
      setError('Invalid GitHub access token. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const octokit = new Octokit({
        auth: accessToken
      });
      
      const { data } = await octokit.search.repos({
        q: searchTerm,
        per_page: 5,
        sort: 'updated',
      });
      
      setSearchResults(data.items);
    } catch (error) {
      setError('Error searching repositories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRepo = (repo) => {
    setSelectedRepo(repo);
    setStep('confirm');
  };

  const handleConfirmLink = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Update project with GitHub repo info
    //   const response = await fetch(`/api/projects/${project.id}/github`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       repositoryId: selectedRepo.id,
    //       repositoryName: selectedRepo.full_name,
    //       accessToken: accessToken,
    //     }),
    //   });
      
      if (!response.ok) {
        throw new Error('Failed to link repository');
      }
      
      const updatedProject = await response.json();
      onSuccess(updatedProject);
    } catch (error) {
      setError('Failed to link repository. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-stroke dark:border-strokedark">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Link GitHub Repository
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-danger bg-opacity-10 text-danger flex items-center gap-2 rounded-md">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {step === 'token' && (
            <form onSubmit={handleTokenSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  GitHub Personal Access Token
                </label>
                <input
                  type="text"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                  placeholder="Enter your GitHub PAT"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Your token needs 'repo' scope permissions
                </p>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-medium py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all disabled:bg-opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Validating...' : 'Continue'}
              </button>
            </form>
          )}

          {step === 'search' && (
            <>
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                    placeholder="Search repositories..."
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </form>

              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <p className="text-center text-sm text-slate-500 py-4">
                      No repositories found. Try a different search term.
                    </p>
                  ) : (
                    <ul className="divide-y divide-stroke dark:divide-strokedark">
                      {searchResults.map((repo) => (
                        <li key={repo.id} className="py-3">
                          <button
                            onClick={() => handleSelectRepo(repo)}
                            className="w-full text-left hover:bg-slate-50 dark:hover:bg-meta-4 p-2 rounded-md transition-colors"
                          >
                            <p className="font-medium text-slate-900 dark:text-white">{repo.name}</p>
                            <p className="text-xs text-slate-500 truncate">{repo.full_name}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{repo.description || 'No description'}</p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}

          {step === 'confirm' && selectedRepo && (
            <div>
              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <p className="font-medium text-slate-900 dark:text-white">{selectedRepo.name}</p>
                <p className="text-xs text-slate-500">{selectedRepo.full_name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedRepo.description || 'No description'}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Star size={14} />
                    <span>{selectedRepo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitBranch size={14} />
                    <span>{selectedRepo.forks_count}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Are you sure you want to link this repository to your project "{project.title}"?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('search')}
                  className="flex-1 border border-stroke dark:border-strokedark py-2 px-4 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-meta-4 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmLink}
                  disabled={isLoading}
                  className="flex-1 bg-primary text-white font-medium py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all disabled:bg-opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Linking...' : 'Confirm Link'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}