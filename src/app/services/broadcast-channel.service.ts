
import { Inject, Injectable, inject, DOCUMENT, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from "@angular/router";
import { Observable, Subject, filter } from "rxjs";
interface BroadcastMessage {
  type: string;
  payload: any;
}
@Injectable({
  providedIn: "root",
})
export class BroadcastChannelService {
  private isBrowser: boolean;
  constructor(
    @Inject(DOCUMENT) public document: any,
  ) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  }
  private broadcastChannel: BroadcastChannel;
  private onMessage = new Subject<any>();
  private router = inject(Router);
  oBroadCast(channelName: string) {
    if (!this.isBrowser) return;
    this.broadcastChannel = new BroadcastChannel(channelName);
    this.broadcastChannel.onmessage = (message: any) => {
      const { type, payload } = message.data;
      if (type == "logout") {
        this.document.location.reload();
        return;
      }
      this.onMessage.next(message.data);
    };
  }
  publisMessage(message: BroadcastMessage) {
    this.broadcastChannel?.postMessage(message);
  }
  getMessage(type: string): Observable<BroadcastMessage> {
    return this.onMessage.pipe(filter((message) => message.type == type));
  }
}
