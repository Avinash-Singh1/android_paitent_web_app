export const MENU_ITEMS = [
    {
        label: 'Dashboard',
        routerLink: '/doctor/dashboard',
        icon: 'assets/images/new-svg/sidemenu-svg/Dashboard.svg',
        alt: 'Dashboard',
    },
    {
        label: 'Calendar',
        routerLink: '/doctor/calendar',
        icon: 'assets/images/new-svg/sidemenu-svg/Calendar.svg',
        alt: 'Calendar',
    },
    {
        label: 'My Patient',
        routerLink: '/doctor/my-patient',
        icon: 'assets/images/new-svg/sidemenu-svg/my-patient.svg',
        alt: 'my-patient',
    },
    {
        label: 'Medical Verification',
        routerLink: '/doctor/medical-verification',
        icon: 'assets/images/new-svg/sidemenu-svg/medical-verification.svg',
        alt: 'medical-verification',
    },
    {
        label: 'Establishment',
        routerLink: '/doctor/establishment',
        icon: 'assets/images/new-svg/sidemenu-svg/establishment.svg',
        alt: 'establishment',
        style: { filter: '' }, // Custom style
    },
    {
        label: 'Services',
        routerLink: '/doctor/services',
        icon: 'assets/images/new-svg/sidemenu-svg/services.svg',
        alt: 'services',
    },
    {
        label: 'Procedure',
        routerLink: '/doctor/procedure',
        icon: 'assets/images/new-svg/sidemenu-svg/procedure.svg',
        alt: 'procedure',
    },
    {
        label: 'Videos',
        routerLink: '/doctor/videos',
        icon: 'assets/images/new-svg/sidemenu-svg/videos.svg',
        alt: 'videos',
    },
    {
        label: 'FAQs',
        routerLink: '/doctor/faqs',
        icon: 'assets/images/new-svg/sidemenu-svg/faq.svg',
        alt: 'faq',
    },
    {
        label: 'Profile',
        routerLink: '/doctor/profile',
        icon: 'assets/images/new-svg/sidemenu-svg/profile.svg',
        alt: 'profile',
    },
    {
        label: 'Reviews',
        routerLink: '/doctor/reviews',
        icon: 'assets/images/new-svg/sidemenu-svg/Reviews.svg',
        alt: 'Reviews',
    },
    {
        label: 'Settings',
        hasSubmenu: true,
        submenu: [
            {
                label: 'Change Password',
                routerLink: '/doctor/change-password',
                icon: 'assets/images/new-svg/change-password.svg',
                alt: 'change-password',
            },
            {
                label: 'Delete Account',
                routerLink: '/doctor/delete-account',
                icon: 'assets/images/new-svg/delete.svg',
                alt: 'delete',
            },
        ],
        icon: 'assets/images/new-svg/sidemenu-svg/Settings.svg',
        alt: 'Settings',
    },
]