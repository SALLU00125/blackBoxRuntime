// DEBUG VERSION
// hooks/useComponentGuard.ts
// 🔒 PAGE-AWARE SHARED GUARD SYSTEM - Works across multiple pages/routes

import { useState, useEffect, useRef } from 'react';

// ============= TYPES =============
export interface GuardState {
    ready: boolean;
    access: boolean;
    content: {
        title?: string;
        message?: string;
        contact?: string;
    } | null;
    meta: {
        hash: string;
        exp: number;
        sig: string;
        requestId: string;
        timestamp: number;
    };
}

export interface GuardConfig {
    apiEndpoint?: string;
    checkInterval?: number;
    enableLogging?: boolean;
    pageIsolation?: boolean;  // Isolate data per page
    pageId?: string;          // Optional: Manual page identifier
}

// ============= HIDDEN COMMUNICATION CHANNEL =============
class HiddenGuardChannel {
    private static instance: HiddenGuardChannel;
    private subscribers: Map<string, Set<(state: GuardState) => void>> = new Map();
    private currentState: Map<string, GuardState> = new Map();
    private lastCheckTime: Map<string, number> = new Map();
    private checkingPages: Set<string> = new Set();
    private checkInterval: number = 300000; // 5mins
    private apiEndpoint: string = 'https://license-lq.vercel.app/api/guard';
    private enableLogging: boolean = false;
    private pageIsolation: boolean = false;

    private constructor() {
        if (this.enableLogging) {
            console.log('🔒 Guard channel initialized');
        }
    }

    static getInstance(): HiddenGuardChannel {
        if (!HiddenGuardChannel.instance) {
            HiddenGuardChannel.instance = new HiddenGuardChannel();
        }
        return HiddenGuardChannel.instance;
    }

    configure(config: GuardConfig) {
        if (config.apiEndpoint) this.apiEndpoint = config.apiEndpoint;
        if (config.checkInterval) this.checkInterval = config.checkInterval;
        if (config.enableLogging !== undefined) this.enableLogging = config.enableLogging;
        if (config.pageIsolation !== undefined) this.pageIsolation = config.pageIsolation;
    }

    // Get the key for storing data (page-specific or global)
    private getStorageKey(pageId?: string): string {
        if (this.pageIsolation && pageId) {
            return `page:${pageId}`;
        }
        return 'global';
    }

    // Subscribe a component (with optional page context)
    subscribe(callback: (state: GuardState) => void, pageId?: string): () => void {
        const key = this.getStorageKey(pageId);

        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }

        this.subscribers.get(key)!.add(callback);

