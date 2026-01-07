import { PollModel } from '../models/poll.model';
import { PollWithOptions } from '../types/poll.types';

interface ActiveTimer {
  pollId: string;
  startedAt: number;
  duration: number;
  timeoutId: NodeJS.Timeout | null;
  intervalId: NodeJS.Timeout | null;
}

export class TimerService {
  private activeTimer: ActiveTimer | null = null;
  private onTimerEnd: ((pollId: string) => void) | null = null;
  private onTimerTick: ((pollId: string, remaining: number) => void) | null = null;

  setOnTimerEnd(callback: (pollId: string) => void) {
    this.onTimerEnd = callback;
  }

  setOnTimerTick(callback: (pollId: string, remaining: number) => void) {
    this.onTimerTick = callback;
  }

  startTimer(poll: PollWithOptions): void {
    this.stopTimer();

    const startTime = poll.started_at ? new Date(poll.started_at).getTime() : Date.now();
    
    this.activeTimer = {
      pollId: poll.id,
      startedAt: startTime,
      duration: poll.duration,
      timeoutId: null,
      intervalId: null,
    };

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, poll.duration - elapsed);

    if (remaining > 0) {
      this.activeTimer.timeoutId = setTimeout(() => {
        this.handleTimerEnd();
      }, remaining * 1000);

      this.activeTimer.intervalId = setInterval(() => {
        const timeLeft = this.getRemainingTime();
        if (this.onTimerTick && this.activeTimer) {
          this.onTimerTick(this.activeTimer.pollId, timeLeft);
        }
      }, 1000);

      console.log(`Timer started: ${poll.id}, ${remaining}s left`);
    } else {
      this.handleTimerEnd();
    }
  }

  stopTimer(): void {
    if (this.activeTimer) {
      if (this.activeTimer.timeoutId) clearTimeout(this.activeTimer.timeoutId);
      if (this.activeTimer.intervalId) clearInterval(this.activeTimer.intervalId);
    }
    this.activeTimer = null;
  }

  private async handleTimerEnd(): Promise<void> {
    if (!this.activeTimer) return;

    const pollId = this.activeTimer.pollId;
    console.log(`Timer ended: ${pollId}`);

    if (this.activeTimer.intervalId) {
      clearInterval(this.activeTimer.intervalId);
    }

    try {
      await PollModel.updateStatus(pollId, 'completed');
    } catch (err) {
      console.error('Failed to update poll status:', err);
    }

    if (this.onTimerEnd) {
      this.onTimerEnd(pollId);
    }

    this.activeTimer = null;
  }

  getRemainingTime(): number {
    if (!this.activeTimer) return 0;

    const elapsed = Math.floor((Date.now() - this.activeTimer.startedAt) / 1000);
    return Math.max(0, this.activeTimer.duration - elapsed);
  }

  getActivePollId(): string | null {
    return this.activeTimer ? this.activeTimer.pollId : null;
  }

  isTimerRunning(): boolean {
    return this.activeTimer !== null;
  }

  async restoreTimer(): Promise<void> {
    const activePoll = await PollModel.findActive();
    if (activePoll && activePoll.started_at) {
      const elapsed = Math.floor((Date.now() - new Date(activePoll.started_at).getTime()) / 1000);
      
      if (elapsed < activePoll.duration) {
        this.startTimer(activePoll);
        console.log('Timer restored from database');
      } else {
        await PollModel.updateStatus(activePoll.id, 'completed');
        console.log('Expired poll marked completed');
      }
    }
  }
}

export const timerService = new TimerService();
