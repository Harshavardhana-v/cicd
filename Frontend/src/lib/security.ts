import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content from AI models or external sources.
 * Uses a strict whitelist of allowed tags and attributes to prevent XSS.
 */
export function sanitizeAIContent(html: string): string {
    // Basic strict config
    const config = {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'pre', 'span', 'ul', 'li', 'ol', 'br', 'p'],
        ALLOWED_ATTR: ['class', 'style'],
    };

    if (typeof window !== 'undefined') {
        return DOMPurify.sanitize(html, config) as string;
    }

    return html; // Fallback for SSR if needed, though usually cleaned on client
}

/**
 * Validates file paths to prevent traversal attempts.
 */
export function validatePath(path: string): boolean {
    // Basic whitelist: alpha-numeric, underscores, hyphens, dots, slashes
    const pathRegex = /^[a-zA-Z0-9_\-\/\.]+$/;
    return pathRegex.test(path) && !path.includes('..');
}
