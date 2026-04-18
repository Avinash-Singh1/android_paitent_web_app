import { Component, Inject, OnInit, DOCUMENT } from "@angular/core";
import { EventService } from "src/app/services/event.service";
import Chart from "chart.js/auto";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import moment from 'moment';
import { debounceTime } from "rxjs";
import { ngxCsv } from "ngx-csv/ngx-csv";
import { FormatarrayPipe } from "src/app/shared/pipes/formatarray.pipe";
import { ToastrService } from "ngx-toastr";
import ChartDataLabels from "chartjs-plugin-datalabels";


@Component({
  standalone: false,
  selector: "nectar-main-hospital-dashboard",
  templateUrl: "./main-hospital-dashboard.component.html",
  styleUrls: ["./main-hospital-dashboard.component.scss"],
  providers: [FormatarrayPipe],
})
export class MainHospitalDashboardComponent implements OnInit {
  constructor(
    private eventService: EventService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private formatArray: FormatarrayPipe,
    private toastr: ToastrService,
    @Inject(DOCUMENT) private _document: Document
  ) { }
  count: any = {};
  appointmentList = [];
  totalItems: number = 0;
  upcoming: boolean = false;
  filterForm: FormGroup;
  apppontemtnList: any = [];
  BOOKING_STATUS = {
    0: "Pending",
    1: "Completed",
    2: "Pending",
    "-1": "Cancelled",
    "-2": "Rescheduled",
  };
  statusArray = [
    { label: "Complete", value: 1 },
    { label: "Cancel", value: -1 },
  ];
  payload: any = {
    page: 1,
    size: 5,
  };
  filterByDate = {
    1: {
      fromDate: moment().startOf("M").toISOString(),
      toDate: moment().endOf("M").toISOString(),
    },
    2: {
      fromDate: moment().subtract(3, "M").toISOString(),
      toDate: moment(moment().endOf("month")).toISOString(),
    },
    3: {
      fromDate: moment().subtract(6, "M").toISOString(),
      toDate: moment(moment().endOf("month")).toISOString(),
    },
    4: {
      fromDate: moment().subtract(1, "year").toISOString(),
      toDate: moment(moment().endOf("month")).toISOString(),
    },
  };
  dateFilter: number = 1;
  masterSpecialityList = [];
  specialisationList: any = [];
  specialityFilterOpen: boolean = false;
  specialisationForm: FormGroup;
  masterdoctorList: any = [];
  doctoryFilterOpen: boolean = false;
  doctorForm: FormGroup;
  specialisationPieChart: any;
  doctorStackedChart: any;
  doctorList: any = [];
  doctorAppointments: any = [];
  doctorDateFilter: number = 1;
  doctorDateFilterObj = {
    1: {
      labels: this.generateWeekLabel(),
    },
    2: {
      labels: this.generateMonthLabel(3),
    },
    3: {
      labels: this.generateMonthLabel(6),
    },
    4: {
      labels: this.generateMonthLabel(12),
    },
  };
  appointmentListForm: FormGroup;
  appointmentFilterSaved: boolean = false;
  searchValueChanged: boolean = false;
  generateMonthLabel(length: number) {
    return Array(length)
      .fill(1)
      .map((e: any, i: number) => {
        return {
          label: moment()
            .subtract(i, "M")
            .toDate()
            .toLocaleDateString("default", { month: "short" }),
          id: moment().subtract(i, "M").get("month") + 1,
        };
      })
      .reverse();
  }
  generateWeekLabel() {
    const startOfMonth = moment().startOf("month");
    const endOfMonth = moment().endOf("month");

    const diffInDays = endOfMonth.diff(startOfMonth, "days");
    const diffInWeeks = Math.ceil(diffInDays / 7);

    // const diff =
    //   moment().endOf("month").weeks() - moment().startOf("month").weeks();

    return Array(diffInWeeks)
      .fill(1)
      .map((e: any, i: number) => {
        return {
          label: `Week${i + 1}`,
          id: moment().startOf("month").add(i, "week").week(),
        };
      });
  }
  ngOnInit(): void {
    this.validateForm();
    this.getAppointmentCount();
    this.getListing();
    this.getSpecialityGraphData();
    this.onSpecialisationValueChanges();
    this.onDoctorValueChanges();
    this.getPatientAppointmentList();
    this.onSearchAppointment();
    this.getAppointmentBarChartData();
  }
  validateForm() {
    this.specialisationForm = this.fb.group({
      all: [true],
      specialization: this.fb.array([]),
    });
    this.doctorForm = this.fb.group({
      all: [true],
      doctors: this.fb.array([]),
      groupByWeek: [true],
      dateFilter: [1],
    });
    this.appointmentListForm = this.fb.group({
      typeOfList: [1],
      search: [""],
      fromDate: [],
      toDate: [],
      doctorId: [],
      status: [],
      page: [1],
      size: [10],
    });
  }
  get specialisationFormArray() {
    return this.specialisationForm.controls["specialization"] as FormArray;
  }
  get doctorFormArray() {
    return this.doctorForm.controls["doctors"] as FormArray;
  }
  get appointmentListControl() {
    return this.appointmentListForm.controls;
  }
  get doctorFormControl() {
    return this.doctorForm.controls;
  }
  changingView(typeOfList: number) {
    this.appointmentListForm.patchValue(
      {
        typeOfList,
        page: 1,
        search: "",
        fromDate: "",
        toDate: "",
        doctorId: "",
        status: "",
      },
      { emitEvent: false }
    );
    this.getPatientAppointmentList();
  }
  onChangeStatus(status: number, appointmentId: string, date: string) {
    const appointmentDate = new Date(date);
    const today = new Date();

    if (appointmentDate > today && status == 1) {
      return;
    } else {
      this.apiService
        .putParams(
          API_ENDPOINTS.hospital.changeAppointmentStatus,
          { status },
          { appointmentId }
        )
        .subscribe({
          next: (res: any) => {
            this.getPatientAppointmentList();
          },
          error: (error: any) => {
          },
        });
    }
  }
  onSearchAppointment() {
    this.appointmentListControl["search"].valueChanges
      .pipe(debounceTime(200))
      .subscribe((res: any) => {
        this.getPatientAppointmentList();
      });
  }
  onSpecialisationValueChanges() {
    this.specialisationFormArray.valueChanges.subscribe((res: any) => {
      const selectedBox = this.specialisationFormArray.value.filter(
        (id: any) => id
      );
      if (selectedBox?.length != this.masterSpecialityList?.length) {
        this.specialisationForm.patchValue({ all: false });
        return;
      }
      this.specialisationForm.patchValue({ all: true });
      this.specialityFilterOpen = false;
    });
  }
  onDoctorValueChanges() {
    this.doctorFormArray.valueChanges.subscribe((res: any) => {
      const selectedBox = this.doctorFormArray.value.filter((id: any) => id);
      if (selectedBox?.length != this.masterdoctorList?.length) {
        this.doctorForm.patchValue({ all: false });
        return;
      }
      this.doctorForm.patchValue({ all: true });
      this.doctoryFilterOpen = false;
    });
  }
  onChangeSpecialityFilter() {
    this.getSpecialityGraphData();
  }
  openSidenav() {
    this.eventService.broadcastEvent("sidenav", true);
  }
  generatePieChart(list: any[]) {
    if (this.specialisationPieChart) {
      this.specialisationPieChart.destroy();
    }
    const canvas = <HTMLCanvasElement>(
      this._document.getElementById("appointmentSpeciality")
    );
    const ctx = canvas.getContext("2d");
    const data = {
      datasets: [
        {
          data: list.map((item: any) => {
            return item.count;
          }),
          label: "Appointments",
        },
      ],
      labels: list.map((item: any) => {
        return item.name.length > 10
          ? item.name.slice(0, 10) + "..."
          : item?.name;
      }),
    };
    this.specialisationPieChart = new Chart(ctx, {
      type: "pie",
      data: data,
      plugins: [ChartDataLabels],
      options: {
        plugins: {
          legend: {
            display: true,
            position: "right",
            align: "center",
            onClick: null,
            labels: {
              padding: 24,
              font: {
                size: 14,
              },
              usePointStyle: true,
            },
          },
          tooltip: {
            displayColors: false,
            callbacks: {
              label: function (context) {
                let arr = [];
                let value: number = +context.dataset.data[context.dataIndex];
                arr.push(
                  "Appointment Count" +
                  ": " +
                  context.dataset.data[context?.dataIndex]
                );
                const dataset = context.chart.data.datasets[0].data;
                const totalValue: any = dataset.reduce(
                  (prev: number, curr: number) => {
                    return prev + curr;
                  },
                  0
                );

                const percentage = ((value / totalValue) * 100).toFixed(1);
                arr.push("Appointment Percent" + ": " + percentage + "%");
                return arr;
              },
            },
          },
          datalabels: {
            color: "black",
            formatter(value, context) {
              // const dataset = context.chart.data.datasets[0].data;
              // const totalValue: any = dataset.reduce(
              //   (prev: number, curr: number) => {
              //     return prev + curr;
              //   },
              //   0
              // );
              // const percentage = ((value / totalValue) * 100).toFixed(1);
              return ``;
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          arc: {
            borderWidth: 0,
          },
        },

        onClick: (e) => { },
      },
    });
  }
  generateStackedBarChart(list: any[]) {
    if (this.doctorStackedChart) {
      this.doctorStackedChart.destroy();
    }
    const canvas = <HTMLCanvasElement>(
      this._document.getElementById("appointmentByDoctor")
    );
    const ctx = canvas.getContext("2d");
    const data = {
      datasets: list.map((item: any) => {
        return {
          data: item.labelCount.map((e: any) => {
            return e.count;
          }),
          label: item.doctorName,
        };
      }),
      labels: this.doctorDateFilterObj[
        this.doctorFormControl["dateFilter"].value
      ].labels.map((label: any) => label.label),
    };
    this.doctorStackedChart = new Chart(ctx, {
      type: "bar",
      data: data,
      options: {
        plugins: {
          legend: {
            display: false,
            position: "bottom",
            align: "end",
            labels: {
              font: {
                // size: 18,
              },
              usePointStyle: true,
            },
          },
          tooltip: {
            mode: "index",
            backgroundColor: "white",
            bodyColor: "black",
            titleColor: "black",
            caretSize: 0,
            usePointStyle: true,
            // titleMarginBottom: 8,
            borderColor: "rgba(0,0,0,0.3)",
            filter(e: any, index, array, data) {
              return e.raw > 0 ? true : false;
            },
            borderWidth: 1,
            callbacks: {
              // label(tooltipItem) {
              //   if (tooltipItem.datasetIndex > 0) {
              //     return null;
              //   }
              //   var tasks = data.datasets[tooltipItem.datasetIndex].label;
              //   var valor =
              //     data.datasets[tooltipItem.datasetIndex].data[
              //       tooltipItem.dataIndex
              //     ];
              //   var count = data.datasets.length;
              //   var total = 0;
              //   var label = "";
              //   for (var i = 0; i < data.datasets.length; i++) {
              //     total += data.datasets[i].data[tooltipItem.dataIndex];
              //   }
              //   label += "Total : " + total + " (";
              //   for (var i = 0; i < data.datasets.length; i++) {
              //     if (label.endsWith(",")) {
              //       label += " ";
              //     }
              //     label +=
              //       data.datasets[i].label +
              //       " - $" +
              //       data.datasets[i].data[tooltipItem.dataIndex]
              //         .toFixed(2)
              //         .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
              //       ",";
              //   }
              //   label = label.slice(0, -1) + ")";
              //   return [label, "Count : " + count];
              // },
              // footer: (tooltipItems) => {
              //   let sum = 0;
              //   tooltipItems.forEach(function (tooltipItem) {
              //     sum += tooltipItem.parsed.y;
              //   });
              //   return "Sum: " + sum;
              // },
            },
          },
        },

        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            border: {
              width: 0,
            },
            grid: {
              display: false,
            },
          },
          y: {
            stacked: true,
            display: false,
            ticks: {
              display: true,
              stepSize: 10,
              // maxTicksLimit: 100,
            },
            grid: {
              display: false,
            },
          },
        },
        onClick: (e) => { },
      },
    });
  }

