/**
 * This file is intentionally designed to contain multiple types of coding errors,
 * security vulnerabilities, and bad practices for demonstration and testing purposes.
 */

// 1. SECURITY: Hardcoded Sensitive Information
const API_KEY = "sk-live-5f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c"; // Critical: Leaked API Key
const DB_PASSWORD = "password123"; // Critical: Hardcoded credentials

// 2. SECURITY: Potential SQL Injection (Mockup)
function getUser(userId: string) {
    // Dangerous: Direct string concatenation in a query
    const query = `SELECT * FROM users WHERE id = '${userId}'`;
    console.log("Executing query:", query);
}

// 3. SECURITY: Insecure use of eval (Potential RCE)
function executeCode(userInput: string) {
    eval(userInput); // Highly Dangerous: Remote Code Execution vulnerability
}

// 4. LOGIC ERROR: Off-by-one error
function printNumbers() {
    const arr = [1, 2, 3, 4, 5];
    // Bug: Accesses index 5 which is out of bounds (arr.length is 5, max index is 4)
    for (let i = 0; i <= arr.length; i++) {
        console.log(arr[i]);
    }
}

// 5. RUNTIME ERROR: Null pointer dereference
function processData(data: any) {
    const config = null;
    // Crash: Cannot read property 'version' of null
    const version = config.version;
    console.log(version);
}

// 6. TYPE ERROR: TypeScript Type Mismatch
function calculateTotal(price: number) {
    return price * 1.1;
}
// Error: Argument of type 'string' is not assignable to parameter of type 'number'
// @ts-ignore (uncommenting this would hide the error, but we want it visible for tools)
calculateTotal("100");

// 7. LOGIC ERROR: Division by zero
function getAverage(total: number, count: number) {
    if (count === 0) {
        // This will result in Infinity in JS, but might be a logic error depending on context
        return total / 0;
    }
    return total / count;
}

// 8. SYNTAX ERROR: Intentional syntax issue
// Unclosed brace or missing token (Note: This may prevent the file from being parsed)
function incompleteFunction() {
    if (true) {
        console.log("Missing closing brace for the if statement");
        // Missing } for if
    } // This belongs to the function

    // 9. RESOURCE LEAK: Non-closed connection (Mockup)
    function fetchData() {
        const connection = { open: true, close: () => console.log("Closed") };
        console.log("Connection opened");
        // Logic error: Connection is never closed
        return "data";
    }

    // 10. UNUSED VARIABLE
    const unusedSecret = "nobody sees this";

    getUser("1'; DROP TABLE users; --");
    printNumbers();
    processData({});
    fetchData();
