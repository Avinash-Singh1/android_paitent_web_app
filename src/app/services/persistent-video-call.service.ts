import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

/**
 * Call state for managing video consultation lifecycle
 */
export type CallState = 'idle' | 'connecting' | 'connected' | 'minimized' | 'reconnecting' | 'error';

/**
 * Active call metadata
 */
export interface ActiveCall {
  appointmentId: string;
  roomName: string;
  token: string;
  identity: string;
  displayName: string;
  isDoctor: boolean;
  startedAt: Date;
  participantsCount: number;
  fallbackMeetUrl?: string | null;
}

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isLocal: boolean;
  attachments?: ChatAttachment[];
}

/**
 * Chat attachment structure (file/image)
 */
export interface ChatAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: 'image' | 'file' | 'document';
  mimeType: string;
  url?: string; // URL after upload
  thumbnailUrl?: string; // For images
  uploadProgress?: number; // 0-100
  uploading?: boolean;
  error?: string;
}

/**
 * Persistent video call service that maintains call state across route navigation.
 * 
 * This service owns the Twilio Room lifecycle and allows the UI to be minimized,
 * restored, or navigated away from without disconnecting the call.
 * 
 * Design:
 *  - Application-scoped singleton service
 *  - Owns the Twilio Room, local tracks, and remote participant subscriptions
 *  - Exposes call state via observables
 *  - Coordinates with TwilioVideoService for low-level SDK operations
 *  - Survives Angular route changes
 */
