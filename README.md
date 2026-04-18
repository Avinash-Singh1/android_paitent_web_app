# Nectar Plus Healthcare - Frontend

> Angular-based progressive web application for the Nectar Plus Healthcare platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Development](#development)
- [Key Modules](#key-modules)
- [Components](#components)
- [Services](#services)
- [Utilities](#utilities)
- [State Management](#state-management)
- [Routing](#routing)
- [Build & Deployment](#build--deployment)
- [Performance Optimization](#performance-optimization)

---

## 🎯 Overview

The Nectar Plus Frontend is a modern, responsive web application built with Angular that provides:

- **Multi-Portal Support**: Separate portals for Patients, Doctors, Hospitals, and Admins
- **SEO-Ready Frontend**: Meta tags, canonical links, and structured data support
- **Progressive Web App (PWA)**: Offline support and app-like experience
- **Responsive Design**: Mobile-first approach with Angular Material
- **Real-time Updates**: Live appointment tracking and notifications
- **Advanced Calendar**: Week and month views with drag-and-drop
- **Location Services**: Google Places API integration for address autocomplete
- **File Upload**: Multi-file upload with preview for medical documents
- **Lazy Loading**: Route-based code splitting for optimal performance

---

## 🛠 Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | ^16.0.0 | Frontend framework |
| **TypeScript** | ~5.1.0 | Programming language |
| **Angular Material** | ^16.0.0 | UI component library |
| **RxJS** | ~7.8.0 | Reactive programming |
| **NgRx** | ^16.0.0 | State management |
| **Moment.js** | ^2.29.4 | Date/time manipulation |
| **Chart.js** | ^4.3.0 | Data visualization |
| **Tippy.js** | ^6.3.7 | Tooltips |
| **Google Maps API** | Latest | Location services |
| **SwiperJS** | ^10.0.0 | Carousels |

---

## 🏗 Architecture

### Project Structure

```
nectar-plus-web-fe/src/
├── app/
│   ├── modules/                        # Feature modules
│   │   ├── doctor/                     # Doctor portal
│   │   │   ├── doctor-calendar/
│   │   │   │   ├── components/
│   │   │   │   │   ├── week-view/
│   │   │   │   │   ├── month-view/
│   │   │   │   │   └── day-view/
│   │   │   │   ├── doctor-calendar.component.ts
│   │   │   │   └── doctor-calendar.module.ts
│   │   │   ├── doctor-patients/
│   │   │   ├── doctor-establishment/
│   │   │   │   ├── add-establishment/
│   │   │   │   └── establishment-list/
│   │   │   ├── doctor-settings/
│   │   │   └── doctor-medical-verifications/
│   │   ├── hospital/                   # Hospital portal
│   │   │   ├── hospital-calendar/
│   │   │   ├── hospital-dashboard/
│   │   │   ├── hospital-doctor/
│   │   │   └── hospital-settings/
│   │   ├── patient/                    # Patient portal
│   │   │   ├── doctor-search-result/
│   │   │   ├── service-search-result/
│   │   │   ├── profile-doctor/
│   │   │   ├── book-appointment/
│   │   │   └── my-appointments/
│   │   └── admin/                      # Admin portal
│   │       ├── admin-dashboard/
│   │       ├── user-management/
│   │       └── reports/
│   ├── shared/                         # Shared components
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   ├── sidebar/
│   │   │   └── loader/
│   │   ├── directives/
│   │   └── pipes/
│   ├── core/                           # Core module
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── models/
│   ├── services/                       # Shared services
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   ├── common.service.ts
│   │   ├── event.service.ts
│   │   └── format-time.service.ts
│   ├── config/                         # Configuration
│   │   ├── api.constant.ts
│   │   └── app.constant.ts
│   ├── utils/                          # Utilities
│   │   └── helper.ts
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   └── app.module.ts
├── assets/                             # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
├── environments/                       # Environment configs
│   ├── environment.ts
│   └── environment.prod.ts
├── styles.scss                         # Global styles
├── index.html
└── main.ts

```

### Design Patterns

1. **Module-based Architecture**: Feature modules for code organization
2. **Smart & Dumb Components**: Container/Presentational pattern
3. **Service Layer**: Centralized business logic
4. **Observable Pattern**: RxJS for async operations
5. **Lazy Loading**: Route-based code splitting
6. **Change Detection Strategy**: OnPush for performance

---

## 📦 Installation

### Prerequisites

- Node.js v18.x or higher
- npm or yarn
- Angular CLI v16.x

### Steps

```bash
# Install Angular CLI globally
npm install -g @angular/cli@16

# Clone repository
git clone <repository-url>
cd nectar-plus-web-fe

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

---

## 🚀 Development

### Available Scripts

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e"
  }
}
```

### Development Server

```bash
# Start dev server (http://localhost:4200)
npm start

# Start with custom port
ng serve --port 4300

# Start with prod configuration
ng serve --configuration production

# Start with prod configuration preview
ng serve --configuration production
```

---

## 🔌 Key Modules

### 1. Doctor Calendar Module

**Path**: `src/app/modules/doctor/doctor-calendar/`

**Purpose**: Comprehensive calendar management for doctors to view and manage appointments.

**Key Components**:

#### Week View Component

**File**: `components/week-view/week-view.component.ts`

```typescript
export class WeekViewComponent implements OnInit, OnDestroy, AfterViewInit {
  startOfWeek: Date = new Date();
  endOfWeek: Date = moment(this.startOfWeek).add(6, "days").toDate();
  maxDate = moment(this.startOfWeek).endOf("M").add(2, "M").toDate();
  
  weeks: any[] = [];
  rows: any[][] = [];
  appointmentMap: Map<string, any[]> = new Map();
  
  ngOnInit() {
    this.generateWeekcolumn(0);
    this.generateWeekRows();
    this.getCalendarData();
  }
  
  // Generate week columns (7 days)
  generateWeekcolumn(direction: number) {
    // direction: -1 (previous week), 0 (current), 1 (next week)
    const newStartOfWeek = moment(this.startOfWeek)
      .add(direction * 7, "days")
      .toDate();
    
    // Prevent navigation beyond 2 months
    if (moment(newStartOfWeek).isAfter(this.maxDate)) return;
    
    this.startOfWeek = newStartOfWeek;
    this.endOfWeek = moment(this.startOfWeek).add(6, "days").toDate();
    
    this.weeks = [];
    for (let i = 0; i < 7; i++) {
      const date = moment(this.startOfWeek).add(i, "days");
      this.weeks.push({
        date: date.toDate(),
        day: date.format("ddd"),
        dayNumber: date.date(),
        isToday: date.isSame(moment(), "day")
      });
    }
    
    this.eventService.broadcastEvent("week-change", {
      startOfWeek: this.startOfWeek,
      endOfWeek: this.endOfWeek
    });
  }
  
  // Generate time slot rows (12:00 AM - 11:45 PM)
  generateWeekRows() {
    this.rows = [];
    const startTime = moment().startOf("day");
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeSlot = moment(startTime)
          .hour(hour)
          .minute(minute)
          .format("hh:mm A");
        
        const row = this.weeks.map(weekDay => ({
          time: timeSlot,
          date: weekDay.date,
          appointments: []
        }));
        
        this.rows.push(row);
      }
    }
  }
  
  // Fetch and populate appointment data
  getCalendarData() {
    const payload = {
      startDate: moment(this.startOfWeek).format("YYYY-MM-DD"),
      endDate: moment(this.endOfWeek).format("YYYY-MM-DD")
    };
    
    this.apiService.post("doctor/calendar", payload).subscribe({
      next: (response) => {
        this.populateAppointments(response.result);
      },
      error: (error) => {
        console.error("Failed to fetch calendar data", error);
      }
    });
  }
  
  // Populate appointments into time slots
  populateAppointments(appointments: any[]) {
    this.appointmentMap.clear();
    
    appointments.forEach(dayData => {
      const date = moment(dayData._id).format("YYYY-MM-DD");
      
      dayData.appointments.forEach(apt => {
        const key = `${date}-${apt.time}`;
        
        if (!this.appointmentMap.has(key)) {
          this.appointmentMap.set(key, []);
        }
        
        this.appointmentMap.get(key)!.push({
          patientName: apt.patientName,
          time: apt.time,
          status: apt.status,
          appointmentId: apt._id
        });
      });
    });
    
    // Update rows with appointments
    this.updateRowsWithAppointments();
  }
  
  // Navigate to appointment details
  openAppointment(appointment: any) {
    this.router.navigate(["/doctor/appointments", appointment.appointmentId]);
  }
}
```

#### Month View Component

**File**: `components/month-view/month-view.component.ts`

```typescript
export class MonthViewComponent implements OnInit, OnDestroy {
  firstDayOfMonth: Date = moment().startOf("month").toDate();
  lastDayOfMonth: Date = moment().endOf("month").toDate();
  maxDate = moment().add(2, "months").endOf("month").toDate();
  
  weeks: any[][] = [];
  appointmentCounts: Map<string, number> = new Map();
  
  ngOnInit() {
    this.generateMonthTable(0);
    this.getCalendarData();
  }
  
  // Generate month table (weeks with days)
  generateMonthTable(index: number) {
    // index: 0 (current), 1 (next month), 2 (next+1)
    const targetMonth = moment().add(index, "months");
    
    if (targetMonth.isAfter(this.maxDate)) return;
    
    this.firstDayOfMonth = targetMonth.startOf("month").toDate();
    this.lastDayOfMonth = targetMonth.endOf("month").toDate();
    
    this.weeks = generateMonthTable(this.firstDayOfMonth);
    
    this.eventService.broadcastEvent("month-change", {
      firstDayOfMonth: this.firstDayOfMonth,
      lastDayOfMonth: this.lastDayOfMonth,
      monthName: targetMonth.format("MMMM YYYY")
    });
  }
  
  // Fetch appointment counts for the month
  getCalendarData() {
    const payload = {
      startDate: moment(this.firstDayOfMonth).format("YYYY-MM-DD"),
      endDate: moment(this.lastDayOfMonth).format("YYYY-MM-DD")
    };
    
    this.apiService.post("doctor/calendar", payload).subscribe({
      next: (response) => {
        this.processAppointmentCounts(response.result);
        this.attachTooltips();
      }
    });
  }
  
  // Process and map appointment counts
  processAppointmentCounts(appointments: any[]) {
    this.appointmentCounts.clear();
    
    appointments.forEach(dayData => {
      const date = moment(dayData._id).format("YYYY-MM-DD");
      this.appointmentCounts.set(date, dayData.appointments.length);
    });
  }
  
  // Attach tooltips using Tippy.js
  attachTooltips() {
    setTimeout(() => {
      const elements = document.querySelectorAll("[data-tippy-content]");
      
      tippy(elements, {
        placement: "top",
        arrow: true,
        theme: "light",
        maxWidth: 300
      });
    }, 100);
  }
  
  // Navigate to day view
  onDayClick(day: any) {
    if (day.isCurrentMonth) {
      this.eventService.broadcastEvent("navigate-to-day", {
        date: day.date
      });
    }
  }
}
```

### 2. Doctor Establishment Module

**Path**: `src/app/modules/doctor/doctor-establishment/`

**Purpose**: Manage clinics/hospitals where doctor practices.

**Key Features**:
- Multi-step form (4 slides)
- Google Places API integration
- Working hours configuration
- File upload for establishment proof

**File**: `add-establishment/add-establishment.component.ts`

```typescript
export class AddEstablishmentComponent implements OnInit {
  activeSlideIndex: number = 0;
  totalSlides: number = 4;
  
  establishmentForm: FormGroup;
  
  establishmentTypes = [
    { value: "clinic", label: "Private Clinic" },
    { value: "hospital", label: "Hospital" }
  ];
  
  establishmentProofOptions = [
    "Clinic Registration Proof",
    "Tax Receipt",
    "Other"
  ];
  
  ngOnInit() {
    this.initializeForm();
    this.loadGooglePlacesAPI();
  }
  
  // Initialize form with validators
  initializeForm() {
    this.establishmentForm = this.fb.group({
      // Slide 1: Basic Info
      establishmentType: ["", Validators.required],
      name: ["", [Validators.required, Validators.minLength(3)]],
      
      // Slide 2: Address
      address: this.fb.group({
        line1: ["", Validators.required],
        line2: [""],
        locality: ["", Validators.required],
        city: ["", Validators.required],
        state: ["", Validators.required],
        pincode: ["", [Validators.required, Validators.pattern(/^\d{6}$/)]],
        latitude: [null],
        longitude: [null]
      }),
      
      // Slide 3: Working Hours
      workingHours: this.fb.group({
        mon: this.createDaySlots(),
        tue: this.createDaySlots(),
        wed: this.createDaySlots(),
        thu: this.createDaySlots(),
        fri: this.createDaySlots(),
        sat: this.createDaySlots(),
        sun: this.createDaySlots()
      }),
      
      // Slide 4: Fees & Documents
      consultationFees: ["", [Validators.required, Validators.min(0)]],
      slotTime: [15, Validators.required],
      establishmentProof: [""],
      establishmentProofType: [""]
    });
  }
  
  // Create day slots (morning, afternoon, evening)
  createDaySlots(): FormGroup {
    return this.fb.group({
      morning: this.fb.group({
        startTime: [""],
        endTime: [""]
      }),
      afternoon: this.fb.group({
        startTime: [""],
        endTime: [""]
      }),
      evening: this.fb.group({
        startTime: [""],
        endTime: [""]
      })
    });
  }
  
  // Load Google Places API
  loadGooglePlacesAPI() {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        this.initializeAutocomplete();
      };
    }
  }
  
  // Initialize Google Places Autocomplete
  initializeAutocomplete() {
    const input = document.getElementById("address-line1") as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: "in" },
      fields: ["address_components", "geometry", "formatted_address"]
    });
    
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      this.populateAddress(place);
    });
  }
  
  // Populate address from Google Places
  populateAddress(place: google.maps.places.PlaceResult) {
    const addressData = getAddressKeys(
      place.address_components,
      this.stateList
    );
    
    this.establishmentForm.patchValue({
      address: {
        line1: place.formatted_address,
        locality: addressData.locality,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        latitude: place.geometry?.location?.lat(),
        longitude: place.geometry?.location?.lng()
      }
    });
  }
  
  // Validate time overlaps
  isTimeOverLapping(formValue: any): boolean {
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    
    for (const day of days) {
      const slots = formValue.workingHours[day];
      const timeSlots = [];
      
      // Collect all time slots for the day
      ["morning", "afternoon", "evening"].forEach(period => {
        if (slots[period].startTime && slots[period].endTime) {
          timeSlots.push({
            start: this.convertToMinutes(slots[period].startTime),
            end: this.convertToMinutes(slots[period].endTime)
          });
        }
      });
      
      // Check for overlaps
      for (let i = 0; i < timeSlots.length; i++) {
        for (let j = i + 1; j < timeSlots.length; j++) {
          if (this.hasOverlap(timeSlots[i], timeSlots[j])) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  // Check overlap between two time slots
  hasOverlap(slot1: any, slot2: any): boolean {
    return (slot1.start < slot2.end && slot1.end > slot2.start);
  }
  
  // Convert time string to minutes
  convertToMinutes(time: string): number {
    const [timeStr, period] = time.split(" ");
    let [hours, minutes] = timeStr.split(":").map(Number);
    
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  }
  
  // File upload handler
  onFileSelected(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        this.toastr.error("Only JPG, PNG, and PDF files are allowed");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.toastr.error("File size must be less than 10MB");
        return;
      }
      
      // Upload to S3
      this.uploadFile(file, controlName);
    }
  }
  
  // Upload file to S3
  uploadFile(file: File, controlName: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "establishments");
    
    this.apiService.post("upload", formData).subscribe({
      next: (response) => {
        this.establishmentForm.patchValue({
          [controlName]: response.fileUrl
        });
        this.toastr.success("File uploaded successfully");
      },
      error: (error) => {
        this.toastr.error("File upload failed");
      }
    });
  }
  
  // Navigate to next slide
  nextSlide(value: number = 1) {
    // Validate current slide
    if (!this.validateSlide(this.activeSlideIndex)) {
      return;
    }
    
    if (this.activeSlideIndex + value < this.totalSlides) {
      this.activeSlideIndex += value;
    } else {
      // Submit form
      this.submitForm();
    }
  }
  
  // Validate specific slide
  validateSlide(slideIndex: number): boolean {
    switch (slideIndex) {
      case 0:
        return this.establishmentForm.get("establishmentType")?.valid &&
               this.establishmentForm.get("name")?.valid;
      
      case 1:
        return this.establishmentForm.get("address")?.valid;
      
      case 2:
        if (this.isTimeOverLapping(this.establishmentForm.value)) {
          this.toastr.error("Time slots are overlapping");
          return false;
        }
        return true;
      
      case 3:
        return this.establishmentForm.get("consultationFees")?.valid &&
               this.establishmentForm.get("slotTime")?.valid;
      
      default:
        return true;
    }
  }
  
  // Submit form
  submitForm() {
    if (this.establishmentForm.invalid) {
      this.toastr.error("Please fill all required fields");
      return;
    }
    
    const formValue = this.establishmentForm.value;
    
    // Transform working hours data
    const establishmentData = {
      ...formValue,
      workingHours: this.transformWorkingHours(formValue.workingHours)
    };
    
    this.apiService.post("doctor/establishment", establishmentData).subscribe({
      next: (response) => {
        this.toastr.success("Establishment added successfully");
        this.router.navigate(["/doctor/establishments"]);
      },
      error: (error) => {
        this.toastr.error(error.message || "Failed to add establishment");
      }
    });
  }
  
  // Transform working hours to API format
  transformWorkingHours(workingHours: any): any[] {
    const result = [];
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    
    days.forEach(day => {
      const slots = [];
      
      ["morning", "afternoon", "evening"].forEach(period => {
        if (workingHours[day][period].startTime && 
            workingHours[day][period].endTime) {
          slots.push({
            type: period,
            startTime: workingHours[day][period].startTime,
            endTime: workingHours[day][period].endTime
          });
        }
      });
      
      if (slots.length > 0) {
        result.push({ day, slots });
      }
    });
    
    return result;
  }
}
```

### 3. Hospital Calendar Module

**Path**: `src/app/modules/hospital/hospital-calendar/`

**Similar to Doctor Calendar with multi-doctor support**:

```typescript
export class HospitalWeekViewComponent {
  @Input() doctor: { all: boolean; doctorId?: string };
  
  selectedDoctor: any = { all: true };
  doctorList: any[] = [];
  showDoctorDropdown: boolean = false;
  
  ngOnInit() {
    this.loadDoctors();
    this.generateWeekcolumn(0);
    this.getCalendarData();
  }
  
  // Load hospital's doctors
  loadDoctors() {
    this.apiService.get("hospital/doctors").subscribe({
      next: (response) => {
        this.doctorList = response.data;
      }
    });
  }
  
  // Filter by specific doctor
  onDoctorChange(doctor: any) {
    this.selectedDoctor = doctor;
    this.getCalendarData();
  }
  
  // Get calendar data (all doctors or specific)
  getCalendarData() {
    const payload: any = {
      startDate: moment(this.startOfWeek).format("YYYY-MM-DD"),
      endDate: moment(this.endOfWeek).format("YYYY-MM-DD")
    };
    
    if (!this.selectedDoctor.all) {
      payload.doctorId = this.selectedDoctor.doctorId;
    }
    
    this.apiService.post("hospital/calendar", payload).subscribe({
      next: (response) => {
        this.populateAppointments(response.result);
      }
    });
  }
}
```

### 4. Patient Search Module

**Path**: `src/app/modules/patient/doctor-search-result/`

**Key Features**:
- SEO-ready metadata and structured data
- Infinite scroll
- Advanced filtering
- Location-based search

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorSearchResultComponent implements OnInit, OnDestroy {
  doctors: any[] = [];
  filters = {
    specialization: "",
    city: "",
    locality: "",
    search: "",
    sortBy: "consultationFees",
    sortOrder: "asc"
  };
  
  page = 1;
  size = 10;
  totalCount = 0;
  loading = false;
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.filters = {
        ...this.filters,
        ...params
      };
      
      this.searchDoctors(true);
    });
    
  }
  
  // Search doctors with filters
  searchDoctors(reset: boolean = false) {
    if (reset) {
      this.page = 1;
      this.doctors = [];
    }
    
    this.loading = true;
    
    const params = {
      ...this.filters,
      page: this.page,
      size: this.size
    };
    
    this.apiService.get("patient/search", params).subscribe({
      next: (response) => {
        this.doctors = reset 
          ? response.data 
          : [...this.doctors, ...response.data];
        
        this.totalCount = response.count;
        this.loading = false;
        
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
  
  // Infinite scroll handler
  @HostListener("window:scroll", ["$event"])
  onScroll() {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 100 &&
        !this.loading &&
        this.doctors.length < this.totalCount) {
      this.page++;
      this.searchDoctors();
    }
  }
  
  // Apply filter
  onFilterChange(filterName: string, value: any) {
    this.filters[filterName] = value;
    
    // Update URL query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.filters,
      queryParamsHandling: "merge"
    });
  }
  
  // Navigate to doctor profile
  viewDoctorProfile(doctor: any) {
    this.router.navigate(["/doctors", doctor.doctorProfileSlug]);
  }
}
```

---

## 🔧 Services

### 1. API Service

**File**: `src/app/services/api.service.ts`

```typescript
@Injectable({ providedIn: "root" })
export class ApiService {
  private baseUrl = environment.apiUrl;
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}
  
  // GET request
  get(endpoint: string, params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/${endpoint}`, {
      params: this.cleanParams(params),
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
  
  // POST request
  post(endpoint: string, body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${endpoint}`, body, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
  
  // PUT request
  put(endpoint: string, body: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${endpoint}`, body, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
  
  // DELETE request
  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
  
  // Get headers with auth token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    
    return new HttpHeaders({
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` })
    });
  }
  
  // Clean undefined params
  private cleanParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    
    return httpParams;
  }
  
  // Error handler
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "An error occurred";
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
```

### 2. Format Time Service

**File**: `src/app/services/format-time.service.ts`

```typescript
@Injectable({ providedIn: "root" })
export class FormatTimeService {
  // Merge adjacent time slots
  matchDays(data: any) {
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const result = [];
    
    for (const record of data) {
      const slots = record.slots;
      
      // Merge morning + afternoon if gap = slotTime
      if (slots.morning && slots.afternoon) {
        const morningEnd = this.convertTo24Hour(slots.morning.endTime);
        const afternoonStart = this.convertTo24Hour(slots.afternoon.startTime);
        
        if (this.getTimeDiff(morningEnd, afternoonStart) <= record.slotTime) {
          slots.morningAfternoon = {
            startTime: slots.morning.startTime,
            endTime: slots.afternoon.endTime
          };
          delete slots.morning;
          delete slots.afternoon;
        }
      }
      
      // Merge afternoon + evening
      if (slots.afternoon && slots.evening) {
        const afternoonEnd = this.convertTo24Hour(slots.afternoon.endTime);
        const eveningStart = this.convertTo24Hour(slots.evening.startTime);
        
        if (this.getTimeDiff(afternoonEnd, eveningStart) <= record.slotTime) {
          slots.afternoonEvening = {
            startTime: slots.afternoon.startTime,
            endTime: slots.evening.endTime
          };
          delete slots.afternoon;
          delete slots.evening;
        }
      }
      
      result.push(record);
    }
    
    // Group consecutive days
    return this.groupConsecutiveDays(result);
  }
  
  // Convert 12-hour to 24-hour format
  convertTo24Hour(time: string): number {
    const [timeStr, period] = time.split(" ");
    let [hours, minutes] = timeStr.split(":").map(Number);
    
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  }
  
  // Get time difference in minutes
  getTimeDiff(time1: number, time2: number): number {
    return Math.abs(time2 - time1);
  }
  
  // Group consecutive days with same timings
  groupConsecutiveDays(data: any[]): any[] {
    // Implementation for grouping Mon-Fri, etc.
    return data;
  }
  
  // Clean empty slots
  cleanUpEmptySlots(data: any) {
    Object.keys(data).forEach(key => {
      if (!data[key] || (typeof data[key] === "object" && Object.keys(data[key]).length === 0)) {
        delete data[key];
      }
    });
    
    return data;
  }
}
```

### 3. Event Service

**File**: `src/app/services/event.service.ts`

```typescript
@Injectable({ providedIn: "root" })
export class EventService {
  private eventSubject = new Subject<{ event: string; data: any }>();
  
  // Broadcast event
  broadcastEvent(event: string, data: any = null) {
    this.eventSubject.next({ event, data });
  }
  
  // Listen to specific event
  on(event: string): Observable<any> {
    return this.eventSubject.pipe(
      filter(e => e.event === event),
      map(e => e.data)
    );
  }
  
  // Clear all subscriptions (call in ngOnDestroy)
  clear() {
    this.eventSubject.complete();
  }
}
```

---

## 🛠 Utilities

### Helper Functions

**File**: `src/app/utils/helper.ts`

```typescript
// Generate month table for calendar
export function generateMonthTable(firstDayOfMonth: Date): any[][] {
  const weeks = [];
  const startOfMonth = moment(firstDayOfMonth).startOf("month");
  const endOfMonth = moment(firstDayOfMonth).endOf("month");
  
  // Start from Sunday of first week
  const startDate = moment(startOfMonth).startOf("week");
  const endDate = moment(endOfMonth).endOf("week");
  
  let currentWeek = [];
  let currentDate = moment(startDate);
  
  while (currentDate.isSameOrBefore(endDate)) {
    currentWeek.push({
      date: currentDate.toDate(),
      day: currentDate.date(),
      isCurrentMonth: currentDate.isSame(startOfMonth, "month"),
      isToday: currentDate.isSame(moment(), "day"),
      isPast: currentDate.isBefore(moment(), "day")
    });
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    
    currentDate = currentDate.add(1, "day");
  }
  
  return weeks;
}

// Parse Google Places address
export function getAddressKeys(
  address_components: google.maps.GeocoderAddressComponent[],
  stateList: any[]
): any {
  const result = {
    locality: "",
    city: "",
    state: "",
    pincode: "",
    country: ""
  };
  
  address_components.forEach(component => {
    const types = component.types;
    
    if (types.includes("locality")) {
      result.locality = component.long_name;
    }
    
    if (types.includes("administrative_area_level_2")) {
      result.city = component.long_name;
    }
    
    if (types.includes("administrative_area_level_1")) {
      const stateName = component.long_name;
      const state = stateList.find(s => s.name === stateName);
      result.state = state ? state._id : "";
    }
    
    if (types.includes("postal_code")) {
      result.pincode = component.long_name;
    }
    
    if (types.includes("country")) {
      result.country = component.long_name;
    }
  });
  
  return result;
}

// Prepare slot display format
export function prepareSlot(originalData: any, day: string): any {
  const dayData = originalData.find(d => d.day === day);
  
  if (!dayData) return null;
  
  const slots = {
    morning: null,
    afternoon: null,
    evening: null
  };
  
  dayData.slots.forEach(slot => {
    slots[slot.type] = {
      startTime: slot.startTime,
      endTime: slot.endTime
    };
  });
  
  return slots;
}
```

---

## 🚀 Build & Deployment

### Production Build

```bash
# Standard build
npm run build

# Production build
npm run build

# Output: dist/nectar-plus-web-fe/
```

### Frontend Deployment

```bash
# Build production bundle
npm run build

# Deploy static assets from dist/nectar/browser
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/nectar-plus-web-fe ./dist/nectar-plus-web-fe

EXPOSE 4000

CMD ["sh", "-c", "echo 'Serve dist/nectar/browser using your web server of choice'"]
```

### Environment Configuration

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: "https://api.nectarplus.com/api/v1",
  googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
  s3BucketUrl: "https://nectar-plus-bucket.s3.amazonaws.com"
};
```

---

## ⚡ Performance Optimization

### Lazy Loading

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: "doctor",
    loadChildren: () => import("./modules/doctor/doctor.module")
      .then(m => m.DoctorModule)
  },
  {
    path: "hospital",
    loadChildren: () => import("./modules/hospital/hospital.module")
      .then(m => m.HospitalModule)
  },
  {
    path: "patient",
    loadChildren: () => import("./modules/patient/patient.module")
      .then(m => m.PatientModule)
  }
];
```

### Change Detection Strategy

```typescript
@Component({
  selector: "app-doctor-list",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorListComponent {
  // Use OnPush for better performance
}
```

### Image Optimization

```html
<!-- Use loading="lazy" for images -->
<img src="{{doctor.image}}" 
     alt="{{doctor.name}}"
     loading="lazy"
     width="200"
     height="200">
```

---

## 📝 License

Proprietary - All rights reserved © 2024-2026 Nectar Plus Healthcare

---

## 👥 Support

For technical support or queries:
- **Email**: support@nectarplus.com
- **Developer**: dev@nectarplus.com

---

**Last Updated**: February 2026  
**Version**: 1.0.0

