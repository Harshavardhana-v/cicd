require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

// GitHub API Proxy for Recursive Tree (Real Code Structure)
app.get('/api/github/tree/:owner/:repo', async (req, res) => {
    const { owner, repo } = req.params;
    try {
        // Get the default branch first
        const repoInfo = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
        const defaultBranch = repoInfo.data.default_branch;

        // Get recursive tree
        const treeResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);

        res.json({
            branch: defaultBranch,
            tree: treeResponse.data.tree
        });
    } catch (error) {
        console.error('Error fetching tree:', error.message);
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
            message: 'Outdated dependencies detected in package-lock.json'
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

app.listen(PORT, () => {
    console.log(`CodeSage Backend running on port ${PORT}`);
});
