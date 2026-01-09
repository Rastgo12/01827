import { AppData, GitHubConfig } from '../types';

export const fetchFromGitHub = async (config: GitHubConfig): Promise<{ data: AppData; sha: string }> => {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${config.token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub Fetch Failed: ${response.statusText}`);
  }

  const json = await response.json();
  const content = decodeURIComponent(escape(window.atob(json.content))); // Handle UTF-8 safely
  
  return {
    data: JSON.parse(content),
    sha: json.sha
  };
};

export const saveToGitHub = async (config: GitHubConfig, data: AppData): Promise<string> => {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`;
  
  // Pretty print JSON for readability in repo
  const content = JSON.stringify(data, null, 2);
  const base64Content = window.btoa(unescape(encodeURIComponent(content))); // Handle UTF-8 safely

  const body: any = {
    message: `Update db.json - ${new Date().toISOString()}`,
    content: base64Content,
  };

  if (config.sha) {
    body.sha = config.sha;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`GitHub Save Failed: ${err.message || response.statusText}`);
  }

  const json = await response.json();
  return json.content.sha;
};