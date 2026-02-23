export interface AISuggestion {
    id: string;
    line: number;
    type: 'security' | 'optimization' | 'best-practice';
    message: string;
    hint: string;
    confidence: number;
    fix?: string;
}

export interface GraphNode {
    id: string;
    type: 'file' | 'function' | 'import' | 'class';
    label: string;
    data?: any;
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
}

export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

const SECURITY_PATTERNS = [
    // ... same as before
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

/**
 * Simple regex-based structure extraction for visualization
 */
function extractStructure(code: string, fileName: string): GraphData {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const fileId = `file-${fileName}`;

    // Add main file node
    nodes.push({ id: fileId, type: 'file', label: fileName.split('/').pop() || fileName });

    const lines = code.split('\n');

    // Regex patterns
    const patterns = {
        import: /import\s+.*\s+from\s+['"](.*)['"]/g,
        func: /(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g,
        class: /class\s+([a-zA-Z0-9_$]+)/g
    };

    lines.forEach((line, i) => {
        // Imports
        let match;
        while ((match = patterns.import.exec(line)) !== null) {
            const importLabel = match[1];
            const importId = `import-${importLabel}-${i}`;
            nodes.push({ id: importId, type: 'import', label: importLabel });
            edges.push({ id: `e-${fileId}-${importId}`, source: fileId, target: importId });
        }

        // Functions
        patterns.func.lastIndex = 0; // reset
        while ((match = patterns.func.exec(line)) !== null) {
            const funcName = match[1] || match[2];
            if (funcName) {
                const funcId = `func-${funcName}-${i}`;
                nodes.push({ id: funcId, type: 'function', label: funcName });
                edges.push({ id: `e-${fileId}-${funcId}`, source: fileId, target: funcId });
            }
        }

        // Classes
        patterns.class.lastIndex = 0;
        while ((match = patterns.class.exec(line)) !== null) {
            const className = match[1];
            const classId = `class-${className}-${i}`;
            nodes.push({ id: classId, type: 'class', label: className });
            edges.push({ id: `e-${fileId}-${classId}`, source: fileId, target: classId });
        }
    });

    return { nodes, edges };
}

/**
 * Masks sensitive information (PII) like emails and phone numbers
 */
export function maskPII(text: string): string {
    if (!text) return '';
    return text
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL-MASKED]')
        .replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE-MASKED]');
}

export function analyzeCode(code: string, fileName: string): { suggestions: AISuggestion[], graphData: GraphData } {
    if (!code || !fileName) return { suggestions: [], graphData: { nodes: [], edges: [] } };

    // Skip non-code files entirely
    if (!isCodeFile(fileName)) return { suggestions: [], graphData: { nodes: [], edges: [] } };

    const graphData = extractStructure(code, fileName);
    const lines = code.split('\n');
    const suggestions: AISuggestion[] = [];

    // Scan for security risks using patterns
    SECURITY_PATTERNS.forEach(pattern => {
        let match;
        pattern.regex.lastIndex = 0;

        while ((match = pattern.regex.exec(code)) !== null) {
            const index = match.index;
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

    // Simple heuristic for optimizations
    if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
        lines.forEach((line, i) => {
            if (line.includes('useState') && !line.includes('useMemo') && !line.includes('useCallback')) {
                if (line.length > 100) {
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

    return {
        suggestions: suggestions.sort((a, b) => a.line - b.line),
        graphData
    };
}
