!<!-- Hero Section -->
<div align="center">

<img src="Pictures/DETAILED_GUIDE.webp" alt="Hero Image" width="700" style="border-radius: 25px; padding: 10px; background: linear-gradient(135deg, #ff375a, #ff85b3, #0b48ff); box-shadow: 0 15px 35px rgba(0,0,0,0.3); transition: transform 0.3s;"/>


<h1>🛡️ 𝐁𝐥𝐚𝐜𝐤𝐁𝐨𝐱 𝐑𝐮𝐧𝐭𝐢𝐦𝐞  </h1>
<p><i>Remote License Locking & Obfuscation System for React Components</i></p>

</div>

---

## 🔑 System Overview

**Purpose:** Protect your React components from unauthorized use by combining:

- **Code Obfuscation** 🔒 – Transform your JS/TS code to a nearly unreadable form.
- **Remote License Verification** 🌐 – Ensure components only run for authorized users or domains.
- **Feature Gating** 🧩 – Enable/disable components dynamically for trials, SaaS, or client-specific builds.

This system is ideal for **client distribution, trial limitations, or high-value component protection**.

---

## 📖 Table of Contents

1. [System Overview](#-system-overview)
2. [Architecture](#-architecture)
3. [How It Works](#-how-it-works)
4. [File Structure](#-file-structure)
5. [Configuration Guide](#-configuration-guide)
6. [Security Model](#-security-model)
7. [Advanced Features](#-advanced-features)
8. [Best Practices](#-best-practices)
9. [Troubleshooting](#-troubleshooting)

---

## 🎯 System Overview

### What Problem Does This Solve?

When distributing React components to clients or offering trials, you face two risks:
1. **Code Theft**: JavaScript is readable; anyone can copy your components
2. **License Violation**: Users can continue using components after trial ends

### The Solution

This system provides **dual protection**:
- **Obfuscation**: Makes code unreadable and reverse-engineering nearly impossible
- **Remote Locking**: Components periodically check a backend server for access permission

### Key Benefits

✅ **Remote Control**: Enable/disable components from anywhere without touching client code  
✅ **Irreversible**: Obfuscated code cannot be de-obfuscated  
✅ **Transparent**: Components work normally when licensed  
✅ **Graceful**: Shows professional UI when access is denied  
✅ **Secure**: Multiple layers prevent tampering and replay attacks

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (React App)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────┐    ┌──────────────────┐                │
│  │   Component    │───▶│   G_Wrapper      │                │
│  │  (Your Code)   │    │  (Guard UI)      │                │
│  └────────────────┘    └──────────────────┘                │
│           │                      │                           │
│           └──────────┬───────────┘                           │
│                      │                                       │
│              ┌───────▼────────┐                             │
│              │ useComponentG  │◀──── Singleton Channel       │
│              │   (Guard Hook) │      (Shared State)         │
│              └───────┬────────┘                             │
└──────────────────────┼──────────────────────────────────────┘
                       │ HTTP Request (every 5min)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 BACKEND (Vercel API)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  /api/guard.js                                       │   │
│  │  • Validates request timestamp                       │   │
│  │  • Checks LOCK_ENABLED env var                       │   │
│  │  • Returns encrypted response                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                    │
│              ┌──────────▼──────────┐                        │
│              │ Environment Vars    │                        │
│              │ • LOCK_ENABLED      │                        │
│              │ • LOCK_MESSAGE      │                        │
│              │ • SECRET_KEY        │                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Component Mounts** → Subscribes to guard channel
2. **First Request** → Guard hook calls backend API
3. **Response Handling** → Validates and caches result
4. **State Broadcasting** → All subscribed components receive state
5. **Periodic Checks** → Re-validates every N minutes
6. **UI Rendering** → Shows content or restriction based on state

---

## ⚙️ How It Works

### Phase 1: Build Time (Obfuscation)

#### Step 1: Component Wrapping
```typescript
// Original component with guard wrapper
<G_Wrapper State_G={useComponentGuard()}>
  <YourComponent />
</G_Wrapper>
```

#### Step 2: Barrel File Creation
**`ComponentsToBeLocked.tsx`** aggregates all components to be locked:
```typescript
export { ComponentA, ComponentB, ComponentC };
```

#### Step 3: Vite Build
**`vite.lock.config.ts`** bundles only specified components:
- Includes: Everything in `componentsRoot` (e.g., `src/Components`)
- Excludes: External dependencies (React, Material-UI, etc.)
- Output: Single ESM file in `src/Core/`

#### Step 4: Obfuscation
**`obfuscate.js`** applies transformations:
- **String Array Encoding**: Strings converted to encrypted array lookups
- **Control Flow Flattening**: Logic flow becomes non-linear
- **Identifier Mangling**: Variable names become hexadecimal
- **Dead Code Injection**: Adds misleading code paths

**Result**: `core-ui-runtime.es.js` - completely unreadable

### Phase 2: Runtime (License Checking)

#### Component Lifecycle

```
Component Mount
    ↓
useComponentGuard() called
    ↓
Subscribe to HiddenGuardChannel (singleton)
    ↓
Channel checks if API call needed
    ↓
[First mount OR interval expired] → Make API request
    ↓
Backend validates & returns license status
    ↓
Channel broadcasts result to ALL subscribers
    ↓
G_Wrapper receives state → Render decision:
    • ready=false → Show loading spinner
    • access=false → Show restriction UI
    • access=true → Show actual component
```

#### Singleton Pattern Benefit

Multiple components on same page share ONE API call:

```typescript
// Page with 3 locked components
<ComponentA />  ────┐
<ComponentB />  ────┼──▶ HiddenGuardChannel ──▶ 1 API call ──▶ Result broadcast to all
<ComponentC />  ────┘
```

**Why?** Prevents API spam and ensures consistent state.

---

## 📁 File Structure

### Frontend Files

```
project-root/
├── vite.lock.config.ts          # Build configuration
├── obfuscate.js                 # Obfuscation settings
├── package.json                 # Scripts & dependencies
│
├── src/
│   ├── LICENSE_O_S/             # Guard system (license operating system)
│   │   ├── useComponentGuard.ts # Core guard hook
│   │   └── Ui_G.tsx             # UI wrapper components
│   │
│   ├── BarrelFile/
│   │   └── ComponentsToBeLocked.tsx # Barrel file (entry point)
│   │
│   ├── Components/              # Your components to lock
│   │   └── [YourComponents].tsx
│   │
│   └── Core/                    # Generated output (after build)
│       ├── core-ui-runtime.es.js   # Obfuscated bundle
│       └── core-ui-runtime.d.ts    # TypeScript definitions
```

### Backend Files (Vercel)

```
LicenseBackend/
├── api/
│   └── guard.js                 # License validation endpoint
├── package.json                 # Dependencies
└── vercel.json                  # Routing configuration
```

---

## 🔧 Configuration Guide

### 1. Frontend Build Configuration

**File: `vite.lock.config.ts`**

#### Key Variables

```typescript
// Input paths - where to find components
const componentsRoot = path.resolve(srcRoot, 'Components');

// Entry point - barrel file that exports locked components
const entryFile = path.resolve(srcRoot, 'src/BarrelFile/ComponentsToBeLocked.tsx');

// Output names - where obfuscated code goes
const LK_Comp = 'Core';              // Folder name
const LK_CompFileName = 'core-ui-runtime';  // File name
```

**Customization Examples**:
```typescript
// Lock only specific subfolder
const componentsRoot = path.resolve(srcRoot, 'Components/Premium');

// Use different barrel location
const entryFile = path.resolve(srcRoot, 'exports/LockedFeatures.tsx');

// Custom output location
const LK_Comp = 'Protected';
const LK_CompFileName = 'premium-components';
```

#### Rollup External Configuration

The `external` function determines what gets bundled:

```typescript
external: (source, importer, isEntry) => {
  // Always bundle entry file
  if (isEntry) return false;
  
  // Bundle anything in componentsRoot
  if (cleanPath.startsWith(cleanComponentsRoot)) return false;
  
  // Externalize everything else (React, MUI, etc.)
  return true;
}
```

**Why?** You want to obfuscate YOUR code, not React or Material-UI.

### 2. Obfuscation Configuration

**File: `obfuscate.js`**

#### Key Settings

```javascript
const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
  compact: true,                      // Remove whitespace
  controlFlowFlattening: true,        // Scramble logic flow
  controlFlowFlatteningThreshold: 0.9, // Intensity (0-1)
  
  stringArray: true,                  // Encrypt strings
  stringArrayEncoding: ['rc4'],       // RC4 encryption
  stringArrayThreshold: 1,            // All strings (100%)
  
  reservedNames: [                    // Don't rename these
    '^React$', '^useState$', '^useEffect$'
  ]
});
```

#### Tuning for Stability

**If build breaks**, reduce intensity:
```javascript
controlFlowFlatteningThreshold: 0.5,  // Instead of 0.9
stringArrayThreshold: 0.7,            // Instead of 1
```

**If you need more obfuscation**:
```javascript
selfDefending: true,        // Anti-tampering (can cause issues)
debugProtection: true,      // Disable dev tools
```

⚠️ **Warning**: Aggressive settings may break React's reconciliation.

#### Reserved Names Strategy

Add to `reservedNames` array if you see errors like `"X is not defined"`:

```javascript
reservedNames: [
  '^React$',
  '^useState$',
  // Add your exported component names if they must stay readable
  '^YourPublicComponent$'
]
```

**Principle**: Reserve as few names as possible. More reservations = weaker obfuscation.

### 3. Guard Hook Configuration

**File: `src/LICENSE_O_S/useComponentGuard.ts`**

#### Key Variables

```typescript
class HiddenGuardChannel {
  private checkInterval: number = 300000;  // 5 minutes in ms
  private apiEndpoint: string = 'https://your-backend.vercel.app/api/guard';
  private pageIsolation: boolean = false;  // Global vs per-page
}
```

#### Configuration Options

**API Endpoint**:
```typescript
// Production
private apiEndpoint: string = 'https://license-prod.vercel.app/api/guard';

// Staging
private apiEndpoint: string = 'https://license-staging.vercel.app/api/guard';

// Local development
private apiEndpoint: string = 'http://localhost:3000/api/guard';
```

**Check Interval**:
```typescript
private checkInterval: number = 60000;   // 1 minute (aggressive)
private checkInterval: number = 300000;  // 5 minutes (balanced)
private checkInterval: number = 600000;  // 10 minutes (relaxed)
private checkInterval: number = 3600000; // 1 hour (minimal)
```

**Considerations**:
- Shorter intervals = more API calls = higher Vercel costs
- Longer intervals = slower response to lock changes
- **Recommended**: 5 minutes for production

**Page Isolation**:
```typescript
// Default: All pages share same license check
private pageIsolation: boolean = false;

// Per-page: Each route has independent license state
private pageIsolation: boolean = true;
```

**Usage**:
```typescript
// Global mode (default)
const GS = useComponentGuard();

// Page-specific mode
const GS = useComponentGuard({
  pageIsolation: true,
  pageId: 'dashboard'
});
```

### 4. UI Wrapper Configuration

**File: `src/LICENSE_O_S/Ui_G.tsx`**

#### Default Components

- **`LoadingDisplay_G`**: Shown while checking license (spinner)
- **`RstDisplay_G`**: Shown when access denied (red warning)

#### Customization

```typescript
// Custom loading indicator
<G_Wrapper 
  State_G={GS}
  loadingComponent={<YourSpinner />}
>
  <YourComponent />
</G_Wrapper>

// Custom blocked UI
<G_Wrapper 
  State_G={GS}
  rst_Component={<YourCustomBlockedUI />}
>
  <YourComponent />
</G_Wrapper>
```

**Styling the Default UI**:

The `RstDisplay_G` component uses Material-UI. Modify in `Ui_G.tsx`:
```typescript
<Container
  sx={{
    background: 'linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%)',
    border: '10px solid #ff4444',  // Change colors
    borderRadius: '24px',           // Change shape
  }}
>
```

### 5. Backend Configuration

**File: `LicenseBackend/api/guard.js`**

#### Environment Variables (Vercel Dashboard)

| Variable | Type | Purpose | Example |
|----------|------|---------|---------|
| `LOCK_ENABLED` | boolean | Master switch | `true` or `false` |
| `SECRET_KEY` | string | Hashing secret | `random-string-123` |
| `LOCK_TITLE` | string | Block screen title | `"Trial Expired"` |
| `LOCK_MESSAGE` | string | Block screen body | `"Please upgrade to continue"` |
| `LOCK_CONTACT` | string | Support info | `"support@company.com"` |

#### Security Parameters

```javascript
// Time validation window
const diff = Math.abs(now - t);
if (diff > 30000) { // 30 seconds max
  return res.status(401).json({ error: 'Request expired' });
}
```

**Tuning**: Increase to `60000` (1 minute) if users have clock drift.

#### Response Structure

```javascript
// When locked (LOCK_ENABLED=true)
{
  payload: base64({
    allow: 0,
    message: { title, message, contact },
    requestId: "echo-back-for-validation",
    timestamp: Date.now()
  })
}

// When unlocked (LOCK_ENABLED=false)
{
  payload: base64({
    allow: 1,
    message: null,
    hash: "secure-hash",
    exp: timestamp + 3600000,
    sig: "signature",
    requestId: "echo-back",
    timestamp: Date.now()
  })
}
```

---

## 🔐 Security Model

### Multi-Layer Protection

#### Layer 1: Obfuscation
**What it prevents**: Source code theft  
**How**: Code becomes unreadable through encryption and transformation  
**Weakness**: Not cryptographically secure, but practically irreversible

#### Layer 2: Remote Validation
**What it prevents**: Bypassing license checks  
**How**: Live backend decides access permission  
**Weakness**: Requires internet connection

#### Layer 3: Request Authentication
**What it prevents**: Replay attacks, request tampering  
**How**:
- Timestamp validation (30-second window)
- Request ID echo-back verification
- Secure hashing with server secret

#### Layer 4: Response Integrity
**What it prevents**: Response modification  
**How**:
- Base64 encoding (obfuscation)
- Server-side signature
- Timestamp freshness check

### Attack Vectors & Mitigations

| Attack | Mitigation |
|--------|------------|
| **Deobfuscation** | Practically impossible with current tools |
| **API Bypass** | Guard integrated in obfuscated code |
| **Replay Attack** | Request ID + timestamp validation |
| **Response Tampering** | Hash + signature verification |
| **Offline Usage** | Falls back to ALLOW (see below) |

### Fallback Behavior

**Design Decision**: When API is unreachable, components default to **ALLOW** access.

**Why?**
- Prevents legitimate users from being blocked due to network issues
- Maintains user experience
- Trial periods should have time-based expiration separately

**Alternative** (stricter): Modify `useComponentGuard.ts`:
```typescript
catch (error) {
  this.broadcast({
    ready: true,
    access: false,  // Change to false for stricter mode
    content: {
      title: 'Connection Required',
      message: 'Please check your internet connection'
    }
  });
}
```

---

## 🚀 Advanced Features

### 1. Page-Specific Licensing

Lock different features on different pages independently:

```typescript
// Dashboard page
const GS = useComponentGuard({
  pageIsolation: true,
  pageId: 'dashboard'
});

// Analytics page
const GS = useComponentGuard({
  pageIsolation: true,
  pageId: 'analytics'
});
```

**Backend**: Modify `guard.js` to check `pageId` in request:
```javascript
const { pageId } = req.body;

if (pageId === 'analytics' && !user.hasAnalyticsAccess) {
  shouldBlock = true;
}
```

### 2. User-Specific Licensing

Pass user ID to backend for per-user control:

```typescript
// Modify useComponentGuard.ts buildPayload()
buildPayload() {
  return {
    data: {
      t: timestamp,
      s: sessionId,
      r: requestId,
      u: getUserId()  // Add user identifier
    }
  };
}
```

**Backend**:
```javascript
const { u: userId } = req.body;

const userLicense = await checkUserLicense(userId);
if (!userLicense.active) {
  shouldBlock = true;
}
```

### 3. Time-Based Trials

Set expiration dates per user:

```javascript
// Backend guard.js
const userExpiration = await getUserExpiration(userId);

if (Date.now() > userExpiration) {
  shouldBlock = true;
  blockReason = {
    title: 'Trial Expired',
    message: `Your trial ended on ${new Date(userExpiration).toLocaleDateString()}`,
    contact: 'Upgrade to continue: pricing-link.com'
  };
}
```

### 4. Feature Flags

Control individual features within components:

```typescript
// Modify guard response structure
{
  allow: 1,
  features: {
    export: true,
    sharing: false,
    advancedFilters: true
  }
}

// In component
const GS = useComponentGuard();
const canExport = GS.meta?.features?.export;

<Button disabled={!canExport}>Export Data</Button>
```

### 5. Analytics Integration

Track usage of locked components:

```typescript
// In useComponentGuard.ts, after successful check
async checkGuard(pageId) {
  // ... existing code ...
  
  // Log access attempt
  await fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({
      event: 'component_access',
      pageId: pageId,
      allowed: processed.access,
      timestamp: Date.now()
    })
  });
}
```

### 6. Graceful Degradation

Show limited functionality instead of complete block:

```typescript
<G_Wrapper State_G={GS}>
  {GS.access ? (
    <FullFeatureComponent />
  ) : (
    <LimitedFeatureComponent 
      message="Upgrade for full features"
    />
  )}
</G_Wrapper>
```

---

## 🎯 Best Practices

### Development Workflow

1. **Develop Without Guards**: Build features normally first
2. **Add Guards**: Wrap components just before locking
3. **Test Unlocked**: Ensure everything works with `LOCK_ENABLED=false`
4. **Test Locked**: Verify restriction UI with `LOCK_ENABLED=true`
5. **Obfuscate**: Run `build:lock` only when ready to deploy
6. **Deploy**: Push obfuscated code to production

### Security Best Practices

✅ **DO**:
- Use strong, random `SECRET_KEY` (64+ characters)
- Keep `SECRET_KEY` in environment variables, never in code
- Rotate `SECRET_KEY` periodically
- Monitor API usage for abnormal patterns
- Keep obfuscation settings consistent across builds

❌ **DON'T**:
- Commit `core-ui-runtime.es.js` to public repositories
- Share API endpoints in public documentation
- Use same `SECRET_KEY` for staging and production
- Over-reserve names in obfuscation (weakens protection)
- Make check intervals too short (API spam)

### Performance Optimization

1. **Singleton Pattern**: Already implemented in `HiddenGuardChannel`
2. **Caching**: API responses cached per check interval
3. **Lazy Loading**: Only check when component mounts
4. **Bundling**: Group related components in one barrel file

### Testing Strategy

```typescript
// Mock guard for unit tests
jest.mock('../LICENSE_O_S/useComponentGuard', () => ({
  useComponentGuard: () => ({
    ready: true,
    access: true,
    content: null,
    meta: {}
  })
}));
```

---

## 🐛 Troubleshooting

### Build Issues

#### "Cannot find module 'vite'"
**Cause**: Dependencies not installed  
**Fix**: Run dependency installation command

#### "Entry file not found"
**Cause**: Incorrect path in `vite.lock.config.ts`  
**Fix**: Verify `entryFile` path matches barrel file location

#### Obfuscation fails with syntax errors
**Cause**: Aggressive obfuscation settings  
**Fix**: Reduce `controlFlowFlatteningThreshold` to 0.5-0.7

### Runtime Issues

#### Components always show "Access Restricted"
**Cause**: Backend not responding or `LOCK_ENABLED=true`  
**Fix**:
1. Check Vercel deployment status
2. Verify `LOCK_ENABLED=false` in environment variables
3. Check browser console for API errors

#### "Invalid response detected"
**Cause**: Request ID mismatch  
**Fix**: Clear browser cache, check backend `requestId` echo logic

#### Components work locally but not in production
**Cause**: API endpoint mismatch  
**Fix**: Verify `apiEndpoint` in `useComponentGuard.ts` matches production URL

### API Issues

#### CORS errors
**Cause**: Missing CORS headers  
**Fix**: Verify `Access-Control-Allow-Origin: *` in `guard.js`

#### "Request expired" errors
**Cause**: Clock drift between client and server  
**Fix**: Increase time validation window in `guard.js` to 60 seconds

#### Too many API calls
**Cause**: Multiple component instances  
**Fix**: Singleton pattern should handle this. Verify `HiddenGuardChannel` is truly singleton

---

## 📊 Deployment Checklist

### Pre-Deployment

- [ ] All components wrapped in `G_Wrapper`
- [ ] Barrel file exports all locked components
- [ ] `vite.lock.config.ts` paths verified
- [ ] `obfuscate.js` output names match config
- [ ] Build script added to `package.json`
- [ ] Backend deployed to Vercel
- [ ] Environment variables set
- [ ] API endpoint updated in `useComponentGuard.ts`

### Testing

- [ ] `build:lock` runs without errors
- [ ] Obfuscated file generated in correct location
- [ ] Test with `LOCK_ENABLED=false` (components visible)
- [ ] Test with `LOCK_ENABLED=true` (components blocked)
- [ ] Verify loading states work
- [ ] Check restriction UI displays correctly
- [ ] Test on multiple pages/routes
- [ ] Verify check interval timing

### Production

- [ ] Original source files deleted (optional but recommended)
- [ ] Only obfuscated code in production bundle
- [ ] `SECRET_KEY` is strong and unique
- [ ] Monitoring set up for API usage
- [ ] Backup of unobfuscated code stored securely
- [ ] Documentation shared with team

---

## 🔗 Quick Reference

### File Locations & Purposes

| File | Purpose | Key Variables |
|------|---------|---------------|
| `vite.lock.config.ts` | Build config | `componentsRoot`, `entryFile`, `LK_Comp`, `LK_CompFileName` |
| `obfuscate.js` | Obfuscation | `LK_Comp`, `LK_CompFileName`, obfuscation intensity settings |
| `useComponentGuard.ts` | License hook | `apiEndpoint`, `checkInterval`, `pageIsolation` |
| `Ui_G.tsx` | UI wrappers | Styling, custom components |
| `ComponentsToBeLocked.tsx` | Barrel file | Component imports/exports |
| `guard.js` | Backend API | Environment variables, time validation |

### Commands

```bash
# Install dependencies
yarn add -D javascript-obfuscator rollup-plugin-javascript-obfuscator vite terser typescript ts-node @vitejs/plugin-react vite-plugin-dts vite-plugin-svgr

# Build locked version
npm run build:lock

# Deploy backend
cd LicenseBackend && vercel deploy --prod

# Set environment variable
vercel env add LOCK_ENABLED
```

### Environment Variables (Backend)

```bash
LOCK_ENABLED=false
SECRET_KEY=your-random-secret-key-min-64-chars
LOCK_TITLE=Access Restricted
LOCK_MESSAGE=This feature is currently unavailable
LOCK_CONTACT=Contact support@example.com
```

---

## 🎓 Conclusion

This system provides industrial-strength protection for React components through:
- **Code obfuscation** making reverse engineering impractical
- **Remote licensing** enabling real-time access control
- **Graceful UX** maintaining professionalism when blocking access
- **Scalable architecture** supporting multiple components and pages

The combination of obfuscation + remote validation creates a robust defense that balances security with user experience.

**Remember**: No system is 100% secure, but this makes unauthorized use difficult enough to deter casual theft while maintaining a smooth experience for legitimate users.