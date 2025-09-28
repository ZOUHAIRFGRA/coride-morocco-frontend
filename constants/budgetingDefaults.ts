/**
 * Budgeting Default Categories and Icon Mappings
 * Defines default categories for new users and comprehensive icon options
 */

// Comprehensive icon mapping for all possible category types
export const CATEGORY_ICONS = {
  // Food & Dining
  "restaurant-outline": "Restaurant",
  "fast-food-outline": "Fast Food",
  "cafe-outline": "Coffee & Drinks",
  "wine-outline": "Alcohol & Bars",
  "cart": "Groceries",
  
  // Shopping
  "cart-outline": "Shopping",
  "bag-outline": "Clothing & Fashion",
  "shirt-outline": "Clothing",
  "watch-outline": "Jewelry & Accessories",
  "gift-outline": "Gifts",
  "book-outline": "Books & Media",
  "game-controller-outline": "Electronics & Gaming",
  "phone-portrait-outline": "Technology",
  
  // Transportation
  "car-outline": "Car & Fuel",
  "bus-outline": "Public Transport",
  "airplane-outline": "Travel & Flights",
  "train-outline": "Train & Metro",
  "bicycle-outline": "Bike & Scooter",
  "boat-outline": "Boat & Ferry",
  "car-sport-outline": "Car Maintenance",
  
  // Housing & Utilities
  "home-outline": "Housing & Rent",
  "flash-outline": "Electricity",
  "water-outline": "Water & Gas",
  "wifi-outline": "Internet & Phone",
  "tv-outline": "Cable & Streaming",
  "construct-outline": "Home Maintenance",
  "hammer-outline": "Home Repairs",
  "bed-outline": "Furniture",
  
  // Health & Wellness
  "medical-outline": "Medical & Health",
  "fitness-outline": "Fitness & Gym",
  "heart-outline": "Healthcare",
  "bandage": "Medications",
  "eyedrop-outline": "Vision & Dental",
  "leaf-outline": "Wellness & Spa",
  "walk-outline": "Sports & Activities",
  
  // Education & Personal
  "school-outline": "Education",
  "library-outline": "Courses & Training",
  "bookmark-outline": "Books & Learning",
  "musical-notes-outline": "Hobbies & Entertainment",
  "film-outline": "Movies & Shows",
  "headset-outline": "Music & Audio",
  "camera-outline": "Photography",
  
  // Business & Work
  "briefcase-outline": "Business & Work",
  "laptop-outline": "Office & Supplies",
  "trending-up-outline": "Investments",
  "wallet-outline": "Salary & Income",
  "card-outline": "Banking & Finance",
  "calculator-outline": "Taxes",
  "shield-checkmark-outline": "Insurance",
  
  // Family & Pets
  "people-outline": "Family & Kids",
  "paw-outline": "Pets & Animals",
  "accessibility": "Baby & Childcare",
  "people-circle-outline": "Social & Events",
  
  // Services & Subscriptions
  "cloud-outline": "Cloud Services",
  "apps-outline": "Apps & Software",
  "newspaper-outline": "News & Media",
  "mail-outline": "Postal & Shipping",
  
  // Miscellaneous
  "ellipsis-horizontal-outline": "Other",
  "alert-circle-outline": "Fees & Charges",
  "cash-outline": "Cash & ATM",
  "cut-outline": "Hair & Beauty",
  "star-outline": "Bonus"
};

// Default categories for new users
export const DEFAULT_CATEGORIES = [
  // Income Categories
  {
    name: "Salary",
    categoryType: "income",
    icon: "wallet-outline",
    color: "#2ECC71"
  },
  {
    name: "Freelance",
    categoryType: "income", 
    icon: "laptop-outline",
    color: "#27AE60"
  },
  {
    name: "Investment",
    categoryType: "income",
    icon: "trending-up-outline", 
    color: "#16A085"
  },
  {
    name: "Bonus",
    categoryType: "income",
    icon: "star-outline",
    color: "#F39C12"
  },
  
  // Expense Categories
  {
    name: "Food & Dining",
    categoryType: "expense",
    icon: "restaurant-outline",
    color: "#E74C3C"
  },
  {
    name: "Transportation", 
    categoryType: "expense",
    icon: "car-outline",
    color: "#3498DB"
  },
  {
    name: "Shopping",
    categoryType: "expense", 
    icon: "cart-outline",
    color: "#E91E63"
  },
  {
    name: "Housing",
    categoryType: "expense",
    icon: "home-outline", 
    color: "#9B59B6"
  },
  {
    name: "Utilities",
    categoryType: "expense",
    icon: "flash-outline",
    color: "#F1C40F"
  },
  {
    name: "Healthcare",
    categoryType: "expense",
    icon: "medical-outline",
    color: "#E67E22"
  },
  {
    name: "Entertainment",
    categoryType: "expense",
    icon: "game-controller-outline",
    color: "#8E44AD"
  },
  {
    name: "Education",
    categoryType: "expense",
    icon: "school-outline",
    color: "#2980B9"
  },
  {
    name: "Personal Care",
    categoryType: "expense",
    icon: "cut-outline",
    color: "#FF6B6B"
  },
  {
    name: "Travel",
    categoryType: "expense",
    icon: "airplane-outline",
    color: "#4ECDC4"
  },
  {
    name: "Insurance",
    categoryType: "expense",
    icon: "shield-outline",
    color: "#45B7D1"
  },
  {
    name: "Gifts & Donations",
    categoryType: "expense",
    icon: "gift-outline",
    color: "#96CEB4"
  },
  {
    name: "Other",
    categoryType: "expense",
    icon: "ellipsis-horizontal-outline",
    color: "#95A5A6"
  },
  {
    name: "Gym",
    categoryType: "expense",
    icon: "fitness-outline",
    color: "#96CEB4"
  },
  {
    name: "Clothing",
    categoryType: "expense",
    icon: "shirt-outline",
    color: "#96CEB4"
  },
  {
    name: "Alcohol & Bars",
    categoryType: "expense",
    icon: "wine-outline",
    color: "#96CEB4"
  },
  
];

