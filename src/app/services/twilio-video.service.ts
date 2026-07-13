import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/config/api.constant';

/**
 * Backend response from `GET /api/v1/appointment/video-link/:id`.
 *
 * When `provider === 'twilio'`, `roomName` + `token` are populated so the
 * client can join an in-app Twilio Video room. `fallbackMeetUrl` /
 * `meetingUrl` may be used to open a browser fallback for older flows.
 */
export interface VideoLinkPayload {
  appointmentId: string;
  provider: 'twilio' | 'google_meet' | string;
  roomName?: string;
  token?: string;
  identity?: string;
  role?: string;
  meetingUrl?: string;
  fallbackMeetUrl?: string | null;
}

/**
 * Thin wrapper around the Twilio Video Web SDK (`twilio-video`).
 *
 * Design notes:
 *  - Lazy-loaded via dynamic `import()` so the SDK bundle is only downloaded
 *    when a user actually opens a video call.
 *  - Safe on Angular SSR — all SDK access is gated on `isPlatformBrowser`.
 *  - Exposes RxJS Subjects for participant events so consumers stay
 *    Angular-native and don't need to know Twilio-specific types.
 *
 * Docs: https://www.twilio.com/docs/video/javascript/getting-started
 */
@Injectable({ providedIn: 'root' })
export class TwilioVideoService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private room: any | null = null;
  private localTracks: any[] = [];

  /** participantConnected / participantDisconnected event streams. */
  public readonly participantConnected$ = new Subject<any>();
  public readonly participantDisconnected$ = new Subject<any>();
  public readonly trackSubscribed$ = new Subject<{
    participant: any;
    track: any;
  }>();
  public readonly trackUnsubscribed$ = new Subject<{
    participant: any;
    track: any;
  }>();
  public readonly disconnected$ = new Subject<{ reason?: string }>();

  // ── HTTP ────────────────────────────────────────────────────────────────
  /** Fetch join info from the Patient Backend. */
  getVideoLink(appointmentId: string): Observable<any> {
    const url = `${API_ENDPOINTS.patient.videoLink}/${encodeURIComponent(
      appointmentId
    )}`;
    return this.http.get(url);
  }

  // ── SDK lifecycle ──────────────────────────────────────────────────────
  /**
   * Connect to a Twilio Video room. Throws on failure so the caller can
   * decide the fallback (e.g. open Meet URL, retry, show error).
   */
  async join(opts: {
    token: string;
    roomName: string;
    userName?: string;
  }): Promise<void> {
    if (!this.isBrowser) {
      throw new Error('Twilio Video can only be used in the browser.');
    }

    // Check if getUserMedia is supported
    if (!this.isGetUserMediaSupported()) {
      throw new Error(
        'Camera and microphone access is not available. Please ensure:\n' +
        '1. You are using HTTPS (or localhost)\n' +
        '2. Your browser supports WebRTC\n' +
        '3. Camera/microphone permissions are granted'
      );
    }

    // Dynamic import so this ~150KB chunk is code-split.
    const twilioModule: any = await import('twilio-video');
    // Handle CommonJS default export wrapped by ES module dynamic import
    const twilioVideo = twilioModule.default || twilioModule;
    const { connect, createLocalTracks } = twilioVideo;

    try {
      this.localTracks = await createLocalTracks({
        audio: true,
        video: { width: 640, height: 480 },
      });
    } catch (error: any) {
      // Handle specific getUserMedia errors
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Camera/microphone permission denied. Please allow access and try again.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('No camera or microphone found. Please connect a device and try again.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('Camera or microphone is already in use by another application.');
      } else if (error.message?.includes('getUserMedia is not supported')) {
        throw new Error(
          'Video calls require HTTPS. Please access the application using https:// instead of http://'
        );
      }
      throw error;
    }

    this.room = await connect(opts.token, {
      name: opts.roomName,
      tracks: this.localTracks,
      dominantSpeaker: true,
    });

    this.wireEventListeners();
  }

  /**
   * Check if getUserMedia is supported in the current browser context.
   */
  private isGetUserMediaSupported(): boolean {
    if (!this.isBrowser) return false;
    
    const nav = navigator as any;
    return !!(
      nav.mediaDevices &&
      nav.mediaDevices.getUserMedia &&
      (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    );
  }

  private wireEventListeners(): void {
    if (!this.room) return;
    this.room.participants.forEach((p: any) => {
      this.participantConnected$.next(p);
      this.wireParticipant(p);
    });
    this.room.on('participantConnected', (p: any) => {
      this.participantConnected$.next(p);
      this.wireParticipant(p);
    });
    this.room.on('participantDisconnected', (p: any) => {
      this.participantDisconnected$.next(p);
    });
    this.room.on('disconnected', (_room: any, error?: any) => {
      this.disconnected$.next({ reason: error?.message });
    });
  }

  private wireParticipant(participant: any): void {
    participant.tracks.forEach((pub: any) => {
      if (pub.isSubscribed && pub.track) {
        this.trackSubscribed$.next({ participant, track: pub.track });
      }
    });
    participant.on('trackSubscribed', (track: any) => {
      this.trackSubscribed$.next({ participant, track });
    });
    participant.on('trackUnsubscribed', (track: any) => {
      this.trackUnsubscribed$.next({ participant, track });
    });
  }

  /** Disconnect from the room and stop all local tracks. */
  leave(): void {
    try {
      this.localTracks.forEach((t) => {
        try { t.stop(); } catch { /* noop */ }
      });
    } catch { /* noop */ }
    try { this.room?.disconnect(); } catch { /* noop */ }
    this.localTracks = [];
    this.room = null;
  }

  // ── Media controls ────────────────────────────────────────────────────
  /** Returns true when the audio track ends up enabled, false when muted. */
  toggleAudio(): boolean {
    const audio = this.localTracks.find((t) => t.kind === 'audio');
    if (!audio) return false;
    if (audio.isEnabled) audio.disable();
    else audio.enable();
    return audio.isEnabled;
  }

  toggleVideo(): boolean {
    const video = this.localTracks.find((t) => t.kind === 'video');
    if (!video) return false;
    if (video.isEnabled) video.disable();
    else video.enable();
    return video.isEnabled;
  }

  getLocalVideoTrack(): any | null {
    return this.localTracks.find((t) => t.kind === 'video') || null;
  }

  getLocalParticipant(): any | null {
    return this.room?.localParticipant || null;
  }
}
