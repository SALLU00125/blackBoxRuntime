// Configuration for TypeScript files
export const BUILD_CONFIG = {
    // Output names
    LK_COMP: 'Core',
    LK_COMP_FILENAME: 'core-ui-runtime',

    // Component paths if in src use Components ,
    // if inside some other folder use FolderName/**pathto**/Components
    COMPONENTS_FOLDER: 'Components',
    BARREL_FILE_PATH: 'BarrelFile/ComponentsToBeLocked.tsx',
} as const;

export const GUARD_CONFIG = {
    // Backend API
    API_ENDPOINT: 'https://license-lq.vercel.app/api/guard',

    // Timing (in milliseconds)
    CHECK_INTERVAL: 300000,  // 5 minutes


    // Feature flags
    PAGE_ISOLATION: false,
} as const;



// Configuration for build scripts (obfuscate.js)
export const Obfuscate_settings = {

    // Obfuscation intensity (0-1)
    CONTROL_FLOW_THRESHOLD: 0.9,
    STRING_ARRAY_THRESHOLD: 1,

    // Reserved names for obfuscation
    RESERVED_NAMES: [
        '^React$', '^useState$', '^useEffect$', '^useContext$',
        '^useMemo$', '^useCallback$', '^useRef$', '^useReducer$',
        '^useLayoutEffect$', '^jsx$', '^jsxs$', '^Fragment$',
        '^default$',
    ]
};