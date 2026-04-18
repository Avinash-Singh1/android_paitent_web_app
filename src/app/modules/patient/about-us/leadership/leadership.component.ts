import { Component } from "@angular/core";

@Component({
  standalone: false,
  selector: "nectar-leadership",
  templateUrl: "./leadership.component.html",
  styleUrls: ["./leadership.component.scss"],
})
export class LeadershipComponent  {


  items: any = [
    { name: "Trust", image: "assets/images/svg/trust12.svg" },
    { name: "Transparency", image: "assets/images/svg/drop.svg" },
    { name: "Resilience", image: "assets/images/svg/handShake.svg" },
    { name: "First Principle Thinking", image: "assets/images/svg/bulb.svg" },
    { name: "Leading with Character", image: "assets/images/svg/brain.svg" },
  ];

  leaders: any = [
    {
      name: "Amrit James",
      post: "Founder & CEO",
      image: "assets/images/svg/Amrit.svg",
    },
    {
      name: "Anchal Tyagi",
      post: "Business Head",
      image: "assets/images/svg/Anchal.svg",
    },
    {
      name: "Shailza Gupta",
      post: "Marketing Head",
      image: "assets/images/svg/shailza.svg",
    },
  ];
}
