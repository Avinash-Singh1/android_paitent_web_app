import { Pipe, PipeTransform } from "@angular/core";
import { getTimeFromString } from "./timecompare.pipe";

@Pipe({
  standalone: false,
  name: "filterTimeSlot",
})
export class FilterTimeSlotPipe implements PipeTransform {
  transform(value: any[], day: string, slot: number): any[] {
    if (!value || (value && !value.length)) {
      return null;
    }
    const dayTiming = this.establishmentTiming?.[day];
    if (dayTiming?.length) {
      const slotTiming = dayTiming[slot];
      if (slotTiming?.from && slotTiming?.to) {
        const fromTime = getTimeFromString(slotTiming.from);
        const toTime = getTimeFromString(slotTiming.to);
        const result = value.filter((item) => {
          const time = getTimeFromString(item.name);
          if (time <= toTime && time >= fromTime) {
            return item;
          }
        });
        return result;
      } else {
        return null;
      }
    }
    return null;
  }
  establishmentTiming: Record<string, { slot: string; from: string | null; to: string | null; _id: string }[]> = {
    mon: [
      {
        slot: "morninng",
        from: "7:00 AM",
        to: "11:45 AM",
        _id: "6489c329a6b8f3a4e009e1f2",
      },
      {
        slot: "afternoon",
        from: null,
        to: null,
        _id: "6489c329a6b8f3a4e009e1f3",
      },
      {
        slot: "evening",
        from: null,
        to: null,
        _id: "6489c329a6b8f3a4e009e1f4",
      },
    ],
    wed: [
      {
        slot: "morning",
        from: "12:00 AM",
        to: "11:45 AM",
        _id: "648308f4b8fe2fe1c8f8f1b3",
      },
      {
        slot: "afternoon",
        from: "12:00 PM",
        to: "04:45 PM",
        _id: "648308f4b8fe2fe1c8f8f1b4",
      },
      {
        slot: "evening",
        from: "05:00 PM",
        to: "11:45 PM",
        _id: "648308f4b8fe2fe1c8f8f1b5",
      },
    ],

    fri: [
      {
        slot: "morning",
        from: "12:00 AM",
        to: "11:45 AM",
        _id: "648308f4b8fe2fe1c8f8f1ad",
      },
      {
        slot: "afternoon",
        from: "12:00 PM",
        to: "04:45 PM",
        _id: "648308f4b8fe2fe1c8f8f1ae",
      },
      {
        slot: "evening",
        from: "05:00 PM",
        to: "11:45 PM",
        _id: "648308f4b8fe2fe1c8f8f1af",
      },
    ],
    // sat: [
    //   {
    //     slot: "morning",
    //     from: "12:00 AM",
    //     to: "11:45 AM",
    //     _id: "648308f4b8fe2fe1c8f8f1aa",
    //   },
    //   {
    //     slot: "afternoon",
    //     from: "12:00 PM",
    //     to: "04:45 PM",
    //     _id: "648308f4b8fe2fe1c8f8f1ab",
    //   },
    //   {
    //     slot: "evening",
    //     from: "05:00 PM",
    //     to: "11:45 PM",
    //     _id: "648308f4b8fe2fe1c8f8f1ac",
    //   },
    // ],
    sun: [
      {
        slot: "morning",
        from: "12:00 AM",
        to: "11:45 AM",
        _id: "648308f4b8fe2fe1c8f8f1a7",
      },
      {
        slot: "afternoon",
        from: "12:00 PM",
        to: "04:45 PM",
        _id: "648308f4b8fe2fe1c8f8f1a8",
      },
      {
        slot: "evening",
        from: "05:00 PM",
        to: "11:45 PM",
        _id: "648308f4b8fe2fe1c8f8f1a9",
      },
    ],
  };
}
