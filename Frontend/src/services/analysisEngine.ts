export interface AISuggestion {
    id: string;
    line: number;
    type: 'security' | 'optimization' | 'best-practice';
    message: string;
    hint: string;
    confidence: number;
    fix?: string;
}

const SECURITY_PATTERNS = [
    {
        regex: /(?:\bPASSWORD\b|\bSECRET_KEY\b|\bAPI_KEY\b)\s*=\s*["']([^"']+)["']/gi,
        message: "Hardcoded credentials detected.",
        hint: "Secrets should be stored in environment variables (e.g., .env) to prevent accidental exposure.",
        confidence: 0.98,
        fix: "Move secret to .env file and use process.env or os.environ."
    },
    {
        regex: /f"SELECT\s+.*\s+WHERE\s+.*\{.*\}"/gi,
        message: "Potential SQL Injection.",
        hint: "Concatenating user input into SQL strings is dangerous. Use parameterized queries instead.",
        confidence: 0.95,
        fix: "Use parameterized queries (e.g., cursor.execute('SELECT... WHERE x=?', (val,)))."
    },
    {
        regex: /import\s+pickle/g,
        message: "Insecure deserialization library.",
        hint: "The 'pickle' module is not secure. Use JSON or another safe format for untrusted data.",
        confidence: 0.85,
        fix: "Use safer formats like JSON for untrusted data."
    },
    {
        regex: /pickle\.load\(/g,
        message: "Dangerous use of 'pickle.load'.",
        hint: "Strictly avoid unpickling data from external sources as it can lead to remote code execution.",
        confidence: 0.95,
        fix: "Use JSON.parse() or similar for structured data."
    }
];

// Only analyze real code files – not CSS, markdown, JSON, images, config, etc.
const CODE_EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.php', '.rb', '.swift', '.kt'];

function isCodeFile(fileName: string): boolean {
    const lower = fileName.toLowerCase();
    return CODE_EXTENSIONS.some(ext => lower.endsWith(ext));
}

export function analyzeCode(code: string, fileName: string): AISuggestion[] {
    if (!code || !fileName) return [];

    // Skip non-code files entirely (CSS, markdown, JSON, images, lock files, etc.)
    if (!isCodeFile(fileName)) return [];

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
                hint: pattern.hint,
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
                        message: "Redundant re-render risk.",
                        hint: "This component logic seems complex and might cause performance issues. Consider using useMemo or useCallback.",
                        confidence: 0.7
                    });
                }
            }
        });
    }

    return suggestions.sort((a, b) => a.line - b.line);
}
