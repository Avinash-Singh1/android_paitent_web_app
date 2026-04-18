// Start of Event Service code
import { Observable, Subject } from "rxjs";
import { Injectable } from "@angular/core";
import { filter, map } from "rxjs/operators";

// Used to store key value pairs
interface Event<T = unknown> {
  key: string;
  value: T;
}

@Injectable({
  providedIn: "root",
})
export class EventService {
  protected eventsSubject = new Subject<Event>();
  public count: number = 0;
  ignoreList: string[] = [];
  previousid: string | number | null = null;

  /*Method is responsible for Broadcast Event */
  public broadcastEvent<T = unknown>(key: string, value: T): void {
    this.eventsSubject.next({ key, value });
  }

  /* Method is responsible for Get Event*/
  public getEvent<T = unknown>(key: string): Observable<T> {
    return this.eventsSubject.asObservable().pipe(
      filter((e) => e.key === key),
      map((e) => e.value as T)
    );
  }
  checkList(url: string): boolean {
    const matched = this.ignoreList.filter((element) => url.includes(element));
    return matched.length > 0 ? false : true;
  }
}