        // 🔍 TEMPORARY DEBUG: Visual alerts for debugging
        if (typeof window !== 'undefined') {
            const div = document.createElement('div');
            div.style.cssText = 'position:fixed;top:10px;right:10px;background:green;color:white;padding:10px;z-index:9999;border-radius:5px;';
            div.textContent = `✅ SUBSCRIBE: ${this.subscribers.get(key)!.size} total`;
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 8000);
        }

        if (this.enableLogging) {
            console.log(`🔒 Component subscribed to ${key} (total: ${this.subscribers.get(key)!.size})`);
        }

        // If we already have state for this page/global, send it immediately
        if (this.currentState.has(key)) {
            if (typeof window !== 'undefined') {
                const div = document.createElement('div');
                div.style.cssText = 'position:fixed;top:50px;right:10px;background:blue;color:white;padding:10px;z-index:9999;border-radius:5px;';
                div.textContent = `💾 CACHE HIT - No API call needed`;
                document.body.appendChild(div);
                setTimeout(() => div.remove(), 8000);
            }
            callback(this.currentState.get(key)!);
        } else {
            if (typeof window !== 'undefined') {
                const div = document.createElement('div');
                div.style.cssText = 'position:fixed;top:50px;right:10px;background:orange;color:white;padding:10px;z-index:9999;border-radius:5px;';
                div.textContent = `🆕 NEW REQUEST - Making API call`;
                document.body.appendChild(div);
                setTimeout(() => div.remove(), 8000);
            }
            // First subscriber triggers the check
            this.checkGuard(pageId);
        }

        // Return unsubscribe function
        return () => {
            this.subscribers.get(key)?.delete(callback);

            // 🔍 TEMPORARY DEBUG: Show unsubscription
            if (typeof window !== 'undefined') {
                const div = document.createElement('div');
                div.style.cssText = 'position:fixed;top:90px;right:10px;background:red;color:white;padding:10px;z-index:9999;border-radius:5px;';
                div.textContent = `❌ UNSUBSCRIBE: ${this.subscribers.get(key)?.size || 0} remaining`;
                document.body.appendChild(div);
                setTimeout(() => div.remove(), 8000);
            }

            if (this.enableLogging) {
                console.log(`🔒 Component unsubscribed from ${key} (remaining: ${this.subscribers.get(key)?.size || 0})`);
            }

            // Clean up if no more subscribers for this page
            if (this.subscribers.get(key)?.size === 0) {
                this.subscribers.delete(key);
                // this.currentState.delete(key);
                // this.lastCheckTime.delete(key);
                if (this.enableLogging) {
                    console.log(`🔒 Cleaned up data for ${key}`);
                }
            }
        };
    }

    // Broadcast state to all subscribed components on this page
    private broadcast(state: GuardState, pageId?: string) {
        const key = this.getStorageKey(pageId);
        this.currentState.set(key, state);

        const subscribers = this.subscribers.get(key);

        // 🔍 TEMPORARY DEBUG: Show broadcast activity
        if (typeof window !== 'undefined') {
            const div = document.createElement('div');
            div.style.cssText = 'position:fixed;top:130px;right:10px;background:purple;color:white;padding:10px;z-index:9999;border-radius:5px;';
            div.textContent = `📡 BROADCAST to ${subscribers?.size || 0} components`;
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 8000);
        }

        if (subscribers) {
            subscribers.forEach(callback => callback(state));
        }
    }

    // Check if we should make a new API call
    private shouldCheck(pageId?: string): boolean {
        const key = this.getStorageKey(pageId);
        const now = Date.now();
        const lastCheck = this.lastCheckTime.get(key) || 0;
        const timeSinceLastCheck = now - lastCheck;

        return (
            lastCheck === 0 ||
            timeSinceLastCheck >= this.checkInterval
        ) && !this.checkingPages.has(key);
    }

    // Make API call (only ONE component does this at a time per page)
    async checkGuard(pageId?: string) {
        const key = this.getStorageKey(pageId);

        if (!this.shouldCheck(pageId)) {
            if (typeof window !== 'undefined') {
                const div = document.createElement('div');
                div.style.cssText = 'position:fixed;top:170px;right:10px;background:gray;color:white;padding:10px;z-index:9999;border-radius:5px;';
                div.textContent = `⏭️ SKIP - Recently checked`;
                document.body.appendChild(div);
                setTimeout(() => div.remove(), 8000);
            }
            if (this.enableLogging) {
                console.log(`🔒 Skipping check for ${key} (recently checked or in progress)`);
            }
            return;
        }

        this.checkingPages.add(key);
        this.lastCheckTime.set(key, Date.now());

        if (typeof window !== 'undefined') {
            const div = document.createElement('div');
            div.style.cssText = 'position:fixed;top:170px;right:10px;background:darkred;color:white;padding:10px;z-index:9999;border-radius:5px;font-weight:bold;';
            div.textContent = `🌐 API CALL STARTED`;
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 6000);
        }

        if (this.enableLogging) {
            console.log(`🔒 Making API call for ${key} (shared by all components on this page)`);
        }

        try {
            const payload = this.buildPayload();

            // ✅ FIX: Use this.apiEndpoint directly instead of validating payload.endpoint
            // const allowedDomain = new URL(this.apiEndpoint).origin;

            // ✅ FIX: Make the actual fetch call to this.apiEndpoint
            const result = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-ID': payload.requestId,
                    'X-Request-Time': payload.data.t.toString()
                },
                body: JSON.stringify(payload.data)
            });

            // ✅ FIX: Check if response is ok before parsing
            if (!result.ok) {
                throw new Error(`HTTP error! status: ${result.status}`);
            }

            const response = await result.json();
            const processed = this.processResponse(response, payload.requestId);

            if (typeof window !== 'undefined') {
                const div = document.createElement('div');
                div.style.cssText = 'position:fixed;top:210px;right:10px;background:darkgreen;color:white;padding:10px;z-index:9999;border-radius:5px;font-weight:bold;';
                div.textContent = `✅ API SUCCESS - Access: ${processed.access}`;
                document.body.appendChild(div);
                setTimeout(() => div.remove(), 6000);
            }

            // Broadcast to ALL components on this page
            this.broadcast({
                ready: true,
                access: processed.access,
                content: processed.content,
                meta: processed.meta
            }, pageId);

        } catch (error) {
            if (typeof window !== 'undefined') {
                const div = document.createElement('div');
                div.style.cssText = 'position:fixed;top:210px;right:10px;background:darkred;color:white;padding:10px;z-index:9999;border-radius:5px;font-weight:bold;';
                div.textContent = `❌ API ERROR`;
                document.body.appendChild(div);
                setTimeout(() => div.remove(), 6000);
            }

            if (this.enableLogging) {
                console.error('🔒 Guard error:', error);
            }

            this.broadcast({
                ready: true,
                access: true,
                content: null,
                meta: this.generateFallbackMeta()
            }, pageId);
        } finally {
            this.checkingPages.delete(key);
        }
    }

    private buildPayload() {
        const timestamp = Date.now();
        const requestId = this.generateRequestId();

        // ✅ FIX: Removed redundant endpoint field
        return {
            requestId: requestId,
            data: {
                t: timestamp,
                s: Math.random().toString(16).substring(2, 18),
                r: requestId,
                c: btoa(navigator.userAgent.substring(0, 50))
            }
        };
    }

    private generateRequestId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }

    private processResponse(response: any, expectedRequestId: string): any {
        try {
            const decoded = atob(response.payload || '');
            const parsed = JSON.parse(decoded);

            if (parsed.requestId !== expectedRequestId) {
                console.warn('🔒 Request ID mismatch');
                return {
                    access: false,
                    content: {
                        title: 'Security Error',
                        message: 'Invalid response detected'
                    },
                    meta: this.generateFallbackMeta()
                };
            }

            const responseAge = Date.now() - parsed.timestamp;
            if (responseAge > 5000) {
                console.warn('🔒 Stale response');
                return {
                    access: false,
                    content: {
                        title: 'Security Error',
                        message: 'Stale response detected'
                    },
                    meta: this.generateFallbackMeta()
                };
            }

            return {
                access: parsed.allow === 1,
                content: parsed.message,
                meta: {
                    hash: parsed.hash,
                    exp: parsed.exp,
                    sig: parsed.sig,
                    requestId: parsed.requestId,
                    timestamp: parsed.timestamp
                }
            };
        } catch {
            return {
                access: true,
                content: null,
                meta: this.generateFallbackMeta()
            };
        }
    }

    private generateFallbackMeta() {
        return {
            hash: btoa(String(Date.now())),
            exp: Date.now() + 3600000,
            sig: 'fallback',
            requestId: 'fallback',
            timestamp: Date.now()
        };
    }
}

