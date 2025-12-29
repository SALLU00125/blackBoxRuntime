// scripts/obfuscate-lock.js
import fs from 'fs';
import path from 'path';
import JavaScriptObfuscator from 'javascript-obfuscator';
import {BUILD_CONFIG, Obfuscate_settings} from "./src/LICENSE_O_S/config.variables.ts";
//Outputs Vars
const LK_Comp = BUILD_CONFIG.LK_COMP;
const LK_CompFileName = BUILD_CONFIG.LK_COMP_FILENAME;

const filePath = path.resolve(`src/${LK_Comp}/${LK_CompFileName}.es.js`);


console.log(`🔒 Obfuscating: ${filePath}`);

let code = fs.readFileSync(filePath, 'utf8');

const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
    // 1. COMPRESSION
    compact: true,
    simplify: true,

    // 2. CONTROL FLOW PROTECTION
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: Obfuscate_settings.CONTROL_FLOW_THRESHOLD,

    // 3. STRING OBFUSCATION
    stringArray: true,
    stringArrayEncoding: ['rc4'], // RC4 only is stronger & more stable than base64+rc4
    stringArrayThreshold: Obfuscate_settings.STRING_ARRAY_THRESHOLD,
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
    reservedNames: Obfuscate_settings.RESERVED_NAMES,

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

const RESET = '\x1b[0m';
const FG_WHITE = '\x1b[97m';
const FG_PINK = '\x1b[95m';
const FG_BLUE = '\x1b[94m';
const BG_DARK = '\x1b[48;5;235m';

console.log(`
${BG_DARK}${FG_PINK}╭────────────────────────────────────────────────────────────────────────────────────────────────────────────╮${RESET}
${BG_DARK}${FG_PINK}│${FG_WHITE}                                   🔐  OBFUSCATION SUCCESSFUL                                               ${FG_PINK}│${RESET}
${BG_DARK}${FG_PINK}├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤${RESET}
${BG_DARK}${FG_PINK}│${FG_BLUE} 📦 Output : ${FG_WHITE}${filePath.padEnd(86)}${FG_PINK}         │${RESET}
${BG_DARK}${FG_PINK}│${FG_BLUE} 📏 Size   : ${FG_WHITE}${((finalCode.length / 1024).toFixed(2) + ' KB').padEnd(86)}${FG_PINK}         │${RESET}
${BG_DARK}${FG_PINK}╰────────────────────────────────────────────────────────────────────────────────────────────────────────────╯${RESET}
`);
