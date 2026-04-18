import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-treatment-patient-benefits',
  templateUrl: './treatment-patient-benefits.component.html',
  styleUrls: ['./treatment-patient-benefits.component.scss']
})
export class TreatmentPatientBenefitsComponent {
  @Input() treatmentTitle: string = '';
  @Input() whatsappLink: string = '';
  @Input() phone: string = '08069159999';

  readonly whyChoose = [
    { num: '01', title: 'Disease Diagnostics', desc: 'Our expert surgeons perform a thorough diagnosis to identify the root cause and recommend the best treatment plan.' },
    { num: '02', title: 'Instant & Emergency Cases', desc: 'We prioritize urgent cases and provide immediate medical attention to critical patients.' },
    { num: '03', title: 'Hassle-free Insurance', desc: 'We handle all insurance paperwork and facilitate cashless treatment at network hospitals.' },
    { num: '04', title: 'Post-Surgery Care', desc: 'Comprehensive follow-up consultations and recovery assistance after your procedure.' }
  ];

  readonly postOpCare = [
    { icon: '🍽️', title: 'Diet & Lifestyle', desc: 'Personalized diet plans for faster recovery' },
    { icon: '📋', title: 'Recovery Follow-up', desc: 'Scheduled check-ups with your surgeon' },
    { icon: '🚗', title: 'Free Cab Facility', desc: 'Complimentary pick-up and drop for visits' },
    { icon: '💬', title: '24*7 Patient Support', desc: 'Round-the-clock assistance via chat & call' }
  ];
}
