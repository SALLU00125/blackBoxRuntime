// removed debugging and  cleaned
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
    private pageIsolation: boolean = false;

    private constructor() {}

    static getInstance(): HiddenGuardChannel {
        if (!HiddenGuardChannel.instance) {
            HiddenGuardChannel.instance = new HiddenGuardChannel();
        }
        return HiddenGuardChannel.instance;
    }

    configure(config: GuardConfig) {
        if (config.apiEndpoint) this.apiEndpoint = config.apiEndpoint;
        if (config.checkInterval) this.checkInterval = config.checkInterval;
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

        // If we already have state for this page/global, send it immediately
        if (this.currentState.has(key)) {
            callback(this.currentState.get(key)!);
        } else {
            // First subscriber triggers the check
            this.checkGuard(pageId);
        }

        // Return unsubscribe function
        return () => {
            this.subscribers.get(key)?.delete(callback);

            // Clean up if no more subscribers for this page
            if (this.subscribers.get(key)?.size === 0) {
                this.subscribers.delete(key);
            }
        };
    }

    // Broadcast state to all subscribed components on this page
    private broadcast(state: GuardState, pageId?: string) {
        const key = this.getStorageKey(pageId);
        this.currentState.set(key, state);

        const subscribers = this.subscribers.get(key);
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
            return;
        }

        this.checkingPages.add(key);
        this.lastCheckTime.set(key, Date.now());

        try {
            const payload = this.buildPayload();

            const result = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-ID': payload.requestId,
                    'X-Request-Time': payload.data.t.toString()
                },
                body: JSON.stringify(payload.data)
            });

            if (!result.ok) {
                throw new Error(`HTTP error! status: ${result.status}`);
            }

            const response = await result.json();
            const processed = this.processResponse(response, payload.requestId);

            // Broadcast to ALL components on this page
            this.broadcast({
                ready: true,
                access: processed.access,
                content: processed.content,
                meta: processed.meta
            }, pageId);

        } catch (error) {
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
    }, [config.apiEndpoint, config.checkInterval, config.pageIsolation, pageId]);

    return guardState;
};

// ============= MANUAL TRIGGER =============
export const triggerGuardCheck = (pageId?: string) => {
    HiddenGuardChannel.getInstance().checkGuard(pageId);
};