@Injectable({ providedIn: 'root' })
export class PersistentVideoCallService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // ── State ──────────────────────────────────────────────────────────────
  private readonly _callState$ = new BehaviorSubject<CallState>('idle');
  private readonly _activeCall$ = new BehaviorSubject<ActiveCall | null>(null);
  private readonly _muted$ = new BehaviorSubject<boolean>(false);
  private readonly _cameraOff$ = new BehaviorSubject<boolean>(false);
  private readonly _screenSharing$ = new BehaviorSubject<boolean>(false);
  private readonly _unreadChatCount$ = new BehaviorSubject<number>(0);
  private readonly _chatMessages$ = new BehaviorSubject<ChatMessage[]>([]);

  // Event streams
  private readonly _participantJoined$ = new Subject<any>();
  private readonly _participantLeft$ = new Subject<any>();
  private readonly _remoteTrackAdded$ = new Subject<{ participant: any; track: any }>();
  private readonly _remoteTrackRemoved$ = new Subject<{ participant: any; track: any }>();
  private readonly _callEnded$ = new Subject<{ reason?: string }>();
  private readonly _error$ = new Subject<{ message: string; code?: string }>();

  // Twilio SDK references (owned by this service)
  private twilioRoom: any | null = null;
  private localTracks: any[] = [];
  private screenTrack: any | null = null;
  private dataTrack: any | null = null; // For chat messages
  private twilioVideoModule: any | null = null;

  // ── Public Observables ─────────────────────────────────────────────────
  public readonly callState$: Observable<CallState> = this._callState$.asObservable();
  public readonly activeCall$: Observable<ActiveCall | null> = this._activeCall$.asObservable();
  public readonly muted$: Observable<boolean> = this._muted$.asObservable();
  public readonly cameraOff$: Observable<boolean> = this._cameraOff$.asObservable();
  public readonly screenSharing$: Observable<boolean> = this._screenSharing$.asObservable();
  public readonly unreadChatCount$: Observable<number> = this._unreadChatCount$.asObservable();
  public readonly chatMessages$: Observable<ChatMessage[]> = this._chatMessages$.asObservable();

  public readonly participantJoined$: Observable<any> = this._participantJoined$.asObservable();
  public readonly participantLeft$: Observable<any> = this._participantLeft$.asObservable();
  public readonly remoteTrackAdded$: Observable<{ participant: any; track: any }> = this._remoteTrackAdded$.asObservable();
  public readonly remoteTrackRemoved$: Observable<{ participant: any; track: any }> = this._remoteTrackRemoved$.asObservable();
  public readonly callEnded$: Observable<{ reason?: string }> = this._callEnded$.asObservable();
  public readonly error$: Observable<{ message: string; code?: string }> = this._error$.asObservable();

  // Convenience observables
  public readonly hasActiveCall$: Observable<boolean> = this._activeCall$.pipe(
    map(call => call !== null)
  );
  public readonly isMinimized$: Observable<boolean> = this._callState$.pipe(
    map(state => state === 'minimized')
  );
  public readonly isConnected$: Observable<boolean> = this._callState$.pipe(
    map(state => state === 'connected' || state === 'minimized')
  );

  constructor() {
    // Load Twilio SDK on service initialization if browser
    if (this.isBrowser) {
      this.preloadTwilioSDK();
    }
  }

  // ── SDK Loading ────────────────────────────────────────────────────────
  /**
   * Preload Twilio SDK module to reduce join latency
   */
  private async preloadTwilioSDK(): Promise<void> {
    if (this.twilioVideoModule) return;
    try {
      const twilioModule: any = await import('twilio-video');
      this.twilioVideoModule = twilioModule.default || twilioModule;
    } catch (err) {
      console.error('[PersistentVideoCall] Failed to preload Twilio SDK', err);
    }
  }

  /**
   * Get Twilio SDK, loading if necessary
   */
  private async getTwilioSDK(): Promise<any> {
    if (this.twilioVideoModule) return this.twilioVideoModule;
    await this.preloadTwilioSDK();
    return this.twilioVideoModule;
  }

  // ── Call Lifecycle ─────────────────────────────────────────────────────
  /**
   * Start a new video call with the given parameters.
   * Creates local media tracks and connects to the Twilio room.
   */
  async startCall(params: {
    appointmentId: string;
    roomName: string;
    token: string;
    identity: string;
    displayName: string;
    isDoctor?: boolean;
    fallbackMeetUrl?: string | null;
  }): Promise<void> {
    if (!this.isBrowser) {
      throw new Error('Video calls are only supported in the browser');
    }

    // Don't allow starting a new call if one is active
    if (this._activeCall$.value) {
      throw new Error('A call is already in progress. End the current call first.');
    }

    try {
      this._callState$.next('connecting');

      const twilioSDK = await this.getTwilioSDK();
      if (!twilioSDK) {
        throw new Error('Failed to load Twilio SDK');
      }

      // Create local audio and video tracks
      this.localTracks = await twilioSDK.createLocalTracks({
        audio: true,
        video: { width: 640, height: 480, frameRate: 24 },
      });

      // Create local data track for chat
      this.dataTrack = new twilioSDK.LocalDataTrack();

      // Connect to the room
      this.twilioRoom = await twilioSDK.connect(params.token, {
        name: params.roomName,
        tracks: [...this.localTracks, this.dataTrack],
        dominantSpeaker: true,
        maxAudioBitrate: 16000,
        preferredVideoCodecs: ['VP8', 'H264'],
        networkQuality: { local: 1, remote: 1 },
      });

      // Wire up event listeners
      this.wireRoomEvents();

      // Update state
      const activeCall: ActiveCall = {
        appointmentId: params.appointmentId,
        roomName: params.roomName,
        token: params.token,
        identity: params.identity,
        displayName: params.displayName,
        isDoctor: params.isDoctor || false,
        startedAt: new Date(),
        participantsCount: this.twilioRoom.participants.size + 1,
        fallbackMeetUrl: params.fallbackMeetUrl,
      };

      this._activeCall$.next(activeCall);
      this._callState$.next('connected');

      console.log('[PersistentVideoCall] Call started:', activeCall);
    } catch (err: any) {
      console.error('[PersistentVideoCall] Failed to start call', err);
      this._callState$.next('error');
      this._error$.next({
        message: err?.message || 'Failed to start video call',
        code: err?.code,
      });
      // Clean up any partial state
      await this.cleanup();
      throw err;
    }
  }

  /**
   * End the active call and clean up all resources
   */
  async endCall(reason?: string): Promise<void> {
    console.log('[PersistentVideoCall] Ending call:', reason);

    // Emit call ended event before cleanup
    this._callEnded$.next({ reason });

    await this.cleanup();

    this._callState$.next('idle');
    this._activeCall$.next(null);
    this._muted$.next(false);
    this._cameraOff$.next(false);
    this._screenSharing$.next(false);
    this._unreadChatCount$.next(0);
    this._chatMessages$.next([]);
  }

  /**
   * Clean up all Twilio resources without changing state observables
   */
  private async cleanup(): Promise<void> {
    // Stop screen sharing if active
    if (this.screenTrack) {
      try {
        this.screenTrack.stop();
        if (this.twilioRoom?.localParticipant) {
          await this.twilioRoom.localParticipant.unpublishTrack(this.screenTrack);
        }
      } catch (err) {
        console.error('[PersistentVideoCall] Error stopping screen track', err);
      }
      this.screenTrack = null;
    }

    // Stop data track
    if (this.dataTrack) {
      try {
        this.dataTrack.stop();
      } catch (err) {
        console.error('[PersistentVideoCall] Error stopping data track', err);
      }
      this.dataTrack = null;
    }

    // Stop and clean up local tracks
    for (const track of this.localTracks) {
      try {
        track.stop();
      } catch (err) {
        console.error('[PersistentVideoCall] Error stopping track', err);
      }
    }
    this.localTracks = [];

    // Disconnect from room
    if (this.twilioRoom) {
      try {
        this.twilioRoom.disconnect();
      } catch (err) {
        console.error('[PersistentVideoCall] Error disconnecting room', err);
      }
      this.twilioRoom = null;
    }
  }

  /**
   * Minimize the call (UI hint, does not affect call state)
   */
  minimize(): void {
    if (this._callState$.value === 'connected') {
      this._callState$.next('minimized');
    }
  }

  /**
   * Restore the call from minimized state
   */
  restore(): void {
    if (this._callState$.value === 'minimized') {
      this._callState$.next('connected');
    }
  }

  // ── Media Controls ─────────────────────────────────────────────────────
  /**
   * Toggle microphone mute/unmute
   */
  toggleMute(): boolean {
    const audioTrack = this.localTracks.find(t => t.kind === 'audio');
    if (!audioTrack) return false;

    if (audioTrack.isEnabled) {
      audioTrack.disable();
      this._muted$.next(true);
      return false;
    } else {
      audioTrack.enable();
      this._muted$.next(false);
      return true;
    }
  }

  /**
   * Toggle camera on/off
   */
  toggleCamera(): boolean {
    const videoTrack = this.localTracks.find(t => t.kind === 'video');
    if (!videoTrack) return false;

    if (videoTrack.isEnabled) {
      videoTrack.disable();
      this._cameraOff$.next(true);
      return false;
    } else {
      videoTrack.enable();
      this._cameraOff$.next(false);
      return true;
    }
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<void> {
    if (!this.isBrowser || !this.twilioRoom) {
      throw new Error('Cannot share screen: No active call');
    }

    if (this.screenTrack) {
      throw new Error('Screen sharing already active');
    }

    try {
      const twilioSDK = await this.getTwilioSDK();
      if (!twilioSDK) {
        throw new Error('Twilio SDK not loaded');
      }

      // Create screen track
      this.screenTrack = await twilioSDK.createLocalScreenTrack({
        height: 1080,
        width: 1920,
        frameRate: 15,
        logLevel: 'warn',
      });

      // Handle browser "Stop Sharing" button
      this.screenTrack.once('stopped', () => {
        console.log('[PersistentVideoCall] Screen share stopped by user');
        this.stopScreenShare().catch(err =>
          console.error('[PersistentVideoCall] Error cleaning up screen share', err)
        );
      });

      // Publish screen track
      await this.twilioRoom.localParticipant.publishTrack(this.screenTrack, {
        name: 'screen',
        priority: 'high',
      });

      this._screenSharing$.next(true);
      console.log('[PersistentVideoCall] Screen sharing started');
    } catch (err: any) {
      console.error('[PersistentVideoCall] Failed to start screen share', err);
      this.screenTrack = null;
      this._error$.next({
        message: err?.message || 'Failed to start screen sharing',
        code: err?.code || err?.name,
      });
      throw err;
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare(): Promise<void> {
    if (!this.screenTrack) return;

    try {
      // Unpublish track
      if (this.twilioRoom?.localParticipant) {
        await this.twilioRoom.localParticipant.unpublishTrack(this.screenTrack);
      }

      // Stop track
      this.screenTrack.stop();
      this.screenTrack = null;

      this._screenSharing$.next(false);
      console.log('[PersistentVideoCall] Screen sharing stopped');
    } catch (err) {
      console.error('[PersistentVideoCall] Error stopping screen share', err);
      throw err;
    }
  }

  // ── Track Management ───────────────────────────────────────────────────
  /**
   * Get the local video track for self-view rendering
   */
  getLocalVideoTrack(): any | null {
    return this.localTracks.find(t => t.kind === 'video') || null;
  }

  /**
   * Get the local audio track
   */
  getLocalAudioTrack(): any | null {
    return this.localTracks.find(t => t.kind === 'audio') || null;
  }

  /**
   * Get the local screen track if sharing
   */
  getScreenTrack(): any | null {
    return this.screenTrack;
  }

  /**
   * Get all remote participants
   */
  getRemoteParticipants(): any[] {
    if (!this.twilioRoom) return [];
    return Array.from(this.twilioRoom.participants.values());
  }

  /**
   * Get the Twilio Room instance (for advanced use cases)
   */
  getRoom(): any | null {
    return this.twilioRoom;
  }

  // ── Event Wiring ───────────────────────────────────────────────────────
  private wireRoomEvents(): void {
    if (!this.twilioRoom) return;

    // Handle existing participants
    this.twilioRoom.participants.forEach((participant: any) => {
      this._participantJoined$.next(participant);
      this.wireParticipantEvents(participant);
    });

    // Participant connected
    this.twilioRoom.on('participantConnected', (participant: any) => {
      console.log('[PersistentVideoCall] Participant connected:', participant.identity);
      this._participantJoined$.next(participant);
      this.wireParticipantEvents(participant);
      this.updateParticipantCount();
    });

    // Participant disconnected
    this.twilioRoom.on('participantDisconnected', (participant: any) => {
      console.log('[PersistentVideoCall] Participant disconnected:', participant.identity);
      this._participantLeft$.next(participant);
      this.updateParticipantCount();
    });

    // Room disconnected
    this.twilioRoom.on('disconnected', (room: any, error?: any) => {
      console.warn('[PersistentVideoCall] Room disconnected', error);
      const reason = error?.message || 'Connection lost';
      this.endCall(reason);
    });

    // Reconnecting
    this.twilioRoom.on('reconnecting', (error: any) => {
      console.warn('[PersistentVideoCall] Reconnecting...', error);
      this._callState$.next('reconnecting');
    });

    // Reconnected
    this.twilioRoom.on('reconnected', () => {
      console.log('[PersistentVideoCall] Reconnected');
      const currentState = this._callState$.value;
      if (currentState === 'reconnecting') {
        this._callState$.next(
          this._activeCall$.value?.participantsCount ? 'connected' : 'minimized'
        );
      }
    });
  }

  private wireParticipantEvents(participant: any): void {
    // Handle already-subscribed tracks
    participant.tracks.forEach((publication: any) => {
      if (publication.isSubscribed && publication.track) {
        this._remoteTrackAdded$.next({
          participant,
          track: publication.track,
        });

        // Handle data tracks for chat
        if (publication.track.kind === 'data') {
          this.wireDataTrackEvents(publication.track, participant);
        }
      }
    });

    // Track subscribed
    participant.on('trackSubscribed', (track: any) => {
      console.log('[PersistentVideoCall] Track subscribed:', track.kind, track.name);
      this._remoteTrackAdded$.next({ participant, track });

      // Handle data tracks for chat
      if (track.kind === 'data') {
        this.wireDataTrackEvents(track, participant);
      }
    });

    // Track unsubscribed
    participant.on('trackUnsubscribed', (track: any) => {
      console.log('[PersistentVideoCall] Track unsubscribed:', track.kind);
      this._remoteTrackRemoved$.next({ participant, track });
    });
  }

  /**
   * Wire up data track events for chat messages
   */
  private wireDataTrackEvents(track: any, participant: any): void {
    track.on('message', (data: string) => {
      this.handleIncomingChatMessage(data, participant);
    });
  }

  private updateParticipantCount(): void {
    if (!this.twilioRoom) return;
    const count = this.twilioRoom.participants.size + 1; // +1 for local participant
    const activeCall = this._activeCall$.value;
    if (activeCall) {
      this._activeCall$.next({ ...activeCall, participantsCount: count });
    }
  }

  // ── Chat Management ────────────────────────────────────────────────────
  /**
   * Send a chat message using Twilio Data Track
   */
  async sendChatMessage(message: string): Promise<void> {
    if (!this.twilioRoom || !this.dataTrack || !message.trim()) return;

    const activeCall = this._activeCall$.value;
    if (!activeCall) return;

    try {
      const chatMsg: ChatMessage = {
        id: `${Date.now()}-${Math.random()}`,
        sender: activeCall.identity,
        senderName: activeCall.displayName,
        message: message.trim(),
        timestamp: new Date(),
        isLocal: true,
      };

      // Add to local messages
      this._chatMessages$.next([...this._chatMessages$.value, chatMsg]);

      // Send via data track to all participants
      const dataMessage = JSON.stringify({
        type: 'chat',
        id: chatMsg.id,
        sender: chatMsg.sender,
        senderName: chatMsg.senderName,
        message: chatMsg.message,
        timestamp: chatMsg.timestamp.toISOString(),
      });

      this.dataTrack.send(dataMessage);

      console.log('[PersistentVideoCall] Chat message sent:', chatMsg.message);
    } catch (err) {
      console.error('[PersistentVideoCall] Failed to send chat message', err);
      this._error$.next({
        message: 'Failed to send message',
        code: 'CHAT_SEND_ERROR',
      });
    }
  }

  /**
   * Handle incoming chat message from remote participant
   */
  private handleIncomingChatMessage(data: any, participant: any): void {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (parsed.type !== 'chat') return;

      const chatMsg: ChatMessage = {
        id: parsed.id || `${Date.now()}-${Math.random()}`,
        sender: parsed.sender || participant.identity,
        senderName: parsed.senderName || participant.identity,
        message: parsed.message || '',
        timestamp: parsed.timestamp ? new Date(parsed.timestamp) : new Date(),
        isLocal: false,
        attachments: parsed.attachments?.map((a: any) => ({
          id: a.id,
          fileName: a.fileName,
          fileSize: a.fileSize,
          fileType: a.fileType,
          mimeType: a.mimeType,
          url: a.url,
          thumbnailUrl: a.thumbnailUrl,
        })),
      };

      // Add to messages
      this._chatMessages$.next([...this._chatMessages$.value, chatMsg]);

      // Increment unread count if chat is not open
      this._unreadChatCount$.next(this._unreadChatCount$.value + 1);

      console.log('[PersistentVideoCall] Chat message received:', chatMsg.message, chatMsg.attachments?.length || 0, 'attachments');
    } catch (err) {
      console.error('[PersistentVideoCall] Failed to parse chat message', err);
    }
  }

  /**
   * Reset unread chat count (when user opens chat)
   */
  resetUnreadChat(): void {
    this._unreadChatCount$.next(0);
  }

  /**
   * Get current chat messages
   */
  getChatMessages(): ChatMessage[] {
    return this._chatMessages$.value;
  }

  /**
   * Upload file for chat attachment
   * TODO: Replace mock upload with your actual backend API endpoint
   */
  async uploadChatFile(file: File): Promise<ChatAttachment> {
    const attachment: ChatAttachment = {
      id: `${Date.now()}-${Math.random()}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: this.getFileType(file),
      mimeType: file.type,
      uploading: true,
      uploadProgress: 0,
    };

    try {
      // TODO: Replace this with actual backend API call
      // Example:
      // const formData = new FormData();
      // formData.append('file', file);
      // formData.append('appointmentId', this._activeCall$.value?.appointmentId || '');
      // const response = await fetch('/api/v1/video-call/upload-attachment', {
      //   method: 'POST',
      //   body: formData,
      //   headers: { 'Authorization': `Bearer ${yourAuthToken}` }
      // });
      // const data = await response.json();
      // attachment.url = data.url;
      // attachment.thumbnailUrl = data.thumbnailUrl;

      // Mock upload for demonstration
      const uploadedUrl = await this.mockFileUpload(file, (progress) => {
        attachment.uploadProgress = progress;
      });

      attachment.url = uploadedUrl;
      attachment.uploading = false;
      attachment.uploadProgress = 100;

      console.log('[PersistentVideoCall] File uploaded:', attachment.fileName);
      return attachment;
    } catch (err: any) {
      console.error('[PersistentVideoCall] File upload failed', err);
      attachment.uploading = false;
      attachment.error = err?.message || 'Upload failed';
      throw err;
    }
  }

  /**
   * Determine file type from MIME type
   */
  private getFileType(file: File): 'image' | 'file' | 'document' {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('word')) return 'document';
    return 'file';
  }

  /**
   * Real file upload to backend (AWS S3)
   */
  private async mockFileUpload(file: File, onProgress: (progress: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('appointmentId', this._activeCall$.value?.appointmentId || 'unknown');
    formData.append('messageId', `${Date.now()}-${Math.random()}`);

    try {
      // Simulate progress updates
      onProgress(10);

      // Use Angular HttpClient - this will automatically add Authorization header via interceptor
      const response = await this.http.post<any>(
        `${environment.baseUrl}v1/video-call/upload-attachment`,
        formData
      ).toPromise();

      onProgress(100);

      // Return the S3 URL
      return response.result?.url || response.url;
    } catch (error: any) {
      console.error('[PersistentVideoCall] File upload failed:', error);
      throw new Error(error?.error?.message || error?.message || 'Failed to upload file to server');
    }
  }

  /**
   * Send chat message with optional attachments
   */
  async sendChatMessageWithAttachments(message: string, attachments?: ChatAttachment[]): Promise<void> {
    if (!this.twilioRoom || !this.dataTrack) return;
    if (!message.trim() && !attachments?.length) return;

    const activeCall = this._activeCall$.value;
    if (!activeCall) return;

    try {
      const chatMsg: ChatMessage = {
        id: `${Date.now()}-${Math.random()}`,
        sender: activeCall.identity,
        senderName: activeCall.displayName,
        message: message.trim(),
        timestamp: new Date(),
        isLocal: true,
        attachments: attachments,
      };

      // Add to local messages
      this._chatMessages$.next([...this._chatMessages$.value, chatMsg]);

      // Send via data track
      const dataMessage = JSON.stringify({
        type: 'chat',
        id: chatMsg.id,
        sender: chatMsg.sender,
        senderName: chatMsg.senderName,
        message: chatMsg.message,
        timestamp: chatMsg.timestamp.toISOString(),
        attachments: attachments?.map(a => ({
          id: a.id,
          fileName: a.fileName,
          fileSize: a.fileSize,
          fileType: a.fileType,
          mimeType: a.mimeType,
          url: a.url,
          thumbnailUrl: a.thumbnailUrl,
        })),
      });

      this.dataTrack.send(dataMessage);

      console.log('[PersistentVideoCall] Message with attachments sent');
    } catch (err) {
      console.error('[PersistentVideoCall] Failed to send message', err);
      this._error$.next({
        message: 'Failed to send message',
        code: 'CHAT_SEND_ERROR',
      });
    }
  }

  // ── State Getters ──────────────────────────────────────────────────────
  get isCallActive(): boolean {
    return this._activeCall$.value !== null;
  }

  get currentCallState(): CallState {
    return this._callState$.value;
  }

  get currentCall(): ActiveCall | null {
    return this._activeCall$.value;
  }

  get isMuted(): boolean {
    return this._muted$.value;
  }

  get isCameraOff(): boolean {
    return this._cameraOff$.value;
  }

  get isScreenSharing(): boolean {
    return this._screenSharing$.value;
  }
}
