<div align="center">

<img src="Docs/Pictures/blackboxui.webp" alt="Hero Image" style="border-radius: 50px; padding: 1px; background: linear-gradient(135deg, rgba(255,47,83,0.09), rgba(255,133,179,0.29), rgba(11,72,255,0.19)); box-shadow: 0px 10px 25px rgba(255,0,0,0.3); transition: transform 0.3s;"/>

# ⚙ 𝐁𝐥𝐚𝐜𝐤𝐁𝐨𝐱 𝐑𝐮𝐧𝐭𝐢𝐦𝐞

#### <p>Remote execution control for obfuscated React components</p>
<br/>
<img src="https://img.shields.io/badge/Runtime-Vite_5-646CFF?style=for-the-badge&logo=vite" />
<img src="https://img.shields.io/badge/UI-React_18-61DAFB?style=for-the-badge&logo=react" />
<img src="https://img.shields.io/badge/Language-TypeScript_5-3178C6?style=for-the-badge&logo=typescript" />
<img src="https://img.shields.io/badge/Infra-Vercel_API-000000?style=for-the-badge&logo=vercel" />
<img src="https://img.shields.io/badge/Security-Code_Obfuscated-FF4444?style=for-the-badge&logo=javascript" />
<img src="https://img.shields.io/badge/Access-Remote_Locked-00C853?style=for-the-badge&logo=shield" />
<br/>
<br/>

