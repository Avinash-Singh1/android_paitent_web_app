import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  PersistentVideoCallService,
  CallState,
  ActiveCall,
  ChatMessage,
  ChatAttachment,
} from 'src/app/services/persistent-video-call.service';

/**
 * Floating video call component that survives route navigation.
 * 
 * This component is placed at the application root level (outside router-outlet)
 * and provides a minimizable/restorable video call interface.
 * 
 * Features:
 *  - Minimized mode: Small floating window in corner
 *  - Maximized mode: Full-screen overlay with controls
 *  - Survives Angular route changes
 *  - Mute/unmute, camera on/off, screen sharing
 *  - In-call chat with unread badge
 */
@Component({
  standalone: false,
  selector: 'nectar-floating-video-call',
  templateUrl: './floating-video-call.component.html',
  styleUrls: ['./floating-video-call.component.scss'],
})
export class FloatingVideoCallComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('selfVideo', { static: false })
  selfVideoRef!: ElementRef<HTMLDivElement>;
  
  @ViewChild('remoteVideos', { static: false })
  remoteVideosRef!: ElementRef<HTMLDivElement>;

  @ViewChild('screenShareVideo', { static: false })
  screenShareVideoRef?: ElementRef<HTMLDivElement>;

  // State from service
  callState: CallState = 'idle';
  activeCall: ActiveCall | null = null;
  muted = false;
  cameraOff = false;
  screenSharing = false;
  unreadChatCount = 0;
  isMinimized = false;
  participantsCount = 0;

  // UI state
  showChat = false;
  reconnecting = false;
  chatMessages: ChatMessage[] = [];
  chatInput = '';
  uploadingFiles: ChatAttachment[] = [];

  private readonly subs: Subscription[] = [];
  private readonly attachedElements = new Map<string, HTMLElement[]>();

  constructor(
    private readonly videoService: PersistentVideoCallService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to all service state
    this.subs.push(
      this.videoService.callState$.subscribe(state => {
        this.callState = state;
        this.reconnecting = state === 'reconnecting';
        this.isMinimized = state === 'minimized';
        this.cdr.detectChanges();
      }),

      this.videoService.activeCall$.subscribe(call => {
        this.activeCall = call;
        this.participantsCount = call?.participantsCount || 0;
        this.cdr.detectChanges();
      }),

      this.videoService.muted$.subscribe(muted => {
        this.muted = muted;
        this.cdr.detectChanges();
      }),

      this.videoService.cameraOff$.subscribe(off => {
        this.cameraOff = off;
        this.cdr.detectChanges();
      }),

      this.videoService.screenSharing$.subscribe(sharing => {
        this.screenSharing = sharing;
        this.cdr.detectChanges();
      }),

      this.videoService.unreadChatCount$.subscribe(count => {
        this.unreadChatCount = count;
        this.cdr.detectChanges();
      }),

      this.videoService.chatMessages$.subscribe(messages => {
        this.chatMessages = messages;
        this.cdr.detectChanges();
        // Auto-scroll chat to bottom
        setTimeout(() => this.scrollChatToBottom(), 100);
      }),

      // Handle remote participants
      this.videoService.participantJoined$.subscribe(() => {
        this.cdr.detectChanges();
      }),

      this.videoService.participantLeft$.subscribe(participant => {
        this.detachParticipant(participant);
        this.cdr.detectChanges();
      }),

      // Handle remote tracks
      this.videoService.remoteTrackAdded$.subscribe(({ participant, track }) => {
        this.attachRemoteTrack(participant, track);
      }),

      this.videoService.remoteTrackRemoved$.subscribe(({ participant, track }) => {
        this.detachRemoteTrack(track);
      }),

      // Handle call end
      this.videoService.callEnded$.subscribe(({ reason }) => {
        console.log('[FloatingVideoCall] Call ended:', reason);
        this.cleanup();
        this.cdr.detectChanges();
      }),

      // Handle errors
      this.videoService.error$.subscribe(({ message, code }) => {
        console.error('[FloatingVideoCall] Error:', message, code);
        // TODO: Show toast notification
      })
    );
  }

  ngAfterViewInit(): void {
    // Initial attachment of local video if call is already active
    if (this.activeCall && this.selfVideoRef) {
      setTimeout(() => this.attachLocalVideo(), 100);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.cleanup();
  }

  // ── Video Attachment ───────────────────────────────────────────────────
  private attachLocalVideo(): void {
    if (!this.selfVideoRef) return;

    const videoTrack = this.videoService.getLocalVideoTrack();
    if (!videoTrack) {
      console.warn('[FloatingVideoCall] No local video track available');
      return;
    }

    try {
      const videoElement = videoTrack.attach();
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
      videoElement.style.transform = 'scaleX(-1)'; // Mirror effect
      
      // Clear existing and append
      this.selfVideoRef.nativeElement.innerHTML = '';
      this.selfVideoRef.nativeElement.appendChild(videoElement);
      
      console.log('[FloatingVideoCall] Local video attached');
    } catch (err) {
      console.error('[FloatingVideoCall] Failed to attach local video', err);
    }
  }

  private attachRemoteTrack(participant: any, track: any): void {
    if (track.kind === 'data') return; // Skip data tracks

    const participantId = participant.sid || participant.identity;

    // Handle screen share separately
    if (track.name === 'screen') {
      this.attachScreenShare(track);
      return;
    }

    if (!this.remoteVideosRef) {
      console.warn('[FloatingVideoCall] Remote videos container not ready');
      return;
    }

    try {
      const element = track.attach();
      element.classList.add('fvc__remote-media');
      
      if (track.kind === 'video') {
        element.style.width = '100%';
        element.style.height = '100%';
        element.style.objectFit = 'cover';
      }

      this.remoteVideosRef.nativeElement.appendChild(element);

      // Track attached elements for cleanup
      const existing = this.attachedElements.get(participantId) || [];
      existing.push(element);
      this.attachedElements.set(participantId, existing);

      console.log('[FloatingVideoCall] Remote track attached:', track.kind, participantId);
    } catch (err) {
      console.error('[FloatingVideoCall] Failed to attach remote track', err);
    }
  }

  private attachScreenShare(track: any): void {
    if (!this.screenShareVideoRef) return;

    try {
      const element = track.attach();
      element.style.width = '100%';
      element.style.height = '100%';
      element.style.objectFit = 'contain';
      
      this.screenShareVideoRef.nativeElement.innerHTML = '';
      this.screenShareVideoRef.nativeElement.appendChild(element);
      
      console.log('[FloatingVideoCall] Screen share attached');
    } catch (err) {
      console.error('[FloatingVideoCall] Failed to attach screen share', err);
    }
  }

  private detachRemoteTrack(track: any): void {
    try {
      const elements = track.detach();
      elements.forEach((el: HTMLElement) => el.remove());
    } catch (err) {
      console.error('[FloatingVideoCall] Failed to detach remote track', err);
    }
  }

  private detachParticipant(participant: any): void {
    const participantId = participant.sid || participant.identity;
    const elements = this.attachedElements.get(participantId) || [];
    
    elements.forEach(el => {
      try {
        el.remove();
      } catch (err) {
        console.error('[FloatingVideoCall] Failed to remove element', err);
      }
    });

    this.attachedElements.delete(participantId);
  }

  private cleanup(): void {
    // Clear self video
    if (this.selfVideoRef) {
      this.selfVideoRef.nativeElement.innerHTML = '';
    }

    // Clear remote videos
    if (this.remoteVideosRef) {
      this.remoteVideosRef.nativeElement.innerHTML = '';
    }

    // Clear screen share
    if (this.screenShareVideoRef) {
      this.screenShareVideoRef.nativeElement.innerHTML = '';
    }

    // Clear tracked elements
    this.attachedElements.clear();

    // Reset UI state
    this.showChat = false;
  }

  // ── UI Actions ─────────────────────────────────────────────────────────
  minimize(): void {
    this.videoService.minimize();
    this.showChat = false;
  }

  restore(): void {
    this.videoService.restore();
  }

  toggleMute(): void {
    this.videoService.toggleMute();
  }

  toggleCamera(): void {
    this.videoService.toggleCamera();
    
    // Reattach local video after toggle
    setTimeout(() => {
      if (!this.cameraOff && this.selfVideoRef) {
        this.attachLocalVideo();
      }
    }, 100);
  }

  async toggleScreenShare(): Promise<void> {
    try {
      if (this.screenSharing) {
        await this.videoService.stopScreenShare();
      } else {
        await this.videoService.startScreenShare();
      }
    } catch (err: any) {
      console.error('[FloatingVideoCall] Screen share toggle failed', err);
      // TODO: Show error toast
    }
  }

  toggleChat(): void {
    this.showChat = !this.showChat;
    if (this.showChat) {
      this.videoService.resetUnreadChat();
      setTimeout(() => this.scrollChatToBottom(), 100);
    }
  }

  sendChatMessage(): void {
    if (!this.chatInput.trim() && this.uploadingFiles.length === 0) return;

    // Check if any files are still uploading
    const uploading = this.uploadingFiles.filter(f => f.uploading);
    if (uploading.length > 0) {
      // TODO: Show toast notification
      console.warn('Please wait for files to finish uploading');
      return;
    }

    // Check for upload errors
    const errors = this.uploadingFiles.filter(f => f.error);
    if (errors.length > 0) {
      // TODO: Show toast notification
      console.warn('Some files failed to upload');
      return;
    }

    // Send message with attachments
    if (this.uploadingFiles.length > 0) {
      this.videoService.sendChatMessageWithAttachments(this.chatInput.trim(), this.uploadingFiles);
    } else {
      this.videoService.sendChatMessage(this.chatInput.trim());
    }

    this.chatInput = '';
    this.uploadingFiles = [];
  }

  onChatKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendChatMessage();
    }
  }

  /**
   * Handle file selection from input
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    await this.handleFiles(files);

    // Reset input
    input.value = '';
  }

  /**
   * Process and upload files
   */
  async handleFiles(files: File[]): Promise<void> {
    // Validate files
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    for (const file of files) {
      // Validate size
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }

      // Validate type (allow all image types + specific document types)
      if (!file.type.startsWith('image/') && !allowedTypes.includes(file.type)) {
        alert(`File type "${file.type}" is not supported.`);
        continue;
      }

      // Upload file
      try {
        const attachment = await this.videoService.uploadChatFile(file);
        this.uploadingFiles.push(attachment);
        this.cdr.detectChanges();
      } catch (err) {
        console.error('File upload failed:', err);
        // File is already added with error state
      }
    }
  }

  /**
   * Remove file from selection
   */
  removeFile(attachment: ChatAttachment): void {
    const index = this.uploadingFiles.indexOf(attachment);
    if (index > -1) {
      this.uploadingFiles.splice(index, 1);
    }
  }

  /**
   * Download or view attachment
   */
  downloadAttachment(attachment: ChatAttachment): void {
    if (!attachment.url) return;

    // For images, open in new tab
    if (attachment.fileType === 'image') {
      window.open(attachment.url, '_blank');
    } else {
      // For files, trigger download
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.fileName;
      link.target = '_blank';
      link.click();
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  private scrollChatToBottom(): void {
    // Scroll chat messages to bottom (implement with ViewChild if needed)
    const chatContainer = document.querySelector('.fvc__chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  async endCall(): Promise<void> {
    // TODO: Show confirmation dialog
    const confirmed = confirm('Are you sure you want to end this video consultation?');
    if (!confirmed) return;

    try {
      await this.videoService.endCall('User ended call');
    } catch (err) {
      console.error('[FloatingVideoCall] Failed to end call', err);
    }
  }

  // ── Computed Properties ────────────────────────────────────────────────
  get isCallActive(): boolean {
    return this.callState !== 'idle';
  }

  get showMinimizedView(): boolean {
    return this.isCallActive && this.isMinimized;
  }

  get showMaximizedView(): boolean {
    return this.isCallActive && !this.isMinimized;
  }

  get callDuration(): string {
    if (!this.activeCall?.startedAt) return '00:00';
    
    const elapsed = Date.now() - this.activeCall.startedAt.getTime();
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  }

  get connectionStatus(): string {
    if (this.reconnecting) return 'Reconnecting...';
    if (this.participantsCount <= 1) return 'Waiting for other participant...';
    return `${this.participantsCount} in call`;
  }
}
