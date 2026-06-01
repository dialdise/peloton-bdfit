import type { AppData } from '../types';

const FILE_PATH = 'data/app-data.json';

interface GitHubFile {
  sha: string;
  content: string;
}

async function getFile(token: string, owner: string, repo: string): Promise<GitHubFile | null> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${FILE_PATH}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub error: ${res.status}`);
  const json = await res.json();
  return { sha: json.sha, content: atob(json.content.replace(/\n/g, '')) };
}

export async function syncFromGitHub(token: string, owner: string, repo: string): Promise<AppData | null> {
  const file = await getFile(token, owner, repo);
  if (!file) return null;
  return JSON.parse(file.content) as AppData;
}

export async function pushToGitHub(token: string, owner: string, repo: string, data: AppData): Promise<void> {
  const existing = await getFile(token, owner, repo);
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
  const body: Record<string, unknown> = {
    message: `Update: ${new Date().toISOString()}`,
    content,
  };
  if (existing) body.sha = existing.sha;

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `GitHub error: ${res.status}`);
  }
}
