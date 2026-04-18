import { Injectable } from "@angular/core";
import { getTimeFromString } from "./helper.service";
import { environment } from "src/environments/environment";

interface TimeSlotEntry {
  day: string;
  morning: string;
  afternoon: string;
  evening: string;
  [key: string]: string;
}

@Injectable({
  providedIn: "root",
})
export class FormatTimeService {
  dateTimeConversion(data: any) {
    this.cleanUpEmptySlots(data);
    // let obj = {day: '', 1: , 2: ,3: };
    let modifiedArray: any = [];
    let arr = this.createObj(data);

    for (let i = 0; i < arr.length; i++) {
      if (arr.length == 0) {
        modifiedArray.push(arr[0]);
      } else {
        let j = 0;
        for (j; j < modifiedArray.length; j++) {
          if (
            modifiedArray[j]?.morning == arr[i]?.morning &&
            modifiedArray[j]?.afternoon == arr[i]?.afternoon &&
            modifiedArray[j]?.evening == arr[i]?.evening
          ) {
            modifiedArray[j].day = modifiedArray[j].day + " , " + arr[i].day;
            break;
          }
        }
        if (j == modifiedArray.length) {
          modifiedArray.push(arr[i]);
        }
      }
    }
    modifiedArray.forEach((x: TimeSlotEntry) => {
      this.matchDays(x);
    });
    return modifiedArray;
  }

  // Remove keys with empty or null values
  cleanUpEmptySlots(data: any) {
    for (const key in data) {
      if (!data[key] || !data[key].length) {
        delete data[key];
      }
    }
  }

  // creating object have day , morning time , eve time and noon time
  createObj(data: any) {
    let arr: TimeSlotEntry[] = [];
    Object.keys(data).forEach((x) => {
      let obj: TimeSlotEntry = { day: x, morning: "", afternoon: "", evening: "" };
      for (let i = 0; i < data[x]?.length; i++) {
        const from = data[x][i]?.from;
        const to = data[x][i]?.to;
        const slotType = this.getSlotTypeByTime(from);
        const timeStr = from + " to " + to;
        if (obj[slotType]) {
          obj[slotType] += ", " + timeStr;
        } else {
          obj[slotType] = timeStr;
        }
      }
      arr.push(obj);
    });
    return arr;
  }

  // Determine slot type (morning/afternoon/evening) based on actual start time
  private getSlotTypeByTime(timeStr: string): string {
    if (!timeStr) return 'morning';
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 'morning';
    let hours = parseInt(match[1]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    if (hours < 12) return 'morning';
    if (hours < 17) return 'afternoon';
    return 'evening';
  }

  // matching days => days having similar timing and concat them using ','

  matchDays(data: any) {
    const { morning, afternoon, evening } = data;
    if (afternoon && (afternoon || evening)) {
      const morningStartTime = morning.split("to")?.[0]?.trim();
      const morningEndTime = morning.split("to")?.[1]?.trim();
      const afternoonStartTime = afternoon.split("to")?.[0]?.trim();
      let afternoonEndTime = afternoon.split("to")?.[1]?.trim();
      const eveningStartTime = evening.split("to")?.[0]?.trim();
      const eveningEndTime = evening.split("to")?.[1]?.trim();
      // merging the afternoon and evening slot
      if (
        eveningStartTime &&
        afternoonEndTime &&
        getTimeFromString(eveningStartTime) -
          getTimeFromString(afternoonEndTime) ==
          environment.DOCTOR_SLOT_TIME
      ) {
        data.afternoon = afternoonStartTime + " to " + eveningEndTime;
        afternoonEndTime = eveningEndTime;
        delete data.evening;
      }
      // merging the morning and afternoon slot
      if (
        afternoonStartTime &&
        morningEndTime &&
        getTimeFromString(afternoonStartTime) -
          getTimeFromString(morningEndTime) ==
          environment.DOCTOR_SLOT_TIME
      ) {
        data.morning = morningStartTime + " to " + afternoonEndTime;
        delete data.afternoon;
      }
    }
    let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    let incoming = data?.day.split(" , ");
    if (incoming.length == 1 || incoming.length == 2) {
      return;
    } else {
      let index1 = days.indexOf(incoming[0]);
      let index2 = days.indexOf(incoming[incoming.length - 1]);
      if (index2 - index1 + 1 == incoming.length) {
        data.day = incoming[0] + " To " + incoming[incoming.length - 1];
      } else {
        return;
      }
    }
  }

  convertTo24HourFormat(startTime: string, endTime: string) {
    function convertTimeTo24HourFormat(time: string) {
      let [hh, mm, period] = time.split(/:| /);
      let hours = parseInt(hh);
      let minutes = parseInt(mm);

      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }

      return hours.toString().padStart(2, "0") + ":" + mm;
    }

    return (
      convertTimeTo24HourFormat(startTime) +
      "-" +
      convertTimeTo24HourFormat(endTime)
    );
  }
}