  onChangeDateFilter(value: number) {
    this.dateFilter = value;
    this.getSpecialityGraphData();
  }
  onChangeDoctorDateFilter(value: number) {
    this.doctorFormControl["dateFilter"].setValue(value);
    this.doctorForm.patchValue({
      dateFilter: value,
      groupByWeek: value == 1,
    });

    this.getAppointmentBarChartData();
  }
  onFiltering() {
    this.appointmentFilterSaved = true;
    this.getPatientAppointmentList();
  }
  onResetForm() {
    this.appointmentFilterSaved = false;
    this.appointmentListForm.patchValue(
      { doctorId: "", fromDate: "", toDate: "" },
      { emitEvent: false }
    );
    this.getPatientAppointmentList();
  }
  onPageChange(page: number) {
    this.appointmentListForm.patchValue({ page });
    this.getPatientAppointmentList();
  }
  getAppointmentCount() {
    this.apiService.get(API_ENDPOINTS.hospital.appointmentCount, {}).subscribe({
      next: (res: any) => {
        this.count = { ...res.result };
      },
      error: (error: any) => {
      },
    });
  }
  getListing() {
    this.apiService
      .get(API_ENDPOINTS.hospital.hospitalDoctorSpecialityList, {})
      .subscribe({
        next: (res: any) => {
          const { count, list } = res.result;
          if (count) {
            this.masterSpecialityList = list;
            this.specialisationList = list;
            this.addCheckboxesToForm("specialisation");
            return;
          }
          this.masterSpecialityList = [];
          this.specialisationList = list;
        },
        error: (error: any) => {
        },
      });
    this.apiService.get(API_ENDPOINTS.hospital.doctorList, {}).subscribe({
      next: (res: any) => {
        const { count, data } = res.result;
        if (count) {
          this.doctorList = data;
          this.masterdoctorList = data;
          this.addCheckboxesToForm("doctor");
          return;
        }
        this.doctorList = [];
        this.masterdoctorList = [];
      },
      error: (error: any) => { },
    });
  }
  searchSpeciality(event: any) {
    const value = event.target.value;
    if (value) {
      this.specialisationList = this.masterSpecialityList.filter(
        (item: any) => {
          return new RegExp(value, "i").test(item.specialityName);
        }
      );
      return;
    }
    this.specialisationList = [...this.masterSpecialityList];
  }
  searchDoctor(event: any) {
    const value = event.target.value;
    if (value) {
      this.doctorList = this.masterdoctorList.filter((item: any) => {
        return new RegExp(value, "i").test(item.doctorDetails?.doctorName);
      });
      return;
    }
    this.doctorList = [...this.masterdoctorList];
  }
  onSelectDoctor() { }

