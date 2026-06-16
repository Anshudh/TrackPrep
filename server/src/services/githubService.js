import axios from 'axios';

class GithubService {
  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'TrackPrep-Application'
      }
    });

    // Support optional GitHub OAuth or Personal Access Token configurations
    const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `token ${token}`;
      console.log('GitHub API service initialized with token authorization.');
    }
  }

  async fetchUserProfile(username) {
    try {
      const response = await this.api.get(`/users/${username}`);
      return {
        success: true,
        data: response.data // Contains public_repos, followers, following, created_at, etc.
      };
    } catch (err) {
      console.error(`Error querying GitHub profile for username: ${username}`, err.message);
      return {
        success: false,
        error: err.message
      };
    }
  }

  async fetchUserCommits(username, repoName) {
    try {
      const response = await this.api.get(`/repos/${username}/${repoName}/commits`);
      return {
        success: true,
        data: response.data // Array of commit details
      };
    } catch (err) {
      console.error(`Error querying commits for repo ${username}/${repoName}:`, err.message);
      return {
        success: false,
        error: err.message
      };
    }
  }
}

export default new GithubService();
