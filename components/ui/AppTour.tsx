// Tour steps configuration
const tourSteps = [
  {
    id: 1,
    title: "Investment",
    description: "Track your stocks and crypto investments. Get insights and analytics for your portfolio.",
    icon: "trending-up" as const,
    position: { top: hp(20), left: wp(25) },
  },
  {
    id: 2,
    title: "Budgeting",
    description: "Manage your expenses and income. Set budgets and track your spending habits.",
    icon: "wallet" as const,
    position: { top: hp(35), left: wp(25) },
  },
  {
    id: 3,
    title: "Bookkeeping",
    description: "Track expenses, income, and manage your financial records in one place.",
    icon: "book" as const,
    position: { top: hp(50), left: wp(25) },
  },
  {
    id: 4,
    title: "Navigation",
    description: "Use the profile icon to quickly navigate between sections.",
    icon: "person-circle" as const,
    position: { top: hp(12), right: wp(20) },
  },
];