  addCheckboxesToForm(listName: string) {
    switch (listName) {
      case "specialisation":
        this.masterSpecialityList.forEach(() =>
          this.specialisationFormArray.push(new FormControl(true))
        );
        break;
      case "doctor":
        this.masterdoctorList.forEach(() => {
          this.doctorFormArray.push(new FormControl(true));
        });
        break;
    }
  }
  onSelectAllSpeciality() {
    const { all, specialization } = this.specialisationForm.value;
    if (all) {
      this.specialisationForm.patchValue({
        specialization: specialization.map((item: any) => {
          return true;
        }),
      });
    }
    this.getSpecialityGraphData();
  }
  onSelectAllDoctor() {
    const { all, doctors } = this.doctorForm.value;
    if (all) {
      this.doctorForm.patchValue({
        doctors: doctors.map((item: any) => {
          return true;
        }),
      });
    }
    this.getAppointmentBarChartData();
  }
  getSpecialityGraphData(payload: any = {}) {
    if (this.dateFilter) {
      payload = { ...payload, ...this.filterByDate[this.dateFilter] };
    }
    const { all } = this.specialisationForm.value;
    if (all) {
      payload = { ...payload, specialization: [] };
    } else {
      payload = {
        ...payload,
        specialization: this.specialisationFormArray.value
          .map((value: any, i: number) => {
            return value ? this.masterSpecialityList[i].specialityId : null;
          })
          .filter((id: any) => id != null),
      };
    }

    this.apiService
      .post(API_ENDPOINTS.hospital.specialityGraphData, payload)
      .subscribe({
        next: (res: any) => {
          const { count, list } = res.result;
          if (count) {
            this.generatePieChart(list);
            return;
          }
          if (this.specialisationPieChart) {
            this.specialisationPieChart.destroy();
          }
        },
        error: (error: any) => {
        },
      });
  }
  onAppointmentFilterMenuClosed() {
    if (!this.appointmentFilterSaved) {
      this.appointmentListForm.patchValue({
        doctorId: "",
        fromDate: "",
        toDate: "",
      });
    }
  }
  getPatientAppointmentList() {
    const payload = { ...this.appointmentListForm.value };
    for (let key in payload) {
      if (!payload[key]) {
        delete payload[key];
      }
      if (payload?.["fromDate"]) {
        payload.fromDate = moment(payload.fromDate).toISOString();
      }
      if (payload?.["toDate"]) {
        payload.toDate = moment(payload.toDate).toISOString();
      }
    }

    this.apiService
      .get(API_ENDPOINTS.hospital.hospitaldashboardAppointmentList, payload)
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          if (count) {
            this.appointmentList = data;
            this.totalItems = count;
            return;
          }
          this.appointmentList = [];
          this.totalItems = 0;
        },
        error: (error: any) => {
        },
      });
  }
  getAppointmentBarChartData() {
    let payload: any = {};
    payload = {
      ...payload,
      ...this.filterByDate[this.doctorForm.get("dateFilter").value],
    };
    const { all } = this.doctorForm.value;
    if (all) {
      payload = { ...payload, doctors: [] };
    } else {
      payload = {
        ...payload,
        doctors: this.doctorFormArray.value
          .map((value: any, i: number) => {
            return value ? this.masterdoctorList[i].doctorId : null;
          })
          .filter((id: any) => id != null),
      };
    }

    payload.groupByWeek = this.doctorForm.get("groupByWeek").value;

    this.apiService
      .post(API_ENDPOINTS.hospital.appointmentByDoctorGraph, payload)
      .subscribe({
        next: (res: any) => {
          const { count, list } = res.result;
          if (count) {
            this.doctorAppointments = list.map((doctor: any) => {
              return {
                ...doctor,
                labelCount: this.doctorDateFilterObj[
                  this.doctorFormControl["dateFilter"].value
                ].labels.map((item: any) => {
                  return {
                    count: this.doctorFormControl["groupByWeek"].value
                      ? doctor.weeklyCount.find(
                        (week: any) => week.week == item.id
                      )?.count ?? 0
                      : doctor.monthlyCount.find(
                        (month: any) => month.month == item.id
                      )?.count ?? 0,
                  };
                }),
              };
            });
          } else {
            this.doctorAppointments = [];
          }
          this.generateStackedBarChart(this.doctorAppointments);
        },
      });
  }
  onExport() {
    if (!this.totalItems) {
      this.toastr.error("No Appointments");
      return;
    }
    const options = {
      headers: [
        "Patient Name",
        "Appts Date",
        "Timing",
        "Doctor Name",
        "Doctor Speciality",
        "Appts Fees",
        "Status",
      ],
    };
    const payload = { ...this.appointmentListForm.value };
    for (let key in payload) {
      if (!payload[key]) {
        delete payload[key];
      }
      if (payload?.["fromDate"]) {
        payload.fromDate = moment(payload.fromDate).toISOString();
      }
      if (payload?.["toDate"]) {
        payload.toDate = moment(payload.toDate).toISOString();
      }
    }
    delete payload.page;
    delete payload.size;
    payload.isExport = true;
    this.apiService
      .get(API_ENDPOINTS.hospital.hospitaldashboardAppointmentList, payload)
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          if (count) {
            const csvData = data.map((appointment: any) => {
              return {
                patientName: appointment.patientName,
                appointmentDate: moment(appointment.date).format(
                  "DD, MMM YYYY"
                ),
                appointmentTime: moment(appointment.date).format("h:mm a"),
                doctorName: appointment.doctorName ?? "N/A",
                doctorSpeciality: this.formatArray.transform(
                  appointment.specialization,
                  "name"
                )
                  ? this.formatArray.transform(
                    appointment.specialization,
                    "name"
                  )
                  : "N/A",
                consultationFees: appointment.consultationFees,
                status: this.BOOKING_STATUS[appointment.status],
              };
            });
            return new ngxCsv(csvData, "AppointmentList", options);
          }
          return null;
        },
        error: (error: any) => {
        },
      });
  }
}
export function FromToValidation(from: string, to: string) {
  return (formGroup: FormGroup) => {
    const fromControl = formGroup.controls[from];
    const toControl = formGroup.controls[to];
    if (fromControl.value && !toControl.value) {
      toControl.setErrors({ mustHaveValue: true });
      return;
    } else if (!fromControl.value && toControl.value) {
      fromControl.setErrors({ mustHaveValue: true });
      return;
    }
    toControl.setErrors(null);
    fromControl.setErrors(null);
  };
}
