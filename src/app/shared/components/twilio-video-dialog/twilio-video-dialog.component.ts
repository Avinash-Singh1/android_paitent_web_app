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
import { PersistentVideoCallService } from 'src/app/services/persistent-video-call.service';

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
  @ViewChild('selfContainer', { static: false })
  selfContainer!: ElementRef<HTMLDivElement>;

  connecting = true;
  errorMessage: string | null = null;

  // Permission flow states
  permissionStage: 'requesting' | 'preview' | 'connecting' | 'connected' | 'error' = 'requesting';
  previewStream: MediaStream | null = null;
  permissionError: string | null = null;

  private readonly subs: Subscription[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TwilioVideoDialogData,
    private dialogRef: MatDialogRef<TwilioVideoDialogComponent>,
    private twilio: TwilioVideoService,
    private persistentVideoCall: PersistentVideoCallService
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
   * User clicks "Join Call" after preview - now connect to Twilio room via persistent service
   */
  async joinVideoCall(): Promise<void> {
    if (!this.previewStream) {
      await this.requestPermissionsAndPreview();
      return;
    }

    this.permissionStage = 'connecting';

    try {
      // Stop preview stream tracks as persistent service will create new ones
      this.previewStream.getTracks().forEach((track) => track.stop());
      this.previewStream = null;

      // Start call via persistent service (survives dialog close)
      await this.persistentVideoCall.startCall({
        appointmentId: this.data.videoLink.appointmentId!,
        roomName: this.data.videoLink.roomName!,
        token: this.data.videoLink.token!,
        identity: this.data.videoLink.identity || 'patient',
        displayName: this.data.displayName,
        isDoctor: this.data.isDoctor || false,
        fallbackMeetUrl: this.data.videoLink.fallbackMeetUrl,
      });
      
      this.permissionStage = 'connected';
      this.connecting = false;

      // Close dialog - call now lives in persistent service + floating component
      this.dialogRef.close({ joined: true });
      
      console.log('[TwilioVideoDialog] Call started via persistent service');
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
    // Don't call twilio.leave() - persistent service owns the call now
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
    // Don't disconnect the call - it's managed by persistent service now
  }
}
