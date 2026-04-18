import { Component, OnInit, Renderer2 } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-doctor-reviews",
  templateUrl: "./doctor-reviews.component.html",
  styleUrls: ["./doctor-reviews.component.scss"],
})
export class DoctorReviewsComponent implements OnInit {


userId:any
currentReview:any
isEdit:any
doctorReply:any
isDropdownOpen: boolean = true;  
activeReviewId: string | null = null; 



reviewList: any[] = [];
filteredReviews: any[] = [];
searchText: string = '';
sortByNewest: boolean = true;



onSearchChange() {
  this.filterAndSortReviews();
}
isSubmenuOpen = false;

settingtoggleSubmenu(event: Event): void {
  event.preventDefault(); // Prevent default anchor behavior
  this.isSubmenuOpen = !this.isSubmenuOpen; // Toggle the submenu visibility
}

filterAndSortReviews() {

  this.filteredReviews = this.reviewList.filter(review => 
    review.user.fullName.toLowerCase().includes(this.searchText.toLowerCase())
  );

  this.applySorting();
}


 // Sort reviews by date (newest or oldest)
 applySorting() {
  this.filteredReviews.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return this.sortByNewest ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });
}


sortNewestToOldest() {
  this.sortByNewest = true;
  this.applySorting();
  this.toggleDropdown()
}

sortOldestToNewest() {
  this.sortByNewest = false;
  this.applySorting();
  this.toggleDropdown()
}


ngOnInit(): void {
  this.getReviews()
}


likeFeedback(review_like: any) {
  this.apiService
    .post(`${API_ENDPOINTS.doctor.likeFeedback}/${review_like._id}`, { feedbackLike: review_like?.feedbackLike ? false : true })
    .subscribe(
      (res: any) => {
        this.toastr.success("Feedback Updated");
        this.getReviews()
      },
      (err: any) => {
        this.toastr.error("Error Updating Feedback");
      }
    );
}

  //custom js start
  constructor(private renderer: Renderer2,private apiService: ApiService,
    public toastr: ToastrService,
    private localStorage: LocalStorageService,

  ) {}

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

 

  getReviews() {
    this.userId = this.localStorage.getItem("findUserId");
    if(this.userId)
    {
      this.apiService
      .get(API_ENDPOINTS.doctor.getFeedback+"/"+this.userId, {})
      .subscribe((res: any) => {
        this.reviewList =
          res?.result
          this.filteredReviews = [...this.reviewList];  // Initialize filtered reviews
          this.sortNewestToOldest()

      });
    }
   
  }

    getStarRatings(totalPoint: number) {
      const fullStars = Math.floor(totalPoint); // Count of full stars
      const halfStar = totalPoint % 1 >= 0.5 ? 1 : 0; // Half star if decimal part is 0.5 or more
      const emptyStars = 5 - (fullStars + halfStar); // Remaining stars are empty
    
      return { fullStars, halfStar, emptyStars };
    }
  

    sendReview(currentReview: any) {
      if (!this.doctorReply) {
        alert("Please enter a reply.");
        return;
      }
  
      this.apiService
        .post(`${API_ENDPOINTS.doctor.replyFeedback}/${currentReview._id}`, { doctorReply: this.doctorReply })
        .subscribe(
          (res: any) => {
            this.toastr.success("Reply Added");
            currentReview.doctorReply = this.doctorReply; // Update the review 
            this.doctorReply = ''; // Clear the input field after sending the reply
            if(this.isEdit){
                this.isEdit=false
            }
          },
          (err: any) => {
            this.toastr.error("Error Replying to feedback");
          }
        );
    }

  
    onMenuClick() {
      const sideMenu = document.getElementById("sideMenu");
      const innerArea = document.getElementById("clickToCloseArea");
      if (sideMenu) {
        if (sideMenu.classList.contains("mobileMenu") && innerArea.classList.contains("openedSideBar")  ) {
          this.renderer.removeClass(sideMenu, "mobileMenu");
          this.renderer.removeClass(innerArea, "openedSideBar");
  
  
        } else {
          this.renderer.addClass(sideMenu, "mobileMenu");
          this.renderer.addClass(innerArea, "openedSideBar");
        }
      }
    }
  
    closeSideBar(){
      const innerArea = document.getElementById("clickToCloseArea");
      const sideMenu = document.getElementById("sideMenu");
    if (innerArea.classList.contains("openedSideBar")) {
      this.renderer.removeClass(innerArea, "openedSideBar");
      this.renderer.removeClass(sideMenu, "mobileMenu");
  
    } 
  
    }
  

  onCloseMenuClick() {
    const sideMenu = document.getElementById("sideMenu");

    if (sideMenu && sideMenu.classList.contains("mobileMenu")) {
      this.renderer.removeClass(sideMenu, "mobileMenu");
    }
  }
  // toggle side menu sub menu
  toggleSubmenu(event: Event): void {
    event.preventDefault(); // Prevent the default action of the anchor tag

    const target = event.currentTarget as HTMLElement;
    const submenu = target.nextElementSibling as HTMLElement;

    if (submenu) {
      // Toggle the visibility of the submenu
      submenu.style.display = submenu.style.display === "block" ? "none" : "block";

      // Optionally hide other submenus if needed
      const allSubmenus = document.querySelectorAll(".submenu");
      allSubmenus.forEach((sm) => {
        if (sm !== submenu) {
          (sm as HTMLElement).style.display = "none";
        }
      });
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest(".dropdown")) {
      this.isDropdownOpen = false;
    }
  }

  openReply(review: any) {
    this.currentReview = review;
    this.doctorReply = ''; // Clear any previous reply input
    this.isEdit=false
    document.querySelector(".review-reply")?.classList.add("active");
        setTimeout(() => {
    }, 0);
  }

  edit(review: any) {
    this.currentReview = review;
    this.doctorReply = this.currentReview.doctorReply; 
    this.isEdit=true
    document.querySelector(".review-reply")?.classList.add("active");
        setTimeout(() => {
    }, 0);
  }
  closeReply() {
    this.currentReview=''
    document.querySelector(".review-reply")?.classList.remove("active");
  }
}