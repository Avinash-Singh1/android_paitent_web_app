import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import {
  TwilioVideoService,
  VideoLinkPayload,
} from 'src/app/services/twilio-video.service';

/**
 * Data injected via `MatDialog.open(TwilioVideoDialogComponent, { data: {...} })`.
 */
export interface TwilioVideoDialogData {
  videoLink: VideoLinkPayload;
  displayName: string;
  isDoctor?: boolean;
}

/**
 * In-app video consultation modal for patients using the Twilio Video SDK.
 *
 * Lifecycle:
 *  1. `ngAfterViewInit` → `TwilioVideoService.join(...)`
 *  2. Subscribe to participant / track events, attaching video elements as
 *     participants appear.
 *  3. On dialog close (`ngOnDestroy`) → `leave()`.
 *
 * Fallback:
 *  - If `provider !== 'twilio'` (or SDK errors before join), a "Open Meet"
 *    button is rendered instead, which opens the URL in a new tab.
 */
@Component({
  standalone: false,
  selector: 'nectar-twilio-video-dialog',
  templateUrl: './twilio-video-dialog.component.html',
  styleUrls: ['./twilio-video-dialog.component.scss'],
})
export class TwilioVideoDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('remoteContainer', { static: false })
  remoteContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('selfContainer', { static: false })
  selfContainer!: ElementRef<HTMLDivElement>;

  connecting = true;
  errorMessage: string | null = null;
  muted = false;
  cameraOff = false;
  participantsCount = 0;

  // Permission flow states
  permissionStage: 'requesting' | 'preview' | 'connecting' | 'connected' | 'error' = 'requesting';
  previewStream: MediaStream | null = null;
  permissionError: string | null = null;

  private readonly subs: Subscription[] = [];
  /** userId → attached elements, so we can detach cleanly on trackUnsubscribed. */
  private readonly attached = new Map<string, HTMLMediaElement[]>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TwilioVideoDialogData,
    private dialogRef: MatDialogRef<TwilioVideoDialogComponent>,
    private twilio: TwilioVideoService
  ) {}

  get isTwilioSession(): boolean {
    return this.data?.videoLink?.provider === 'twilio';
  }

  get fallbackMeetUrl(): string | null {
    return (
      this.data?.videoLink?.fallbackMeetUrl ||
      this.data?.videoLink?.meetingUrl ||
      null
    );
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isTwilioSession) {
      // Non-Twilio appointment — just render the fallback UI.
      this.connecting = false;
      return;
    }

    // Don't auto-join. Instead, request permissions first and show preview.
    await this.requestPermissionsAndPreview();
  }

  /**
   * Industry standard: Request permissions first, show preview, then let user join.
   * This follows the pattern used by Zoom, Google Meet, Microsoft Teams.
   */
  async requestPermissionsAndPreview(): Promise<void> {
    this.permissionStage = 'requesting';
    this.permissionError = null;

    try {
      // Request camera and microphone access
      this.previewStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 640, height: 480 },
      });

      // Show preview in the self-view container
      this.permissionStage = 'preview';
      
      // Wait for view to update then attach preview
      setTimeout(() => {
        if (this.previewStream && this.selfContainer) {
          const videoTrack = this.previewStream.getVideoTracks()[0];
          if (videoTrack) {
            const video = document.createElement('video');
            video.srcObject = new MediaStream([videoTrack]);
            video.autoplay = true;
            video.muted = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.transform = 'scaleX(-1)';
            this.selfContainer.nativeElement.innerHTML = '';
            this.selfContainer.nativeElement.appendChild(video);
          }
        }
      }, 100);
      
    } catch (err: any) {
      this.permissionStage = 'error';
      
      // User-friendly error messages
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.permissionError =
          'Camera and microphone access was denied. Please click the camera icon in your browser address bar and allow access.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        this.permissionError =
          'No camera or microphone found. Please connect a device and try again.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        this.permissionError =
          'Camera or microphone is already in use. Please close other applications (Zoom, Teams, etc.) and try again.';
      } else if (
        err.name === 'NotSupportedError' ||
        err.message?.includes('getUserMedia is not supported')
      ) {
        this.permissionError =
          'Video calls require a secure connection (HTTPS). Please contact support if this issue persists.';
      } else {
        this.permissionError = `Unable to access camera/microphone: ${err.message || 'Unknown error'}`;
      }
      
      console.error('[TwilioVideoDialog] Permission request failed', err);
    }
  }

  /**
   * User clicks "Join Call" after preview - now connect to Twilio room
   */
  async joinVideoCall(): Promise<void> {
    if (!this.previewStream) {
      await this.requestPermissionsAndPreview();
      return;
    }

    this.permissionStage = 'connecting';
    this.wireEvents();

    try {
      // Stop preview stream tracks as Twilio will create new ones
      this.previewStream.getTracks().forEach((track) => track.stop());
      this.previewStream = null;

      await this.twilio.join({
        token: this.data.videoLink.token!,
        roomName: this.data.videoLink.roomName!,
        userName: this.data.displayName,
      });
      
      this.permissionStage = 'connected';
      this.connecting = false;

      // Render local self-view with actual call tracks
      const localVideo = this.twilio.getLocalVideoTrack();
      if (localVideo && this.selfContainer) {
        const el = localVideo.attach();
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.objectFit = 'cover';
        (el as HTMLVideoElement).style.transform = 'scaleX(-1)';
        this.selfContainer.nativeElement.innerHTML = '';
        this.selfContainer.nativeElement.appendChild(el);
      }
      this.updateParticipantsCount();
    } catch (err: any) {
      this.permissionStage = 'error';
      this.connecting = false;
      this.errorMessage =
        err?.message || 'Could not connect to the video session.';
      console.error('[TwilioVideoDialog] join error', err);
    }
  }

  /**
   * Retry permission request
   */
  async retryPermissions(): Promise<void> {
    this.permissionError = null;
    if (this.previewStream) {
      this.previewStream.getTracks().forEach((track) => track.stop());
      this.previewStream = null;
    }
    await this.requestPermissionsAndPreview();
  }

  private wireEvents(): void {
    this.subs.push(
      this.twilio.participantConnected$.subscribe(() =>
        this.updateParticipantsCount()
      ),
      this.twilio.participantDisconnected$.subscribe((p: any) => {
        const key = String(p?.sid || p?.identity || '');
        this.detach(key);
        this.updateParticipantsCount();
      }),
      this.twilio.trackSubscribed$.subscribe(({ participant, track }) => {
        if (!track || track.kind === 'data') return;
        const key = String(participant?.sid || participant?.identity || '');
        const el = track.attach();
        if (track.kind === 'video') {
          el.style.width = '100%';
          el.style.height = '100%';
          el.style.objectFit = 'cover';
        }
        this.remoteContainer?.nativeElement.appendChild(el);
        const arr = this.attached.get(key) || [];
        arr.push(el);
        this.attached.set(key, arr);
      }),
      this.twilio.trackUnsubscribed$.subscribe(({ track }) => {
        try { track.detach().forEach((el: HTMLElement) => el.remove()); } catch { /* noop */ }
      }),
      this.twilio.disconnected$.subscribe(({ reason }) => {
        this.errorMessage = `The video session was disconnected${
          reason ? ': ' + reason : ''
        }.`;
        console.warn('[TwilioVideoDialog] disconnected', reason);
      })
    );
  }

  private detach(participantKey: string): void {
    const arr = this.attached.get(participantKey) || [];
    for (const el of arr) {
      try { el.remove(); } catch { /* noop */ }
    }
    this.attached.delete(participantKey);
  }

  private updateParticipantsCount(): void {
    // Local + remote. Twilio's LocalParticipant is excluded from
    // `room.participants`, so add 1 for self.
    const remote = (this.twilio as any).room?.participants?.size ?? 0;
    this.participantsCount = remote + 1;
  }

  toggleMute(): void {
    const enabled = this.twilio.toggleAudio();
    this.muted = !enabled;
  }

  toggleCamera(): void {
    const enabled = this.twilio.toggleVideo();
    this.cameraOff = !enabled;
  }

  openMeetFallback(): void {
    const url = this.fallbackMeetUrl;
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
    this.dialogRef.close({ opened: 'meet' });
  }

  leave(): void {
    // Clean up preview stream if still active
    if (this.previewStream) {
      this.previewStream.getTracks().forEach((track) => track.stop());
      this.previewStream = null;
    }
    this.twilio.leave();
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    for (const s of this.subs) {
      try { s.unsubscribe(); } catch { /* noop */ }
    }
    // Clean up preview stream
    if (this.previewStream) {
      this.previewStream.getTracks().forEach((track) => track.stop());
      this.previewStream = null;
    }
    this.twilio.leave();
  }
}