### 🏗️ 𝐎𝐩𝐞𝐧 𝐀𝐫𝐜𝐡𝐢𝐭𝐞𝐜𝐭𝐮𝐫𝐞 𝐃𝐨𝐜𝐬
[![View Docs](https://img.shields.io/badge/📖%20Detailed%20Guide-1565C0?style=for-the-badge)](Docs/DetaileGuide.md)

<br/>

> Protect your React components from theft with remote-controlled licensing and code obfuscation. Perfect for trial versions, unpaid features, or client-specific deployments.

<br/>

</div>



## 🏛️ **CRITICAL: Two-Project Architecture**

BlackBox Runtime uses a **Creator/Consumer** architecture to keep your licensing system secure and maintainable.

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃            🧱  PROJECT ARCHITECTURE — QUICK VIEW              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🔒  PROJECT 1                ┃──────▶ ┃  📦  PROJECT 2                   ┃
┃  “MyProject”                  ┃        ┃  “MyProject_deliver”             ┃
┃  𝘊𝘳𝘦𝘢𝘵𝘰𝘳 · 𝘗𝘳𝘪𝘷𝘢𝘵𝘦              ┃        ┃  𝘊𝘰𝘯𝘴𝘶𝘮𝘦𝘳 · 𝘊𝘭𝘪𝘦𝘯𝘵                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛        ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
        │                                        │
        │  📂 CONTAINS                           │  📂 CONTAINS
        │  ──────────                            │  ──────────
        │  • LICENSE_O_S/*                       │   • Core/* (obfuscated)
        │  • vite.lock.config.ts                 │   • ComponentsToBeLocked.tsx
        │  • obfuscate.js                        │      ↳ imports from Core
        │  • VercelBackend/*                     │   • Normal app files
        │  • config.variables.ts                 │
        │  • Source components                   │  🚫 DOES NOT CONTAIN
        │  • Core/* (generated)                  │  ─────────────────
        │                                        │      ❌ LICENSE_O_S/*
        │  🎯 PURPOSE                            │      ❌ vite.lock.config.ts
        │  ─────────                             │      ❌ obfuscate.js
        │  Build & update locked                 │      ❌ VercelBackend/*
        │  components (BlackBox)                 │      ❌ Any BlackBox files
        │                                        │
        └────────────────────────────────────────┘
                                                 
                                                     🎯 PURPOSE
                                                     ─────────
                                                        Clean, safe
                                                        client delivery
                                                     


```

<br/>
<br/>


### 🔂 Secure Delivery Workflow (Creator → Client)

0. **⚙️ Setup** Project 1 with all configuration.
1. **✅ Start with fresh copy** : Duplicate Project 1 → name it Project 2
2. **🧹 Clean Project 2 immediately** `rm -rf LICENSE_O_S VercelBackend vite.lock.config.ts obfuscate.js`
3. **🛢️ Barrel Update in Project 2** : `src/BarrelFile/ComponentsToBeLocked.tsx`
    ```ts
   import { component1 , ... , components10 } from "../Components/ShimmerHeadingAndSubHeading.tsx";
   export { component1 , ... , components10 }
   ```
4. ❌ Also **remove any original unlocked** component Component_sourceCode.tsx in project 2.
   ( we keep only Core/* in Project 2)

3. **🔐 Build locked assets** (in Project 1)
   ```bash
   npm run build:lock
   ```

4. **📦 Copy only the safe part**  
   Copy `Core/` → Project 2

5. **🚚 Test Project 2 and then Ship**  
   Send **only Project 2** to client

6. **🔄 Updates** → repeat steps 1–6

> Client receives **zero** licensing code, obfuscation tools, or source components.




### Why This Matters

**Security**: Client never sees your licensing system, backend API, or obfuscation configs  
**Maintainability**: Update components in Project 1, regenerate, copy to Project 2  
**Clean Delivery**: Client receives only production-ready obfuscated code

<br/>

---

---
<br/>


## ⚡ Quick Setup (15 minutes)

### Step 1: Install Dependencies

```bash
yarn add -D \
  javascript-obfuscator \
  rollup-plugin-javascript-obfuscator \
  vite \
  terser \
  typescript \
  ts-node \
  @vitejs/plugin-react \
  vite-plugin-dts \
  vite-plugin-svgr
```

### Step 2: Create Project Structure

```bash
# Create base project (Project 1)
 using vite

# Copy these required directories & files in project 
cp -r src/LICENSE_O_S/LicenseGuard
cp -r src/BarrelFile
cp -r src/Components
cp -r VercelBackend/api
```

### Step 3: Add Core Files

Create/Copy these files in **Project 1** (MyProject):

### NOTE: Better is to copy and modify these.
#### 1. **`src/LICENSE_O_S/config.variables.ts`** - **NEW: Centralized Configuration**

```typescript
// src/LICENSE_O_S/config.variables.ts 

export const BUILD_CONFIG = {
    // Output Directory for the Locked_Comp_name
    LK_COMP: 'Core',
    // Output File inside the 'LK_COMP'
    LK_COMP_FILENAME: 'core-ui-runtime',

    // Component paths
    // If in src use 'Components'
    // If inside another folder use 'FolderName/**/Components'
    COMPONENTS_FOLDER: 'Components',
    BARREL_FILE_PATH: 'BarrelFile/ComponentsToBeLocked.tsx',
} as const;

export const GUARD_CONFIG = {
    // Your vercel Backend API
    API_ENDPOINT: 'https://your-backend.vercel.app/api/guard',

    // Timing for periodic pinging the API for response  (in milliseconds)
    CHECK_INTERVAL: 300000,  // 5 minutes

    // If true, Each Page will trigger new api call
    PAGE_ISOLATION: false,
} as const;

};
```

---
### 🔗 Shared Configuration (Files 2–5) :
### _Just copy the 2,3,4,5 files code from project._
All of these take in properties from **`src/LICENSE_O_S/config.variables.ts`** 
- #### 2. **`vite.lock.config.ts`** (root) 
- #### 3. **`obfuscate.js`** (root) 
- #### 4. **`src/LICENSE_O_S/LicenseGuard/useComponent_G.ts`** - Guard hook 
- #### 5. **`src/LICENSE_O_S/LicenseGuard/ui_G.tsx`** - Guard UI wrapper



---



#### 6. **`src/BarrelFile/ComponentsToBeLocked.tsx`** - Barrel file

```typescript
// List all components you want to lock
import { QuickLinkButton } from "../Components/ContactUsPage/QuickLinkButton";
import { SectionHeader } from "../Components/ContactUsPage/SectionHeader";
import { StatisticCard } from "../Components/ContactUsPage/StatisticCard";

export { QuickLinkButton, SectionHeader, StatisticCard };
```

### Step 4: Add Build Script

**In `package.json`**:
```json
{
  "scripts": {
    "build:lock": "vite build --config vite.lock.config.ts && node obfuscate.js"
  }
}
```

---

## 🔒 Locking Your Components

### ⚠️ **CRITICAL SECURITY RULES**

```
╔════════════════════════════════════════════════════════════════╗
║  🚨 NEVER EXPOSE LICENSE_O_S FILES IN YOUR IMPORTS 🚨          ║
╚════════════════════════════════════════════════════════════════╝

