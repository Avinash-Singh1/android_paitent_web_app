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

    this.wireEvents();

    try {
      await this.twilio.join({
        token: this.data.videoLink.token!,
        roomName: this.data.videoLink.roomName!,
        userName: this.data.displayName,
      });
      this.connecting = false;

      // Render local self-view.
      const localVideo = this.twilio.getLocalVideoTrack();
      if (localVideo && this.selfContainer) {
        const el = localVideo.attach();
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.objectFit = 'cover';
        (el as HTMLVideoElement).style.transform = 'scaleX(-1)';
        this.selfContainer.nativeElement.appendChild(el);
      }
      this.updateParticipantsCount();
    } catch (err: any) {
      this.connecting = false;
      this.errorMessage =
        err?.message || 'Could not connect to the video session.';
      console.error('[TwilioVideoDialog] join error', err);
    }
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
    this.twilio.leave();
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    for (const s of this.subs) {
      try { s.unsubscribe(); } catch { /* noop */ }
    }
    this.twilio.leave();
  }
}
