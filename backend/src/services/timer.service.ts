import { PollModel } from '../models/poll.model';
import { PollWithOptions } from '../types/poll.types';

interface ActiveTimer {
  pollId: string;
  startedAt: number;
  duration: number;
  timeoutId: NodeJS.Timeout | null;
}

export class TimerService {
  private activeTimer: ActiveTimer | null = null;
  private onTimerEnd: ((pollId: string) => void) | null = null;

  // set callback for when timer ends
  setOnTimerEnd(callback: (pollId: string) => void) {
    this.onTimerEnd = callback;
  }

  // start timer for a poll
  startTimer(poll: PollWithOptions): void {
    // clear any existing timer
    this.stopTimer();

    const startTime = poll.started_at ? new Date(poll.started_at).getTime() : Date.now();
    
    this.activeTimer = {
      pollId: poll.id,
      startedAt: startTime,
      duration: poll.duration,
      timeoutId: null,
    };

    // calculate remaining time
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, poll.duration - elapsed);

    if (remaining > 0) {
      // set timeout to end poll
      this.activeTimer.timeoutId = setTimeout(() => {
        this.handleTimerEnd();
      }, remaining * 1000);

      console.log(`Timer started for poll ${poll.id}, ${remaining}s remaining`);
    } else {
      // timer already expired
      this.handleTimerEnd();
    }
  }

  // stop the current timer
  stopTimer(): void {
    if (this.activeTimer && this.activeTimer.timeoutId) {
      clearTimeout(this.activeTimer.timeoutId);
    }
    this.activeTimer = null;
  }

  // handle timer expiration
  private async handleTimerEnd(): Promise<void> {
    if (!this.activeTimer) return;

    const pollId = this.activeTimer.pollId;
    console.log(`Timer ended for poll ${pollId}`);

    // update poll status in db
    try {
      await PollModel.updateStatus(pollId, 'completed');
    } catch (err) {
      console.error('Error updating poll status:', err);
    }

    // call the callback
    if (this.onTimerEnd) {
      this.onTimerEnd(pollId);
    }

    this.activeTimer = null;
  }

  // get remaining time for active poll
  getRemainingTime(): number {
    if (!this.activeTimer) return 0;

    const elapsed = Math.floor((Date.now() - this.activeTimer.startedAt) / 1000);
    const remaining = Math.max(0, this.activeTimer.duration - elapsed);
    return remaining;
  }

  // get active poll id
  getActivePollId(): string | null {
    return this.activeTimer ? this.activeTimer.pollId : null;
  }

  // check if a poll timer is running
  isTimerRunning(): boolean {
    return this.activeTimer !== null;
  }

  // restore timer from database (for server restart)
  async restoreTimer(): Promise<void> {
    const activePoll = await PollModel.findActive();
    if (activePoll && activePoll.started_at) {
      const elapsed = Math.floor((Date.now() - new Date(activePoll.started_at).getTime()) / 1000);
      
      if (elapsed < activePoll.duration) {
        // timer still has time left, restore it
        this.startTimer(activePoll);
        console.log('Timer restored for active poll');
      } else {
        // timer expired while server was down, end the poll
        await PollModel.updateStatus(activePoll.id, 'completed');
        console.log('Expired poll marked as completed');
      }
    }
  }
}

export const timerService = new TimerService();