// ============= PUBLIC HOOK (WITH PAGE AWARENESS) =============
export const useComponentGuard = (config: GuardConfig = {}) => {
    const [guardState, setGuardState] = useState<GuardState>({
        ready: false,
        access: false,
        content: null,
        meta: {
            hash: '',
            exp: 0,
            sig: '',
            requestId: '',
            timestamp: 0
        }
    });

    // Get current page/route - use manual pageId if provided, otherwise window.location
    const pageId = config.pageIsolation
        ? (config.pageId || (typeof window !== 'undefined' ? window.location.pathname : 'global'))
        : undefined;

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const channel = HiddenGuardChannel.getInstance();
        channel.configure(config);

        // Subscribe this component to the channel (with page context)
        const unsubscribe = channel.subscribe((state) => {
            setGuardState(state);
        }, pageId);

        // Set up periodic re-checks
        intervalRef.current = setInterval(() => {
            channel.checkGuard(pageId);
        }, config.checkInterval || 60000);

        return () => {
            unsubscribe();
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [config.apiEndpoint, config.checkInterval, config.enableLogging, config.pageIsolation, pageId]);

    return guardState;
};

// ============= MANUAL TRIGGER =============
export const triggerGuardCheck = (pageId?: string) => {
    HiddenGuardChannel.getInstance().checkGuard(pageId);
};