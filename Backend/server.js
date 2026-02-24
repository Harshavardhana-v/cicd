import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// GitHub API Proxy for PRs and Issues
app.get('/api/github/metrics/:owner/:repo', async (req, res) => {
    const { owner, repo } = req.params;
    try {
        const [repoData, prsData] = await Promise.all([
            axios.get(`https://api.github.com/repos/${owner}/${repo}`),
            axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=1`)
        ]);

        const prsLinkHeader = prsData.headers.link;
        let prTotal = 0;
        if (prsLinkHeader) {
            const match = prsLinkHeader.match(/page=(\d+)>; rel="last"/);
            prTotal = match ? parseInt(match[1]) : 0;
        } else {
            prTotal = prsData.data.length;
        }

        res.json({
            issues: repoData.data.open_issues_count,
            prs: prTotal,
            stars: repoData.data.stargazers_count,
            language: repoData.data.language,
            description: repoData.data.description
        });
    } catch (error) {
        console.error('Error fetching metrics:', error.message);
        res.status(500).json({ error: 'Failed to fetch repository metrics' });
    }
});

// Helper for GitHub Headers
const getHeaders = () => {
    return process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {};
};

// GitHub API Proxy for Recursive Tree (Real Code Structure)
app.get('/api/github/tree/:owner/:repo', async (req, res) => {
    const { owner, repo } = req.params;
    console.log(`[Tree] Requesting structure for ${owner}/${repo}`);
    try {
        // Get the default branch first
        const repoInfo = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers: getHeaders() });
        const defaultBranch = repoInfo.data.default_branch;

        // Get recursive tree
        const treeResponse = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
            { headers: getHeaders() }
        );

        // Filter out noise to keep frontend building fast
        const EXCLUDE_PATHS = ['.git/', 'node_modules/', 'dist/', 'build/', '.next/', 'package-lock.json'];
        const filteredTree = treeResponse.data.tree.filter(item =>
            !EXCLUDE_PATHS.some(ex => item.path.includes(ex))
        );

        console.log(`[Tree] Success: ${filteredTree.length} nodes returned (filtered from ${treeResponse.data.tree.length})`);
        res.json({
            branch: defaultBranch,
            tree: filteredTree
        });
    } catch (error) {
        console.error(`[Tree] Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch repository structure' });
    }
});

// Endpoint to simulate Deep Analysis on real code
app.post('/api/analysis/scan', async (req, res) => {
    const { owner, repo, tree } = req.body;

    // Simulations based on file types in the tree
    const fileCount = tree.filter(f => f.type === 'blob').length;
    const hasReadme = tree.some(f => f.path.toLowerCase() === 'readme.md');
    const hasLicense = tree.some(f => f.path.toLowerCase() === 'license');

    // Mocking vulnerability detection
    const vulnerabilities = [];
    if (tree.some(f => f.path.includes('package-lock.json'))) {
        vulnerabilities.push({
            type: 'Security',
            severity: 'High',
            message: 'Outdated dependencies detected.',
            hint: 'The package-lock.json reflects versions with known vulnerabilities. Run `npm audit fix` to resolve.'
        });
    }

    const docErrors = [];
    if (!hasReadme) docErrors.push('Missing comprehensive README.md');
    if (!hasLicense) docErrors.push('Missing LICENSE file for community contribution');

    const guidelineViolations = [];
    if (!tree.some(f => f.path === '.github/CONTRIBUTING.md')) {
        guidelineViolations.push('Missing CONTRIBUTING.md guideline');
    }

    res.json({
        qualityScore: Math.floor(Math.random() * 15) + 80,
        vulnerabilities,
        docErrors,
        guidelineViolations,
        prImpact: {
            score: Math.floor(Math.random() * 20) + 70,
            summary: "Pending PRs show minor structural variations. No breaking changes detected in core modules."
        }
    });
});

// Endpoint: Fetch real Pull Requests from GitHub
app.get('/api/github/prs/:owner/:repo', async (req, res) => {
    const { owner, repo } = req.params;
    const { state = 'open', per_page = 20 } = req.query;
    try {
        const headers = process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {};
        const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=${per_page}`,
            { headers }
        );
        const prs = response.data.map(pr => ({
            number: pr.number,
            title: pr.title,
            state: pr.state,
            user: pr.user.login,
            userAvatar: pr.user.avatar_url,
            createdAt: pr.created_at,
            updatedAt: pr.updated_at,
            body: pr.body,
            headBranch: pr.head.ref,
            baseBranch: pr.base.ref,
            headSha: pr.head.sha,
            baseSha: pr.base.sha,
            additions: pr.additions,
            deletions: pr.deletions,
            changedFiles: pr.changed_files,
            draft: pr.draft,
            merged: pr.merged,
            mergedAt: pr.merged_at,
            url: pr.html_url,
            filesUrl: pr.url + '/files',
        }));
        res.json({ prs });
    } catch (error) {
        console.error('Error fetching PRs:', error.message);
        res.status(500).json({ error: 'Failed to fetch pull requests' });
    }
});

// Endpoint: Fetch individual file content from GitHub
app.get('/api/github/file/:owner/:repo', async (req, res) => {
    const { owner, repo } = req.params;
    const { path, branch = 'main' } = req.query;
    if (!path) return res.status(400).json({ error: 'path query param required' });
    try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
        const response = await axios.get(rawUrl, { responseType: 'text' });
        res.json({ content: response.data, path, branch });
    } catch (error) {
        console.error('Error fetching file:', error.message);
        res.status(404).json({ error: `File not found: ${path}` });
    }
});

// Endpoint: Fetch PR file diffs
app.get('/api/github/pr-files/:owner/:repo/:prNumber', async (req, res) => {
    const { owner, repo, prNumber } = req.params;
    try {
        const headers = process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {};
        const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`,
            { headers }
        );
        const files = response.data.map(f => ({
            filename: f.filename,
            status: f.status,
            additions: f.additions,
            deletions: f.deletions,
            patch: f.patch || '',
            rawUrl: f.raw_url,
            blobUrl: f.blob_url,
        }));
        res.json({ files });
    } catch (error) {
        console.error('Error fetching PR files:', error.message);
        res.status(500).json({ error: 'Failed to fetch PR file diffs' });
    }
});

import { initSocket } from './socket.js';

const server = app.listen(PORT, () => {
    console.log(`CodeSage Backend running on port ${PORT}`);
});

initSocket(server);
