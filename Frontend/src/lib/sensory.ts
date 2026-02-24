/**
 * CodeSage Audio & Haptic Service
 * Provides synthetic feedback for system events.
 */

class SensoryService {
    private ctx: AudioContext | null = null;

    private getContext() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        return this.ctx;
    }

    /**
     * Plays a soft, high-pitched chime (Success/Completion)
     */
    playSuccessChime() {
        const ctx = this.getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    }

    /**
     * Plays a low-frequency, slightly distorted alert (Risk/Alert)
     */
    playRiskAlert() {
        const ctx = this.getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, ctx.currentTime); // A2
        osc.frequency.linearRampToValueAtTime(55, ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    }

    /**
     * Triggers a subtle vibration on supported devices
     */
    triggerHapticPulse(pattern: number | number[] = 10) {
        if (typeof window !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }
}

export const sensory = new SensoryService();