// Helper function to get icon name from display name
export const getIconFromDisplayName = (displayName: string): string => {
  const entry = Object.entries(CATEGORY_ICONS).find(([_, name]) => name === displayName);
  return entry ? entry[0] : "help-circle-outline";
};

// Helper function to get display name from icon
export const getDisplayNameFromIcon = (icon: string): string => {
  return CATEGORY_ICONS[icon as keyof typeof CATEGORY_ICONS] || "Other";
};

// Comprehensive color palette with 30 unique colors
export const CATEGORY_COLOR_PALETTE = [
  // Primary colors
  "#E74C3C", // Red
  "#3498DB", // Blue
  "#2ECC71", // Green
  "#F1C40F", // Yellow
  "#9B59B6", // Purple
  "#E67E22", // Orange
  "#1ABC9C", // Teal
  "#34495E", // Dark Blue Gray
  
  // Secondary colors
  "#E91E63", // Pink
  "#8E44AD", // Dark Purple
  "#16A085", // Dark Teal
  "#F39C12", // Dark Orange
  "#27AE60", // Dark Green
  "#2980B9", // Dark Blue
  "#C0392B", // Dark Red
  "#7F8C8D", // Gray
  
  // Tertiary colors
  "#D35400", // Burnt Orange
  "#8B4513", // Saddle Brown
  "#2C3E50", // Midnight Blue
  "#00CED1", // Dark Turquoise
  "#FF69B4", // Hot Pink
  "#32CD32", // Lime Green
  "#FF4500", // Orange Red
  
  // Additional colors
  "#9370DB", // Medium Purple
  "#3CB371", // Medium Sea Green
  "#FF6347", // Tomato
  "#20B2AA", // Light Sea Green
  "#FF1493", // Deep Pink
  "#00FA9A", // Medium Spring Green
  "#FFD700", // Gold
  "#FF6B6B", // Light Coral
];

export const FALLBACK_COLOR = "#95A5A6";

// Utility function to assign unique colors to categories
export const assignUniqueColorsToCategories = (categories: any[]): { [key: string]: string } => {
  const assignedColors: { [key: string]: string } = {};
  const usedColors = new Set<string>();
  let paletteIndex = 0;

  // First pass: assign colors to categories
  categories.forEach((cat) => {
    // Find the next available color from palette
    while (paletteIndex < CATEGORY_COLOR_PALETTE.length && usedColors.has(CATEGORY_COLOR_PALETTE[paletteIndex])) {
      paletteIndex++;
    }
    
    let color = CATEGORY_COLOR_PALETTE[paletteIndex];
    if (!color) {
      // If we run out of palette colors, use fallback
      color = FALLBACK_COLOR;
    }
    
    const categoryKey = cat.uuid || cat.name;
    assignedColors[categoryKey] = color;
    usedColors.add(color);
    paletteIndex++;
  });

  return assignedColors;
};

// Legacy function for backward compatibility
export const getDefaultCategoryColor = (categoryName: string): string => {
  const colorMap: { [key: string]: string } = {
    "Salary": "#2ECC71",
    "Freelance": "#27AE60", 
    "Investment": "#16A085",
    "Bonus": "#F39C12",
    "Food & Dining": "#E74C3C",
    "Transportation": "#3498DB",
    "Shopping": "#E91E63",
    "Housing": "#9B59B6",
    "Utilities": "#F1C40F",
    "Healthcare": "#E67E22",
    "Entertainment": "#8E44AD",
    "Education": "#2980B9",
    "Other": "#95A5A6"
  };
  
  return colorMap[categoryName] || "#95A5A6";
}; 