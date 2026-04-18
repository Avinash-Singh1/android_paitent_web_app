import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";

@Component({
  standalone: false,
  selector: "nectar-read-more",
  templateUrl: "./read-more.component.html",
  styleUrls: ["./read-more.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadMoreComponent implements OnInit {
  @Input() text: string;
  @Input() maxLength: number;
  @Input() type: string = null;

  truncatedText: string;
  showFullText = false;

  ngOnInit() {
    this.truncatedText = this.text?.slice(0, this.maxLength);
  }

  toggleReadMore() {
    this.showFullText = !this.showFullText;
  }
}
