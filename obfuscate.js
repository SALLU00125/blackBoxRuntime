// scripts/obfuscate-lock.js
import fs from 'fs';
import path from 'path';
import JavaScriptObfuscator from 'javascript-obfuscator';

//Outputs Vars
const LK_Comp = 'Core';
const LK_CompFileName = 'core-ui-runtime';

const filePath = path.resolve(`src/${LK_Comp}/${LK_CompFileName}.es.js`);


console.log(`🔒 Obfuscating: ${filePath}`);

let code = fs.readFileSync(filePath, 'utf8');

const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
    // 1. COMPRESSION
    compact: true,
    simplify: true,

    // 2. CONTROL FLOW PROTECTION
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.9,

    // 3. STRING OBFUSCATION
    stringArray: true,
    stringArrayEncoding: ['rc4'], // RC4 only is stronger & more stable than base64+rc4
    stringArrayThreshold: 1,
    stringArrayWrappersCount: 5,
    stringArrayWrappersType: 'function',
    stringArrayWrappersChainedCalls: true,
    stringArrayIndexShift: true,
    stringArrayWrappersParametersMaxCount: 4, // ADDED: More wrapper complexity
    stringArrayRotate: true,
    stringArrayShuffle: true,

    // REMOVED: stringArrayReverse - not needed with rc4
    // REMOVED: stringArrayWrappersMaxCallCount - deprecated/conflicts

    // 4. STRING SPLITTING
    splitStrings: true, // ENABLED: Try this - if it breaks, disable
    splitStringsChunkLength: 3, // Smaller chunks = harder to read

    // 5. IMPORT HANDLING
    ignoreImports: true,

    // 6. IDENTIFIER OBFUSCATION
    identifierNamesGenerator: 'hexadecimal',
    identifiersPrefix: '_0x',
    renameGlobals: false,

    // REMOVED: identifiersDictionary - conflicts with hexadecimal generator

    // 7. OBJECT & NUMBER TRANSFORMATION
    transformObjectKeys: true,
    numbersToExpressions: true, // ADDED: Convert numbers to expressions

    // 8. UNICODE OBFUSCATION
    unicodeEscapeSequence: true,

    // 9. RESERVED NAMES (Minimal - only what's absolutely necessary)
    reservedNames: [
        // Core React
        '^React$', '^useState$', '^useEffect$', '^useContext$',
        '^useMemo$', '^useCallback$', '^useRef$', '^useReducer$',
        '^useLayoutEffect$', '^jsx$', '^jsxs$', '^Fragment$',
        '^default$', // Keep default exports working

        // Your exported components (only if they MUST keep exact names)
        '^ScrollLink$',
        '^Element$',
        '^ScrollToTop$',

        // Add more ONLY if they're public API exports
        // The fewer reserved names, the stronger the obfuscation
    ],

    // 10. DEBUG & CONSOLE
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: true,

    // 11. DOMAIN LOCK (Optional - if you want to restrict domains)
    // domainLock: ['.yourdomain.com'],
    // domainLockRedirectUrl: 'about:blank',

    // 12. SELF DEFENDING (Use with caution - can cause issues)
    selfDefending: false, // Enable if you want anti-tampering

    // 13. TARGET ENVIRONMENT
    target: 'browser',

    // 14. SOURCE MAP (for debugging during development)
    sourceMap: false,
    sourceMapMode: 'separate',
});

// PREPEND ESLINT DISABLE
const finalCode = '/* eslint-disable */\n' + obfuscationResult.getObfuscatedCode();

fs.writeFileSync(filePath, finalCode);

console.log('✅ Obfuscation complete!');
console.log(`📦 Output: ${filePath}`);
console.log(`📏 Size: ${(finalCode.length / 1024).toFixed(2)} KB`);