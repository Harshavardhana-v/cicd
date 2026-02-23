// ============================================================
// ⚠️  DEMO TEST FILE — DELETE AFTER TESTING
// ============================================================
// This file contains 3 INTENTIONAL errors to test detection.
// Open this file in the Editor to see errors highlighted.
// ============================================================

// ─────────────────────────────────────────────
// ❌ ERROR 1: SECURITY — Hardcoded API Key
// The Intelligence Panel should flag this line.
// ─────────────────────────────────────────────
const API_KEY = "sk-hardcoded-secret-demo-key-9999";

// ─────────────────────────────────────────────
// ❌ ERROR 2: SECURITY — Hardcoded Password
// The Intelligence Panel should flag this line too.
// ─────────────────────────────────────────────
const PASSWORD = "super_secret_password_123";

// ─────────────────────────────────────────────
// ❌ ERROR 3: SYNTAX — Missing closing brace
// Monaco editor will underline this in red.
// The function below is never closed properly.
// ─────────────────────────────────────────────
function brokenFunction() {
    const x = 10;
    if (x > 5) {
        console.log("x is greater");
        // ← missing closing brace for if block and function

        export const demoValue = API_KEY;