❌ WRONG - These imports expose your licensing system:
   import { G_Wrapper } from "../LICENSE_O_S/LicenseGuard/ui_G.tsx";
   import { useComponentGuard } from "../LICENSE_O_S/LicenseGuard/useComponent_G.ts";

✅ CORRECT - Embed imports INSIDE each component file:
   These files must be directly imported and used within component files
   They should never be re-exported or exposed through barrel files
```

### 1. Wrap Each Component 
#### ( Component to be Locked to be wrapped only )

**In each component file** (e.g., `QuickLinkButton.tsx`):

```typescript
// ✅ CORRECT: Import directly inside component file
import { G_Wrapper } from "../LICENSE_O_S/LicenseGuard/ui_G.tsx";
import { useComponentGuard } from "../LICENSE_O_S/LicenseGuard/useComponent_G.ts";

export const QuickLinkButton: React.FC = () => {
  // Add guard hook
  const GS = useComponentGuard();

  return (
    // Wrap entire component JSX
    <G_Wrapper State_G={GS}>
      {/* Your existing component code */}
      <button>Click me</button>
    </G_Wrapper>
  );
};
```

### 2. Build Locked Version

```bash
npm run build:lock
// or 
yarn build:lock
```

This creates: `src/Core/core-ui-runtime.es.js` (obfuscated + locked)

---

<br/>
<br/>

## 📦 **Two-Project Workflow: Creator → Consumer**
#### THESE ARE STEPS TO BE DONE IN PROJECT 2 only . _**( not to be done for project 1)**_
<br/>

### Step 0: Once Project 1 is setup and running perfectly.
### Step 1: Create Delivery Project (One-Time Setup)

```bash
# From your project root
cd ..
cp -r MyProject MyProject_deliver

cd MyProject_deliver
```

### Step 2: Clean Delivery Project

Execute this cleanup script from **MyProject_deliver root**:

```bash
# cleanup.sh - Run from MyProject_deliver root
#!/bin/bash

echo "🧹 Cleaning BlackBox files from delivery project..."

# Remove licensing system
rm -rf src/LICENSE_O_S

# Remove build configuration
rm -f vite.lock.config.ts
rm -f obfuscate.js

# Remove backend
rm -rf VercelBackend

# Remove barrel file (no longer needed)
rm -rf src/BarrelFile

echo "✅ Cleanup complete - Project ready for delivery"
```

Make it executable and run:
```bash
chmod +x cleanup.sh
./cleanup.sh
```

### Step 3: Update Component Exports (In MyProject_deliver)

**In `src/BarrelFile/ComponentsToBeLocked.tsx`** or your main export file:

```typescript
// ❌ Remove original imports
// import { QuickLinkButton } from "./Components/ContactUsPage/QuickLinkButton";
// import { SectionHeader } from "./Components/ContactUsPage/SectionHeader";

// ✅ Replace with locked version
import { 
  QuickLinkButton, 
  SectionHeader, 
  StatisticCard 
} from "./Core/core-ui-runtime.es";

export { QuickLinkButton, SectionHeader, StatisticCard };
```

### Step 4: Delete Original Source Files (In MyProject_deliver)

```bash
# From MyProject_deliver root
rm -rf src/Components/ContactUsPage/QuickLinkButton.tsx
rm -rf src/Components/ContactUsPage/SectionHeader.tsx
rm -rf src/Components/ContactUsPage/StatisticCard.tsx
```

### Step 5: Verify Delivery Project

**MyProject_deliver should only contain:**
- ✅ `src/Core/core-ui-runtime.es.js` (obfuscated)
- ✅ `src/BarrelFile/ComponentsToBeLocked.tsx` (importing from Core)
- ✅ Regular app files
- ✅ package.json, vite.config.ts (normal build)

**Should NOT contain:**
- ❌ LICENSE_O_S/*
- ❌ vite.lock.config.ts
- ❌ obfuscate.js
- ❌ VercelBackend/*
- ❌ Original component source files

---

## 🔄 **Update Workflow**

When you need to modify locked components:

```
┌─────────────────────────────────────────────────────────────────┐
│                      UPDATE WORKFLOW                             │
└─────────────────────────────────────────────────────────────────┘

