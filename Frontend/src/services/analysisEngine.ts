export interface AISuggestion {
    id: string;
    line: number;
    type: 'security' | 'optimization' | 'best-practice';
    message: string;
    confidence: number;
    fix?: string;
}

const SECURITY_PATTERNS = [
    {
        regex: /(?:\bPASSWORD\b|\bSECRET_KEY\b|\bAPI_KEY\b)\s*=\s*["']([^"']+)["']/gi,
        message: "Hardcoded credentials detected. Secrets should be stored in environment variables.",
        confidence: 0.98,
        fix: "Move secret to .env file and use process.env or os.environ."
    },
    {
        regex: /f"SELECT\s+.*\s+WHERE\s+.*\{.*\}"/gi,
        message: "Potential SQL Injection via f-string concatenation in query.",
        confidence: 0.95,
        fix: "Use parameterized queries (e.g., cursor.execute('SELECT... WHERE x=?', (val,)))."
    },
    {
        regex: /import\s+pickle/g,
        message: "Insecure deserialization library 'pickle' imported.",
        confidence: 0.85,
        fix: "Use safer formats like JSON for untrusted data."
    },
    {
        regex: /pickle\.load\(/g,
        message: "Dangerous use of 'pickle.load' on potentially untrusted input.",
        confidence: 0.95,
        fix: "Strictly avoid unpickling data from external sources."
    },
    {
        regex: /cursor\.execute\(.*f["'].*\{.*\}["']\)/gi,
        message: "Direct string formatting in SQL execution detected.",
        confidence: 0.98,
        fix: "Always use bind parameters to prevent SQL injection."
    }
];

export function analyzeCode(code: string, fileName: string): AISuggestion[] {
    if (!code) return [];

    const lines = code.split('\n');
    const suggestions: AISuggestion[] = [];

    // Scan for security risks using patterns
    SECURITY_PATTERNS.forEach(pattern => {
        let match;
        // Reset regex state for global matches
        pattern.regex.lastIndex = 0;

        while ((match = pattern.regex.exec(code)) !== null) {
            const index = match.index;
            // Find line number
            const lineNo = code.substring(0, index).split('\n').length;

            suggestions.push({
                id: `sec-${lineNo}-${Math.random().toString(36).substr(2, 5)}`,
                line: lineNo,
                type: 'security',
                message: pattern.message,
                confidence: pattern.confidence,
                fix: pattern.fix
            });
        }
    });

    // Simple heuristic for optimizations (can be expanded)
    if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
        lines.forEach((line, i) => {
            if (line.includes('useState') && !line.includes('useMemo') && !line.includes('useCallback')) {
                if (line.length > 100) { // Heuristic for complex components
                    suggestions.push({
                        id: `opt-${i + 1}`,
                        line: i + 1,
                        type: 'optimization',
                        message: "Consider memoizing this logic or component to prevent unnecessary re-renders.",
                        confidence: 0.7
                    });
                }
            }
        });
    }

    return suggestions.sort((a, b) => a.line - b.line);
}
