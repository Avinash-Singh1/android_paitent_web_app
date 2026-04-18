import { Injectable } from "@angular/core";
import { BehaviorSubject, filter, map } from "rxjs";
interface Event {
  key: string;
  value: any;
}
@Injectable({
  providedIn: "root",
})
export class BehvaiourEventService {
  protected eventsSubject = new BehaviorSubject<Event>({ key: "", value: "" });
  public count: number = 0;
  ignoreList: Array<any> = [];
  previousid: any;

  /*Method is responsible for Broadcast Event */
  public broadcastEvent(key: string, value: any): void {
    this.eventsSubject.next({ key, value });
  }

  /* Method is responsible for Get Event*/
  subscribeFilterData(key: any) {
    return this.eventsSubject.asObservable().pipe(
      filter((e) => e.key == key),
      map((e: any) => e.value)
    );
  }
}
