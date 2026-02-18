export interface EditableServicePrice {
  name: string;
  price: string;
}

export interface EditableService {
  id: number;
  icon: string;
  title: string;
  description: string;
  prices: EditableServicePrice[];
}

export interface EditableTrustItem {
  id: number;
  title: string;
  description: string;
}

export interface SiteContent {
  header: {
    logoText: string;
    phone: string;
    homeLabel: string;
    servicesLabel: string;
    bookingLabel: string;
    contactsLabel: string;
    loginLabel: string;
    cabinetLabel: string;
    adminLabel: string;
    logoutLabel: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
  };
  services: {
    title: string;
    subtitle: string;
    items: EditableService[];
  };
  trust: {
    title: string;
    subtitle: string;
    items: EditableTrustItem[];
  };
  testimonials: {
    title: string;
    subtitle: string;
  };
  booking: {
    title: string;
    subtitle: string;
    dateLabel: string;
    timeLabel: string;
    submitText: string;
    needAuthText: string;
    benefitsTitle: string;
    benefits: string[];
    timeSlots: string[];
  };
  requestForm: {
    title: string;
    subtitle: string;
    submittedText: string;
    createdBookingText: string;
    needAuthText: string;
    sendErrorText: string;
    carBrands: string[];
  };
  vk: {
    title: string;
    subtitle: string;
    communityTitle: string;
    communityTextOne: string;
    communityTextTwo: string;
    buttonText: string;
    profileUrl: string;
  };
  contacts: {
    title: string;
    subtitle: string;
    addressTitle: string;
    addressText: string;
    mapTitle: string;
    mapAddress: string;
    routeButtonText: string;
    mapQueryAddress: string;
    phoneTitle: string;
    phones: string[];
    emailTitle: string;
    email: string;
    workHoursTitle: string;
    workHoursLines: string[];
  };
  footer: {
    companyTitle: string;
    companyDescription: string;
    quickLinksTitle: string;
    servicesLinkLabel: string;
    bookingLinkLabel: string;
    contactsLinkLabel: string;
    contactsTitle: string;
    socialTitle: string;
    city: string;
    bottomText: string;
    credits: string;
    socialLinks: Array<{
      label: string;
      url: string;
      network: string;
    }>;
  };
  media: {
    photos: string[];
    videoUrl: string;
  };
}