1️⃣  Edit in MyProject (Base Creator)
    • Modify src/Components/ContactUsPage/QuickLinkButton.tsx
    • Make your changes

2️⃣  Rebuild in MyProject
    npm run build:lock
    • Generates new src/Core/core-ui-runtime.es.js

3️⃣  Copy to MyProject_deliver
    cp src/Core/core-ui-runtime.es.js ../MyProject_deliver/src/Core/

4️⃣  Test MyProject_deliver
    cd ../MyProject_deliver
    npm run dev

5️⃣  Ship updated MyProject_deliver to client
    • Client receives only the obfuscated Core/* bundle
    • No trace of licensing system visible
```

---

## 🌐 Deploy Backend (Vercel)

### 1. Create Vercel Project Structure 
#### ( whole VercelBackend folder is provided so use the files as it is)

```
VercelBackend/
├── api/
│   └── guard.js
├── package.json
└── vercel.json
```

### These files are provided :
1. **`VercelBackend/api/guard.js`**
2. **`VercelBackend/package.json`** 
3. **`VercelBackend/vercel.json`**


### 2. Deploy

```bash
cd VercelBackend
vercel deploy --prod
```

### 3. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Purpose |
|----------|-------|---------|
| `LOCK_ENABLED` | `false` | Set to `true` to block access |
| `SECRET_KEY` | `your-random-secret-123` | For secure hashing |
| `LOCK_TITLE` | `Maintenance Mode` | Shown when locked |
| `LOCK_MESSAGE` | `Feature unavailable` | Detailed message |
| `LOCK_CONTACT` | `Contact: support@...` | Support info |

### 4. Update Config

**In `src/LICENSE_O_S/config.variables.ts`** (MyProject only):
```typescript
export const GUARD_CONFIG = {
    API_ENDPOINT: 'https://your-actual-backend.vercel.app/api/guard',
    // ... rest of config
} as const;
```

---

## 🎛️ Control Access

### Enable Lock (Block Components)
```bash
vercel env add LOCK_ENABLED
# Enter: true
vercel deploy --prod
```

### Disable Lock (Allow Access)
```bash
vercel env add LOCK_ENABLED
# Enter: false
vercel deploy --prod
```

Changes take effect within 5 minutes (default check interval).

---

## 🔧 Configuration Reference

All configuration is now centralized in **`src/LICENSE_O_S/config.variables.ts`**:

### Build Settings
```typescript
BUILD_CONFIG = {
    LK_COMP: 'Core',              // Output folder name
    LK_COMP_FILENAME: 'core-ui-runtime',  // Output file name
    COMPONENTS_FOLDER: 'Components',      // Where components live
    BARREL_FILE_PATH: 'BarrelFile/ComponentsToBeLocked.tsx'
}
```

### Guard Settings
```typescript
GUARD_CONFIG = {
    API_ENDPOINT: 'https://...',    // Your Vercel backend
    CHECK_INTERVAL: 300000,         // 5 minutes = 300000ms
    PAGE_ISOLATION: false           // Enable page-specific locking
}
```

### Obfuscation Settings
```typescript
Obfuscate_settings = {
    CONTROL_FLOW_THRESHOLD: 0.9,    // 0-1 (higher = more obfuscation)
    STRING_ARRAY_THRESHOLD: 1,      // 0-1 (1 = maximum)
    RESERVED_NAMES: [...]           // React hooks to preserve
}
```

---

## ✅ Testing

### 1. Test in Base Creator (MyProject)

```bash
cd MyProject
npm run build:lock
npm run dev
```

Verify locked components show restriction UI when `LOCK_ENABLED=true`.

### 2. Test in Delivery Project (MyProject_deliver)

```bash
cd MyProject_deliver
npm run dev
```

Verify:
- ✅ Components work correctly
- ✅ No console errors about missing LICENSE_O_S files
- ✅ Lock/unlock behavior functions
- ✅ Obfuscated code is unreadable in `Core/core-ui-runtime.es.js`

### 3. Test Backend API

```bash
curl -X POST https://your-backend.vercel.app/api/guard \
  -H "Content-Type: application/json" \
  -d '{"t":1234567890123,"s":"abc123","r":"test-req-1"}'
```

Expected response:
```json
{
  "locked": false,
  "title": "Access Restricted",
  "message": "Feature unavailable",
  "contact": "Contact: support@...",
  "timestamp": 1234567890123
}
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module 'config.variables'" | Ensure path is `src/LICENSE_O_S/config.variables.ts` |
| Components always blocked | Check `LOCK_ENABLED=false` in Vercel |
| Build fails with config errors | Verify `BUILD_CONFIG` values match folder structure |
| API CORS errors | Check `Access-Control-Allow-Origin` in `guard.js` |
| Obfuscation fails | Lower `CONTROL_FLOW_THRESHOLD` to 0.7 |
| Delivery project has license files | Re-run cleanup.sh script |

---

## 📋 Quick Reference

### File Locations (Project 1: MyProject)
- **Config**: `src/LICENSE_O_S/config.variables.ts` ⭐ NEW
- **Build config**: `vite.lock.config.ts` (reads from config.variables.ts)
- **Obfuscation**: `obfuscate.js` (reads from config.variables.ts)
- **Guard hook**: `src/LICENSE_O_S/LicenseGuard/useComponent_G.ts`
- **Guard UI**: `src/LICENSE_O_S/LicenseGuard/ui_G.tsx`
- **Barrel file**: `src/BarrelFile/ComponentsToBeLocked.tsx`
- **Output**: `src/Core/core-ui-runtime.es.js`

### File Locations (Project 2: MyProject_deliver)
- **Obfuscated bundle**: `src/Core/core-ui-runtime.es.js`
- **Exports**: `src/BarrelFile/ComponentsToBeLocked.tsx`
- **NO LICENSE_O_S, vite.lock.config.ts, obfuscate.js, or VercelBackend**

### Key Commands
- **Build locked version**: `npm run build:lock` (in MyProject)
- **Copy to delivery**: `cp src/Core/core-ui-runtime.es.js ../MyProject_deliver/src/Core/`
- **Deploy backend**: `vercel deploy --prod` (in VercelBackend)
- **Enable lock**: Set `LOCK_ENABLED=true` in Vercel
- **Disable lock**: Set `LOCK_ENABLED=false` in Vercel

---

## 🎯 Checklist for First-Time Setup

- [ ] Install dependencies in MyProject
- [ ] Create `src/LICENSE_O_S/config.variables.ts` with your settings
- [ ] Create all 6 core files (vite.lock.config.ts, obfuscate.js, etc.)
- [ ] Wrap components with G_Wrapper and useComponentGuard
- [ ] Create barrel file listing locked components
- [ ] Run `npm run build:lock` successfully
- [ ] Deploy VercelBackend with environment variables
- [ ] Update API_ENDPOINT in config.variables.ts
- [ ] Test lock/unlock in MyProject
- [ ] Copy MyProject → MyProject_deliver
- [ ] Run cleanup.sh in MyProject_deliver
- [ ] Update ComponentsToBeLocked.tsx in MyProject_deliver
- [ ] Delete original source files from MyProject_deliver
- [ ] Test MyProject_deliver thoroughly
- [ ] Ship ONLY MyProject_deliver to client

---

## 📚 Next Steps

1. **Read the detailed architecture docs** for advanced configurations
2. **Customize obfuscation** by adjusting `Obfuscate_settings` in config.variables.ts
3. **Set up CI/CD** to automate the MyProject → MyProject_deliver workflow
4. **Implement versioning** for Core bundles
5. **Add monitoring** to track license check failures

---

## 🖼️ Demonstration

### Test Component: `ShimmerHeading`

<div align="center">
  <img src="Docs/Pictures/testComp.png" width="300" alt="ShimmerHeading Test Component"/>
</div>

---

### Locked vs Unlocked Comparison

| Locked Component (LOCK_ENABLED=true) | Unlocked Component (LOCK_ENABLED=false) |
|---------------------------------------|------------------------------------------|
| <img src="Docs/Pictures/lockedCompCropeed.png" width="300" alt="Locked Component"/> | <img src="Docs/Pictures/normalCompCropeed.png" width="300" alt="Unlocked Component"/> |

- **Left**: Component blocked by remote license check
- **Right:** The component served normally from the source code.  
