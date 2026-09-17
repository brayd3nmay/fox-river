import type { SiteContent } from "./content-schema";

// Migrated from foxriverrecreation.com on 2026-09-17. See README for pending client confirmations.
export const defaultContent: SiteContent = {
  hero: {
    eyebrow: "Antioch, Illinois · On the Fox River",
    title: "A little closer to nature.",
    description:
      "Slow mornings. Days on the water. Nights under the stars. Find your happy place at our family-owned campground.",
    image: {
      src: "/images/riverfront.webp",
      alt: "Boats moored along the tree-lined Fox River at the campground",
    },
    video: "",
  },
  intro: {
    eyebrow: "A place to come back to",
    title: "Fresh air. Familiar faces.\nYour kind of getaway.",
    body: "Welcome to Fox River Recreation. Set on 25 wooded acres along the Fox River, our family-owned campground puts you right on the water, with direct access to the Chain O'Lakes. Settle into a campsite, spend the afternoon canoeing, or stay for the whole season. There's room here to make yourself at home.",
  },
  stays: [
    {
      id: "rv",
      title: "Bring your home along.",
      description:
        "Pull in, hook up, and settle into life by the river. Water, electric, and full hookup options available.",
      image: {
        src: "/images/camping.webp",
        alt: "Campsites among mature trees at Fox River Recreation",
      },
      rateId: "rv-night",
    },
    {
      id: "cabins",
      title: "A cabin of your own.",
      description:
        "An easy escape with a little more comfort. One- and two-bedroom cabins for up to four or six guests.",
      image: {
        src: "/images/cabin.webp",
        alt: "A pink sunset reflected in the Fox River",
      },
      rateId: "cabin-one",
    },
    {
      id: "seasonal",
      title: "Make a season of it.",
      description:
        "Your favorite spot, all season long. Choose a riverside, off-river, or full hookup seasonal site.",
      image: {
        src: "/images/seasonal.webp",
        alt: "Seasonal camping beside the Fox River",
      },
      rateId: "season-off",
    },
  ],
  river: {
    title: "Take the scenic route.\nPreferably by water.",
    body: "Launch your boat and explore the Chain O'Lakes, rent a canoe for a quiet paddle, or find your favorite fishing spot. With the Fox River right here, a day on the water is always within reach.",
    image: {
      src: "/images/boating.webp",
      alt: "Boats and docks on the Fox River",
    },
  },
  amenities: [
    {
      id: "pool",
      name: "Swimming pool",
      detail: "A little splash between adventures.",
      icon: "waves",
    },
    {
      id: "playground",
      name: "Playground",
      detail: "Room for the little ones to play.",
      icon: "trees",
    },
    {
      id: "boat",
      name: "Boat launch & docks",
      detail: "Your way onto the Chain O'Lakes.",
      icon: "boat",
    },
    {
      id: "canoe",
      name: "Canoe rentals",
      detail: "An hour on the river or a whole day.",
      icon: "tent",
    },
    {
      id: "store",
      name: "Camp store",
      detail: "A handy stop while you're here.",
      icon: "store",
    },
    {
      id: "shower",
      name: "Showers",
      detail: "Coin-operated showers on site.",
      icon: "shower",
    },
    {
      id: "picnic",
      name: "Picnic areas",
      detail: "Gather for a meal in the fresh air.",
      icon: "picnic",
    },
    {
      id: "games",
      name: "Games & horseshoes",
      detail: "Make a little time for friendly competition.",
      icon: "games",
    },
    {
      id: "internet",
      name: "Internet access",
      detail: "For the moments you need to check in.",
      icon: "wifi",
    },
    {
      id: "propane",
      name: "LP bottles",
      detail: "Ask the camp store for details.",
      icon: "fuel",
    },
  ],
  gallery: [
    {
      src: "/images/riverfront.webp",
      alt: "A calm day on the Fox River beside the campground",
    },
    {
      src: "/images/pool.webp",
      alt: "The outdoor swimming pool at Fox River Recreation",
    },
    {
      src: "/images/camping.webp",
      alt: "Shaded campsites at Fox River Recreation",
    },
    {
      src: "/images/community.webp",
      alt: "Time together at Fox River Recreation",
    },
  ],
  reviews: [
    {
      name: "Phillip Brost",
      quote:
        "We stayed for 2 months. The park grounds, bath house and pool is VERY well kept and clean. The maintenance guys really do a great job and are always willing to help. The office staff is also very friendly and helpful.",
    },
    {
      name: "Ira Kozak",
      quote:
        "Wonderful staff very friendly. Seasonal campers are also great people. Everyone is entitled to their own opinion but the bad reviews I've read are seriously wrong.",
    },
    {
      name: "Ted Boner",
      quote:
        "This is a family run park with on site owners and staff. They are very helpful and accommodating providing a fun and safe camping experience.",
    },
  ],
  rateGroups: [
    {
      id: "camping",
      title: "RV camping",
      description:
        "Water and electric, or full hookups with sewer. Call the office to find the right site for your stay.",
      rates: [
        {
          id: "rv-night",
          name: "Nightly campsite",
          amount: 60,
          unit: "/ night",
          note: "Water + electric or full hookups",
        },
        {
          id: "rv-week",
          name: "Weekly campsite",
          amount: 360,
          unit: "/ week",
          note: "Plus electric",
        },
        {
          id: "rv-month",
          name: "Monthly campsite",
          amount: 980,
          unit: "/ month",
          note: "Plus electric",
        },
      ],
    },
    {
      id: "seasonal",
      title: "Seasonal sites",
      description:
        "April 1 to October 20, 2026. All seasonal site rates are plus electric.",
      rates: [
        {
          id: "season-east",
          name: "East side",
          amount: 4195,
          unit: "/ season",
          note: "Full hookups including sewer, plus electric",
        },
        {
          id: "season-river",
          name: "Riverside",
          amount: 4195,
          unit: "/ season",
          note: "Plus electric",
        },
        {
          id: "season-off",
          name: "Off river",
          amount: 3795,
          unit: "/ season",
          note: "Plus electric",
        },
      ],
    },
    {
      id: "cabins",
      title: "Cabin rentals",
      description:
        "Two-night minimum. Deposit and ID required. No pets in rental cabins.",
      rates: [
        {
          id: "cabin-one",
          name: "One-bedroom cabin",
          amount: 160,
          unit: "/ night",
          note: "Up to 4 guests",
        },
        {
          id: "cabin-two",
          name: "Two-bedroom cabin",
          amount: 180,
          unit: "/ night",
          note: "Up to 6 guests",
        },
        {
          id: "cabin-week",
          name: "Weekly cabin rental",
          amount: 800,
          unit: "/ week",
          note: "Call for cabin availability",
        },
      ],
    },
    {
      id: "water",
      title: "On the water",
      description:
        "Canoe delivery is available. Ask the office about arrangements and winterizing services.",
      rates: [
        {
          id: "canoe-hour",
          name: "Canoe rental",
          amount: 15,
          unit: "/ hour",
          note: "",
        },
        {
          id: "canoe-day",
          name: "Full-day canoe rental",
          amount: 35,
          unit: "/ day",
          note: "",
        },
        {
          id: "launch-tenant",
          name: "Boat launch · tenants",
          amount: 0,
          unit: "",
          note: "Included for tenants",
        },
        {
          id: "launch-public",
          name: "Boat launch · non-tenants",
          amount: 10,
          unit: "/ launch",
          note: "",
        },
        {
          id: "dock-tenant",
          name: "Dock · tenants",
          amount: 400,
          unit: "/ season",
          note: "",
        },
        {
          id: "dock-public",
          name: "Dock · non-tenants",
          amount: 600,
          unit: "/ season",
          note: "",
        },
        {
          id: "storage-tenant",
          name: "Boat storage · tenants",
          amount: 400,
          unit: "/ season",
          note: "",
        },
        {
          id: "storage-public",
          name: "Boat storage · non-tenants",
          amount: 700,
          unit: "/ season",
          note: "",
        },
        {
          id: "winter-storage",
          name: "Off-season winter storage",
          amount: 200,
          unit: "",
          note: "Call for details",
        },
      ],
    },
    {
      id: "passes",
      title: "Passes & visitors",
      description:
        "Please stop at the office when you arrive. Call to confirm the current family-pass price.",
      rates: [
        {
          id: "pass-family",
          name: "Family pass",
          amount: null,
          unit: "/ season",
          note: "Contact the office for the current rate",
        },
        {
          id: "pass-single",
          name: "Single pass",
          amount: 100,
          unit: "/ season",
          note: "",
        },
        {
          id: "visitor",
          name: "Adult day visitor",
          amount: null,
          unit: "/ person",
          note: "Contact the office for the current visitor fee",
        },
        {
          id: "overnight",
          name: "Overnight guest",
          amount: 10,
          unit: "/ person / night",
          note: "Sign up and pay at the office. Ask about the registration deadline.",
        },
      ],
    },
    {
      id: "gatherings",
      title: "Gatherings & extras",
      description:
        "Get in touch to arrange a gathering or ask about campground services.",
      rates: [
        {
          id: "pavilion",
          name: "Pavilion rental",
          amount: 200,
          unit: "/ day",
          note: "",
        },
        {
          id: "barn",
          name: "Barn rental",
          amount: 300,
          unit: "/ day",
          note: "",
        },
        {
          id: "golf-cart",
          name: "Golf cart season fee",
          amount: 100,
          unit: "/ season",
          note: "",
        },
        {
          id: "pump-out",
          name: "Scheduled pump out",
          amount: 17,
          unit: "",
          note: "Thursdays only. Sign up by Wednesday.",
        },
        {
          id: "pump-emergency",
          name: "Emergency pump out",
          amount: 60,
          unit: "",
          note: "",
        },
      ],
    },
  ],
  rules: [
    {
      title: "Cabin check-in & check-out",
      body: "Cabin check-in is at 3 pm or later. Check-out is at 1 pm. Cabin rentals have a two-night minimum. A deposit and ID are required.",
    },
    {
      title: "Cabin reservations & cancellations",
      body: "Full payment is due at the time of reservation. Visa and MasterCard are accepted. Cancellations received at least 72 hours before the reservation date qualify for a full refund less a $15 service charge.",
    },
    {
      title: "Pets in cabins",
      body: "Pets are not permitted in rental cabins. Please contact the office about pet policies for other stays.",
    },
    {
      title: "Campers & sites",
      body: "One RV per site, maximum of 2 cars. Persons must be 21 years or older, with ID required. The park defines a family as mom/dad and dependent children.",
    },
    {
      title: "Visitors & overnight guests",
      body: "Visitors must check in at the office. A pass is required and must be displayed on the left side window of your vehicle. Please confirm the current visitor fee, visitor departure time, and overnight registration deadline with the office before your visit. Overnight guests must sign up and pay at the office.",
    },
    {
      title: "Speed limit",
      body: "5 MPH, no exceptions. The park's posted rules specify a $100 violation fine for those who do not comply.",
    },
    {
      title: "Quiet time",
      body: "Quiet time is 10 pm to 8 am, except Friday and Saturday when it is midnight to 8 am.",
    },
    {
      title: "Dogs at campsites",
      body: "Dogs must be kept on a leash, quiet, and cleaned up after. Barking dogs will not be tolerated. Two dogs maximum per site. Pets cannot be left unattended. Do not chain pets to trees. Owners are responsible for accidents caused by dogs, if complying with campground rules.",
    },
    {
      title: "Children & water safety",
      body: "Children must be accompanied by an adult at all times. No children are allowed in the pool without adult supervision. Children must wear a life vest on the riverfront and on the pier at all times, with adult supervision. All children must be by their sites by 9 pm. No loud music or other disturbances during this time.",
    },
    {
      title: "Campfires",
      body: "Campfires are permitted in designated areas only. One fire per site. No bonfires. No burning of tires or other non-wood material. Bring your own pre-cut firewood or purchase it from the camp store. No construction materials or garbage in fire pits. Only branches, leaves, and firewood.",
    },
    {
      title: "Golf carts",
      body: "Golf carts must be registered in the office with proof of insurance. People under 18 years of age cannot drive golf carts in the park. Lights must be used on golf carts after dark; without lights, you cannot drive.",
    },
    {
      title: "Prohibited items & riding",
      body: "The park prohibits fireworks, firearms, big wheels, BB guns, bows and arrows, children with knives, slingshots, axes and hatchets, and saws of any kind. The posted rules direct guests to deposit these items in the office. Motorcycles must be driven to sites and parked. No joy riding. No bicycles after dark.",
    },
    {
      title: "Campsite refunds & departures",
      body: "No refunds for inclement weather, early departures, or eviction. The posted campsite rules specify that deposits are returned for cancellations received 48 hours before the reserved date, with a $15 cancellation fee per reserved site. Cabin reservations have the separate cancellation policy above. Campsite check-out is by 8 pm; the posted late check-out charge is $10 per hour. Notify management of any late check-out.",
    },
    {
      title: "Messages, activities & gates",
      body: "Emergency messages will be brought to your site. Other messages are displayed on the game room billboard. Ask at the store for special activities and events. Do not open the entrance gates for other people.",
    },
  ],
  parkRulesComplete: false,
  contact: {
    phone: "847-395-6090",
    email: "foxriver13@gmail.com",
    address: {
      street: "27884 W. Route 173",
      city: "Antioch",
      region: "IL",
      postalCode: "60002",
    },
    // Add the office pin from Google Maps before launch. See the README.
    geo: { latitude: null, longitude: null },
    season: "April 1 – October 20, 2026",
    languages: "English, Russian, Polish, Ukrainian & Spanish",
    facebookUrl: "https://www.facebook.com/FoxRiverRecreation/",
    googleProfileUrl: "",
  },
};
