export interface AISuggestion {
    id: string;
    line: number;
    type: 'security' | 'optimization' | 'best-practice';
    message: string;
    confidence: number;
    fix?: string;
}

export const mockSuggestions: Record<string, AISuggestion[]> = {
    'src/app/page.tsx': [
        {
            id: 's1',
            line: 10,
            type: 'security',
            message: 'Potential unvalidated input handling in this block.',
            confidence: 0.92,
            fix: 'Use a sanitization library like DOMPurify.'
        },
        {
            id: 's2',
            line: 15,
            type: 'optimization',
            message: 'Consider memoizing this component to prevent unnecessary re-renders.',
            confidence: 0.85,
        }
    ],
    'src/components/layout/Shell.tsx': [
        {
            id: 's3',
            line: 25,
            type: 'best-practice',
            message: 'Zustand state selectors should be more granular for better performance.',
            confidence: 0.88,
        }
    ]
};

export interface Repository {
    name: string;
    owner: string;
    qualityScore: number;
    lastAnalysis: string;
    issues: number;
    stars: number;
    language: string;
}

export const mockRepos: Repository[] = [
    {
        name: 'codesage-core',
        owner: 'antigravity-ai',
        qualityScore: 92,
        lastAnalysis: '2 mins ago',
        issues: 12,
        stars: 1240,
        language: 'TypeScript'
    },
    {
        name: 'react-dashboard-pro',
        owner: 'dev-alex',
        qualityScore: 78,
        lastAnalysis: '1 hour ago',
        issues: 45,
        stars: 850,
        language: 'JavaScript'
    },
    {
        name: 'python-microservice-template',
        owner: 'cloud-solutions',
        qualityScore: 85,
        lastAnalysis: 'Yesterday',
        issues: 8,
        stars: 320,
        language: 'Python'
    }
];
