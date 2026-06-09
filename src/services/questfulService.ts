/**
 * Questful Service
 *
 * Sends XP events to the Questful Living API when actions are performed.
 * This integrates Zen ToT with The Forge gamification system.
 */

import { getForgeUserId } from './forgeUser';

const QUESTFUL_API = '/questful/api/api';

export type ZenTotAction =
  | 'note_created'
  | 'note_updated'
  | 'folder_created'
  | 'youtube_transcript'
  | 'audio_transcription'
  | 'file_upload';

interface XPEventResponse {
  success: boolean;
  xp_earned: number;
  total_xp: number;
  level: number;
  level_up: boolean;
  new_level?: number;
  message: string;
}

interface QuestfulStats {
  user_id: string;
  level: number;
  total_xp: number;
  xp_to_next: number;
  progress_percent: number;
  streak_days: number;
  completed_today: number;
}

class QuestfulService {
  private enabled: boolean = true;

  /**
   * Record an XP event for an action in Zen ToT
   */
  async recordAction(
    action: ZenTotAction,
    metadata?: Record<string, unknown>
  ): Promise<XPEventResponse | null> {
    if (!this.enabled) return null;

    const userId = getForgeUserId();

    try {
      const response = await fetch(`${QUESTFUL_API}/xp/event?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app: 'zen-tot',
          action,
          metadata,
        }),
      });

      if (!response.ok) {
        console.warn('[Questful] Failed to record action:', action);
        return null;
      }

      const result: XPEventResponse = await response.json();

      // Show notification for XP earned
      if (result.success) {
        this.showXPNotification(result);
      }

      return result;
    } catch (error) {
      console.error('[Questful] Error recording action:', error);
      return null;
    }
  }

  /**
   * Get current user stats
   */
  async getStats(): Promise<QuestfulStats | null> {
    const userId = getForgeUserId();

    try {
      const response = await fetch(`${QUESTFUL_API}/stats?user_id=${userId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('[Questful] Error fetching stats:', error);
      return null;
    }
  }

  /**
   * Show XP notification (can be customized)
   */
  private showXPNotification(result: XPEventResponse) {
    // For now, just log to console
    // Could integrate with a toast notification system
    console.log(`[Questful] +${result.xp_earned} XP! (Total: ${result.total_xp})`);

    if (result.level_up && result.new_level) {
      console.log(`[Questful] 🎉 Level up! Now level ${result.new_level}`);
    }
  }

  /**
   * Enable/disable XP tracking
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const questfulService = new QuestfulService();

// Convenience functions for common actions
export const recordNoteCreated = (noteId: string, title: string) =>
  questfulService.recordAction('note_created', { noteId, title });

export const recordNoteUpdated = (noteId: string) =>
  questfulService.recordAction('note_updated', { noteId });

export const recordFolderCreated = (folderId: string, name: string) =>
  questfulService.recordAction('folder_created', { folderId, name });

export const recordYouTubeTranscript = (videoId: string, title?: string) =>
  questfulService.recordAction('youtube_transcript', { videoId, title });

export const recordAudioTranscription = (duration?: number) =>
  questfulService.recordAction('audio_transcription', { duration });

export const recordFileUpload = (fileName: string, fileType: string) =>
  questfulService.recordAction('file_upload', { fileName, fileType });
