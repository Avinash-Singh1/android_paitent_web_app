import moment from 'moment';
export function generateMonthTable(firstDayOfMonth: Date) {
  const weeks = [];
  const daysInMonth = moment(firstDayOfMonth).daysInMonth();
  const firstDayOfWeek = firstDayOfMonth.getDay();
  let dayCount = 1;
  const startOfMonth = moment().startOf("month");
  const endOfMonth = moment().endOf("month");

  const diffInDays = endOfMonth.diff(startOfMonth, "days");
  const weekCount = Math.ceil(diffInDays / 7);

  // Generate weeks of the month
  for (let i = 0; i < weekCount; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDayOfWeek) {
        // Days from previous month
        const prevMonthDate = moment(firstDayOfMonth)
          .add(-1, "M")
          .date(daysInMonth - firstDayOfWeek + j)
          .toDate();
        week.push({
          date: prevMonthDate,
          prevMonth: true,
          details: [],
        });
      } else if (dayCount > daysInMonth) {
        // Days from next month
        const nextMonthDate = moment(firstDayOfMonth)
          .add(1, "M")
          .date(dayCount - daysInMonth)
          .toDate();
        week.push({
          date: nextMonthDate,
          nextMonth: true,
          details: [],
        });
        dayCount++;
      } else {
        // Days from current month
        week.push({
          date: moment(firstDayOfMonth).date(dayCount).toDate(),
          appointments: 0,
          details: [],
        });
        dayCount++;
      }
    }
    weeks.push(week);
  }
  return weeks;
}
export function getAddressKeys(
  address_components: google.maps.GeocoderAddressComponent[],
  stateList: any[],
  i: number = 1
) {
  const address: any = {
    landmark: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
  };
  const streetArray = [
    "sublocality_level_3",
    "premise",
    "plus_code",
    "route",
    "neighborhood",
    "street_number",
    "subpremise",
  ];
  const landMarkArray = [
    "landmark",
    "sublocality",
    "sublocality_level_1",
    "sublocality_level_2",
  ];
  for (const component of address_components) {
    if (streetArray.some((i) => component.types.includes(i)) && i <= 1) {
      address.landmark += component.long_name + ", ";
      continue;
    }
    if (landMarkArray.some((i) => component.types.includes(i)) && i <= 1) {
      address.locality += component.long_name + ", ";
      continue;
    }
    const componentType = component.types[0];
    switch (true) {
      case componentType == "locality" ||
        componentType == "administrative_area_level_3":
        if (!address.city) {
          address.city = component.long_name;
        }
        break;
      case componentType == "postal_code": {
        address.pincode = component.long_name;
        break;
      }
      case componentType == "administrative_area_level_1": {
        address.state =
          stateList.find(
            (state) =>
              state.name.toLowerCase() == component.long_name.toLowerCase()
          )?._id ?? null;
        break;
      }
      case componentType == "country":
        address.country = component.long_name;
        break;
    }
  }
  return {
    ...address,
    landmark: address.landmark.replace(/,(?=[^,]*$)/, "").trim(),
    locality: address.locality.replace(/,(?=[^,]*$)/, "").trim(),
  };
}
export function prepareSlot(originalData: any, day: string) {
  return Array("morning", "afternoon", "evening").map((slot) => {
    return originalData?.[day].find((item: any) => item.slot == slot) ?? {};
  });
}
export function prepareDayTiming(originalData: any) {
  const { mon, tue, wed, thu, fri, sat, sun } = originalData;
  return {
    mon: mon?.length ? prepareSlot(originalData, "mon") : [],
    tue: tue?.length ? prepareSlot(originalData, "tue") : [],
    wed: wed?.length ? prepareSlot(originalData, "wed") : [],
    thu: thu?.length ? prepareSlot(originalData, "thu") : [],
    fri: fri?.length ? prepareSlot(originalData, "fri") : [],
    sat: sat?.length ? prepareSlot(originalData, "sat") : [],
    sun: sun?.length ? prepareSlot(originalData, "sun") : [],
  };
}
