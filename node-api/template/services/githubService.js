const axios = require('axios');
const { execSync } = require('child_process');

class GitHubService {
  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
    this.githubOwner = process.env.GITHUB_OWNER || 'hexspark-digital';
    this.githubRepo = process.env.GITHUB_REPO || '${{values.app_name}}';
    this.githubApiUrl = 'https://api.github.com';
  }

  async getLocalGitInfo() {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      const lastCommit = execSync('git log -1 --pretty=format:"%H|%an|%ae|%ad|%s"', { encoding: 'utf8' }).trim();
      const [hash, author, email, date, message] = lastCommit.split('|');
      
      return {
        branch,
        lastCommit: {
          hash: hash.substring(0, 7),
          fullHash: hash,
          author,
          email,
          date,
          message
        }
      };
    } catch (error) {
      console.warn('Could not get local git info:', error.message);
      return null;
    }
  }

  async getGitHubRepoInfo() {
    if (!this.githubToken) {
      console.warn('GITHUB_TOKEN not provided, skipping GitHub API calls');
      return null;
    }

    try {
      const headers = {
        'Authorization': `token ${this.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      };

      const [repoResponse, branchesResponse] = await Promise.all([
        axios.get(`${this.githubApiUrl}/repos/${this.githubOwner}/${this.githubRepo}`, { headers }),
        axios.get(`${this.githubApiUrl}/repos/${this.githubOwner}/${this.githubRepo}/branches`, { headers })
      ]);

      const repo = repoResponse.data;
      const branches = branchesResponse.data;

      const defaultBranch = branches.find(b => b.name === repo.default_branch);
      const mainBranch = branches.find(b => b.name === 'main') || defaultBranch;

      let latestCommit = null;
      if (mainBranch) {
        const commitResponse = await axios.get(
          `${this.githubApiUrl}/repos/${this.githubOwner}/${this.githubRepo}/commits/${mainBranch.commit.sha}`,
          { headers }
        );
        latestCommit = commitResponse.data;
      }

      return {
        repo: {
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          url: repo.html_url,
          defaultBranch: repo.default_branch,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          openIssues: repo.open_issues_count,
          language: repo.language,
          updatedAt: repo.updated_at,
          createdAt: repo.created_at
        },
        branches: branches.map(b => ({
          name: b.name,
          protected: b.protected,
          lastCommit: b.commit.sha.substring(0, 7)
        })),
        latestCommit: latestCommit ? {
          hash: latestCommit.sha.substring(0, 7),
          fullHash: latestCommit.sha,
          author: latestCommit.commit.author.name,
          email: latestCommit.commit.author.email,
          date: latestCommit.commit.author.date,
          message: latestCommit.commit.message,
          url: latestCommit.html_url
        } : null
      };
    } catch (error) {
      console.error('Error fetching GitHub repo info:', error.message);
      return null;
    }
  }

  async getGitHubWorkflowStatus() {
    if (!this.githubToken) {
      return null;
    }

    try {
      const headers = {
        'Authorization': `token ${this.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      };

      const response = await axios.get(
        `${this.githubApiUrl}/repos/${this.githubOwner}/${this.githubRepo}/actions/runs`,
        { headers, params: { per_page: 5 } }
      );

      return response.data.workflow_runs.map(run => ({
        id: run.id,
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
        createdAt: run.created_at,
        updatedAt: run.updated_at,
        url: run.html_url,
        branch: run.head_branch,
        commit: run.head_sha.substring(0, 7)
      }));
    } catch (error) {
      console.error('Error fetching GitHub workflow status:', error.message);
      return null;
    }
  }

  async getAllInfo() {
    const [localGit, githubRepo, workflows] = await Promise.all([
      this.getLocalGitInfo(),
      this.getGitHubRepoInfo(),
      this.getGitHubWorkflowStatus()
    ]);

    return {
      local: localGit,
      github: githubRepo,
      workflows: workflows
    };
  }
}

module.exports = new GitHubService();
