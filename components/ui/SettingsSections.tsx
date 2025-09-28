/* eslint-disable react/display-name */
import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Switch, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useRouter } from "expo-router";
import SettingsSection from "./SettingsSection";
import { COLORS } from "@/constants/theme";
import { iconMapping } from "@/constants/icons";

// Types
export type AccountType = {
  id: number | string;
  name: string;
  balance: string;
  icon: string;
  moduleKeys: string[];
  institution?: string;
  mask?: string;
  type?: string;
  accountType?: string;
  subtype?: string;
  uuid?: string;
  active?: boolean;
  balances?: {
    limit: number;
    current: number;
    available: number;
    isoCurrencyCode: string;
    unofficialCurrencyCode: string;
  };
};

export type ExpenseType = {
  id: string; // This is a base64 global ID like "UmVjb3JkTm9kZTo0..."
  uuid: string;
  amount: string;
  description: string;
  recordType: "INCOME" | "EXPENSE";
  createdAt: string;
  updatedAt: string;
  plaidTransactionId: string | null;
  account: {
    id: string;
    uuid: string;
    name: string;
  };
  category: {
    id: string;
    uuid: string;
    name: string;
    icon: string;
  };
};


export type IncomeType = {
  id: string;
  uuid: string;
  amount: string;
  description: string;
  recordType: "INCOME" | "EXPENSE";
  createdAt: string;
  updatedAt: string;
  plaidTransactionId: string | null;
  account: {
    id: string;
    uuid: string;
    name: string;
  };
  category: {
    id: string;
    uuid: string;
    name: string;
    icon: string;
  };
};


export type BudgetType = {
  uuid: string;
  amount: string;
  period: string;
  balanceCarryOver: boolean;
  predictiveMode: boolean;
  category: {
    name: string;
    uuid: string;
    icon: string;
    records: {
      edges: {
        node: {
          amount: string;
          recordType: "INCOME" | "EXPENSE";
          createdAt: string;
          description: string;
          uuid: string;
          account: {
            uuid: string;
            name: string;
            accountType: string;
          };
        };
      }[];
    };
  };
};

export type CategoryType = {
  uuid: string;
  name: string;
  icon: string;
  categoryType: "income" | "expense";
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Renders an icon based on the icon name
 */
export const renderIcon = (iconName: string) => {
  switch (iconName) {
    case "cash":
      return <Ionicons name="cash-outline" size={wp(6)} color="#4DA6FF" />;
    case "bank":
      return <Ionicons name="business-outline" size={wp(6)} color="#4DA6FF" />;
    case "card":
      return <Ionicons name="card-outline" size={wp(6)} color="#4DA6FF" />;
    case "cart":
      return <Ionicons name="cart-outline" size={wp(6)} color="#4DA6FF" />;
    case "shirt":
      return <Ionicons name="shirt-outline" size={wp(6)} color="#4DA6FF" />;
    case "restaurant":
      return <Ionicons name="restaurant-outline" size={wp(6)} color="#4DA6FF" />;
    case "wallet":
      return <Ionicons name="wallet-outline" size={wp(6)} color="#4DA6FF" />;
    case "save":
      return <Ionicons name="save-outline" size={wp(6)} color="#4DA6FF" />;
    default:
      return <Ionicons name="help-circle-outline" size={wp(6)} color="#4DA6FF" />;
  }
};

export const renderCategoryIcon = (iconName: any) => {
  return <Ionicons name={iconName} size={wp(6)} color="#4DA6FF" />;
};

/**
 * Balance section component
 */
export const BalanceSection = React.memo(({
  expanded,
  onToggle,
  carryOver,
  predictiveMode,
  onCarryOverChange,
  onPredictiveModeChange,
}: {
  expanded: boolean;
  onToggle: () => void;
  carryOver: boolean;
  predictiveMode: boolean;
  onCarryOverChange: (value: boolean) => void;
  onPredictiveModeChange: (value: boolean) => void;
}) => {
  return (
    <SettingsSection title="Balance" expanded={expanded} onToggle={onToggle}>
      <View className="flex-row items-center my-[1vh] pl-[1vw]">
        <Switch value={carryOver} onValueChange={onCarryOverChange} trackColor={{ false: "#E0E0E0", true: "#4DA6FF" }} thumbColor="#fff" />
        <Text className="text-[1.8vh] text-gray-800 ml-[3vw] font-regular">Carry over</Text>
      </View>

      <View className="flex-row items-center my-[1vh] pl-[1vw]">
        <Switch value={predictiveMode} onValueChange={onPredictiveModeChange} trackColor={{ false: "#E0E0E0", true: "#4DA6FF" }} thumbColor="#fff" />
        <Text className="text-[1.8vh] text-gray-800 ml-[3vw] font-regular">Predictive mode</Text>
      </View>
    </SettingsSection>
  );
});

/**
 * Accounts section component
 */
export const AccountsSection = React.memo(({
  expanded,
  onToggle,
  accounts,
  isLoading,
  isError,
  onRefetch,
  onAccountClick,
  onAddAccount,
  isModalTransitioning,
  onOpenPlaidModal,
  onOpenAccountModal,
  onAddFunds,
  title
}: {
  title: string
  expanded: boolean;
  onToggle: () => void;
  accounts: AccountType[];
  isLoading: boolean;
  isError: boolean;
  onRefetch: () => void;
  onAccountClick: (account: AccountType) => void;
  onAddAccount: () => void;
  isModalTransitioning: boolean;
  onOpenPlaidModal: () => void;
  onOpenAccountModal: () => void;
  onAddFunds: (accountId: string | number) => void;
}) => {
  console.log("🔍 AccountsSection - Received accounts:", accounts);
  console.log("🔍 AccountsSection - Account types:", accounts.map(acc => ({ name: acc.name, balance: acc.balance, balanceType: typeof acc.balance })));
  
  // Ensure all accounts have the correct format
  const normalizedAccounts = (accounts || []).map((account: any) => {
    if (!account || typeof account !== 'object') {
      console.warn("🔍 AccountsSection - Invalid account object:", account);
      return {
        id: "invalid",
        name: "Invalid Account",
        balance: "$0",
        icon: "bank",
        type: "unknown",
        moduleKeys: [],
        institution: "Unknown",
        mask: ""
      };
    }
    
    return {
      ...account,
      balance: (() => {
        try {
          if (!account.balance) return "$0";
          if (typeof account.balance === 'string') return account.balance;
          if (typeof account.balance === 'number') {
            return `$${account.balance.toFixed(2)}`;
          }
          // Handle any other type by converting to string first
          const balanceStr = String(account.balance);
          const balanceNum = parseFloat(balanceStr);
          if (!isNaN(balanceNum)) {
            return `$${balanceNum.toFixed(2)}`;
          }
          return "$0";
        } catch (error) {
          console.warn("🔍 AccountsSection - Error formatting balance:", error, account);
          return "$0";
        }
      })(),
      icon: account.icon || "bank",
      type: account.type || (account.accountType === "BUDGETING_CASH" ? "Cash" : "unknown"),
      moduleKeys: Array.isArray(account.moduleKeys) ? account.moduleKeys : [],
      institution: account.institution || "Unknown",
        mask: account.mask || ""
    };
  });
  
  console.log("🔍 AccountsSection - Normalized accounts:", normalizedAccounts);
  
  const router = useRouter();

  return (
    <SettingsSection title={title} expanded={expanded} onToggle={onToggle}>
      {isLoading ? (
        <View className="items-center justify-center py-[4vh] my-[2vh]">
          <Text>Loading accounts...</Text>
        </View>
      ) : isError ? (
        <View className="items-center justify-center py-[4vh] my-[2vh]">
          <Text>Error loading accounts. Please try again.</Text>
          <TouchableOpacity className="self-end mt-[1vh] mr-[1vw] flex-row items-center p-[1.5vw]" onPress={onRefetch}>
            <Text className="text-[1.6vh] text-[#4DA6FF] ml-[1vw] font-semiBold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : accounts.length === 0 ? (
        <View className="items-center justify-center py-[4vh] my-[2vh]">
          <View className="w-[16vw] h-[16vw] rounded-full bg-primary-oceanBlue50 justify-center items-center mb-[2vh]">
            <Ionicons name="wallet-outline" size={wp(8)} color="#4DA6FF" />
          </View>
          <Text className="text-[2vh] text-primary-text mb-[1vh] font-semiBold">No accounts yet</Text>
          <Text className="text-[1.6vh] text-secondary-text text-center mx-[4vw] mb-[2vh] font-regular">
            Connect your bank account or add one manually
          </Text>
        </View>
      ) : (
        normalizedAccounts.map((account) => {
          console.log("🔍 AccountsSection - Rendering account:", account.name, "with balance:", account.balance, "type:", typeof account.balance);
          return (
            <TouchableOpacity
              key={account.id}
              className="flex-row items-center my-3 bg-white"
              onPress={() => onAccountClick(account)}
              activeOpacity={0.7}
              disabled={isModalTransitioning}
            >
            <View className="w-[10vw] h-[10vw] rounded-full bg-primary-oceanBlue50 justify-center items-center mr-[3vw]">
              {renderIcon(account.icon || "bank")}
            </View>
            <View className="flex-1">
              <Text className="text-[1.8vh] text-gray-800 font-semiBold">{account.name}</Text>
              {account.name === "Cash Account" ? (
                <TouchableOpacity
                  className="bg-primary-oceanBlue50 flex-row items-center justify-center rounded-full px-2 py-1 mt-1 w-32"
                  onPress={() => onAddFunds(account.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={wp(5)} color="#4DA6FF" />
                  <Text className="text-[1.4vh] text-[#4DA6FF] font-semiBold">Add Funds</Text>
                </TouchableOpacity>
              ) : (
                <View className="flex-row items-center">
                  {account.institution && (
                    <Text className="text-md text-gray-500 font-regular mt-1">{account.institution} </Text>
                  )}
                  {account.mask && (
                    <Text className="text-md text-gray-500 font-medium">(****{account.mask})</Text>
                  )}
                </View>
              )}
              {account.balances?.limit && (
                <Text className="text-[1.4vh] text-gray-500 font-regular">Credit Limit: ${account.balances.limit.toFixed(2)}</Text>
              )}
            </View>
            <View className="flex-col items-end">
              <Text className={`text-[1.8vh] text-green-600 font-bold`}>
                {account.balance || "$0"}
              </Text>
              {account.type && (
                <View className="bg-primary-oceanBlue50 rounded-full px-[1.5vw] py-[0.4vh] mt-[0.5vh]">
                  <Text className="text-[1.3vh] text-primary-oceanBlue700 font-semiBold">
                    {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
        })
      )}

      {/* Add Account Button */}
      <TouchableOpacity
        className="self-end mt-[1vh] mr-[1vw] flex-row items-center p-[1.5vw]"
        activeOpacity={0.7}
        disabled={isModalTransitioning}
        onPress={() => {
          Alert.alert("Add Account", "Connect your bank account to import your accounts", [
            {
              text: "Connect Bank",
              onPress: onOpenPlaidModal,
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]);
        }}
      >
        <Ionicons name="add" size={wp(5)} color="#4DA6FF" />
        <Text className="text-[1.6vh] text-[#4DA6FF] ml-[1vw] font-semiBold">Connect Account</Text>
      </TouchableOpacity>

    </SettingsSection>
  );
});

/**
 * Expenses section component
 */
export const ExpensesSection = React.memo(({
  expanded,
  onToggle,
  expenses,
  onAddExpense,
}: {
  expanded: boolean;
  onToggle: () => void;
  expenses: ExpenseType[];
  onAddExpense: () => void;
}) => {
  return (
    <SettingsSection title="Expenses" expanded={expanded} onToggle={onToggle}>
      {expenses.map((expense) => (
        <View key={expense.id} className="flex-row items-center my-[1vh]">
          <View className="w-[10vw] h-[10vw] rounded-full bg-primary-oceanBlue50 justify-center items-center mr-[3vw]">
            {renderCategoryIcon(expense.category?.icon)}
          </View>
          <View className="flex-1">
            <Text className="text-[1.8vh] text-gray-800 font-semiBold">{expense.category?.name}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className={`text-[1.8vh] mr-[1vw] font-semiBold`}>{expense.amount}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity className="self-end mt-[1vh] mr-[1vw] flex-row items-center p-[1.5vw]" onPress={onAddExpense}>
        <Ionicons name="add" size={wp(5)} color="#4DA6FF" />
        <Text className="text-[1.6vh] text-[#4DA6FF] ml-[1vw] font-semiBold">Add Expense</Text>
      </TouchableOpacity>
    </SettingsSection>
  );
});

/**
 * Income section component
 */
export const IncomeSection = React.memo(({
  expanded,
  onToggle,
  incomes,
  onAddIncome,
}: {
  expanded: boolean;
  onToggle: () => void;
  incomes: IncomeType[];
  onAddIncome: () => void;
}) => {
  return (
    <SettingsSection title="Income" expanded={expanded} onToggle={onToggle}>
      {incomes.map((income) => (
        <View key={income.id} className="flex-row items-center my-[1vh]">
          <View className="w-[10vw] h-[10vw] rounded-full bg-primary-oceanBlue50 justify-center items-center mr-[3vw]">
            {renderCategoryIcon(income.category?.icon)}
          </View>
          <View className="flex-1">
            <Text className="text-[1.8vh] text-gray-800 font-semiBold">{income.category?.name}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className={`text-[1.8vh] mr-[1vw] font-semiBold`}>{income.amount}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity className="self-end mt-[1vh] mr-[1vw] flex-row items-center p-[1.5vw]" onPress={onAddIncome}>
        <Ionicons name="add" size={wp(5)} color="#4DA6FF" />
        <Text className="text-[1.6vh] text-[#4DA6FF] ml-[1vw] font-semiBold">Add Income</Text>
      </TouchableOpacity>
    </SettingsSection>
  );
});

/**
 * Budgets section component
 */
export const BudgetsSection = React.memo(({
  expanded,
  onToggle,
  budgets,
  onAddBudget,
  isModalTransitioning,
  isLoading,
  onRefetch,
  onEditBudget,
  onDeleteBudget,
}: {
  expanded: boolean;
  onToggle: () => void;
  budgets: BudgetType[];
  onAddBudget: () => void;
  isModalTransitioning: boolean;
  isLoading: boolean;
  onRefetch: () => void;
  onEditBudget: (budget: BudgetType) => void;
  onDeleteBudget: (budget: BudgetType) => void;
}) => {
  const [expandedBudgets, setExpandedBudgets] = useState<Set<string>>(new Set());

  const toggleBudgetExpansion = useCallback((budgetUuid: string) => {
    setExpandedBudgets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(budgetUuid)) {
        newSet.delete(budgetUuid);
      } else {
        newSet.add(budgetUuid);
      }
      return newSet;
    });
  }, []);

  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    return `$ ${numAmount.toFixed(2)}`;
  };

  const getAmountColor = (amount: string) => {
    const numAmount = parseFloat(amount);
    return numAmount >= 0 ? COLORS.success.light : COLORS.error.light;
  };

  return (
    <SettingsSection title="Budgets" expanded={expanded} onToggle={onToggle}>
      
      {budgets.map((budget) => {
        // console.log("🔍 BudgetsSection - Budget:", budget);
        // console.log("🔍 BudgetsSection - Budget.category.records.account.:", budget.category.records?.edges);
        const isExpanded = expandedBudgets.has(budget.uuid);
        
        // Calculate spending from records
        const records = budget.category.records?.edges?.map(edge => edge.node) || [];
        const totalSpent = records
          .filter(record => record.recordType === 'EXPENSE')
          .reduce((sum, record) => sum + parseFloat(record.amount), 0);
        
        const budgetAmount = parseFloat(budget.amount);
        const remaining = budgetAmount - totalSpent;
        const spentPercentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;
    
        console.log("🔍 BudgetsSection - Calculations:", {
          category: budget.category.name,
          budgetAmount,
          totalSpent,
          remaining,
          spentPercentage: `${spentPercentage.toFixed(1)}%`,
          
        });
        
        // Show total spent amount, color red if it exceeds budget
        const displayAmount = totalSpent;
        const amountColor = totalSpent > budgetAmount ? COLORS.error.light : COLORS.success.light;
        const balanceColor = remaining >= 0 ? COLORS.success.light : COLORS.error.light;
        
        return (
          <View key={budget.uuid} className="my-[1vh]">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center flex-1">
                <View className="w-[10vw] h-[10vw] rounded-full bg-primary-oceanBlue50 justify-center items-center mr-[3vw]">
                  {renderCategoryIcon(budget.category.icon)}
                </View>
                <Text className="text-[1.8vh] text-gray-800 font-semiBold">{budget.category.name}</Text>
              </View>
              <View className="flex-row items-center">
                <Text 
                  className={`text-[1.8vh] mr-[1vw] font-semiBold`}
                  style={{ color: amountColor }}
                >
                  {formatAmount(displayAmount.toString())}
                </Text>
                <TouchableOpacity
                  onPress={() => toggleBudgetExpansion(budget.uuid)}
                  className="mr-[2vw] p-[1vw]"
                >
                  <Ionicons 
                    name={isExpanded ? "chevron-down" : "chevron-forward"} 
                    size={wp(4)} 
                    color={COLORS.primary.oceanBlue700} 
                  />
                </TouchableOpacity>
                {/* Edit and Delete icons commented out to match design */}
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => onEditBudget(budget)}
                    className="mr-[3vw] p-[1vw]"
                  >
                    <Ionicons name="pencil" size={wp(4)} color={COLORS.primary.oceanBlue700} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onDeleteBudget(budget)}
                    className="p-[1vw]"
                  >
                    <Ionicons name="trash" size={wp(4)} color={COLORS.error.light} />
                  </TouchableOpacity>
                </View>
               
              </View>
            </View>
            
            {/* Expanded Details */}
            {isExpanded && (
              <View className="mt-[1vh] mb-[1vh]">
                <View className="pl-[13vw]">
                  <View className="mb-[1vh] flex-row justify-between items-center" style={{ height: 24, paddingRight: 25, paddingLeft: 40 }}>
                    <Text 
                      className="text-[1.4vh] text-gray-600 font-semiBold"
                      style={{ 
                        fontSize: 12,
                        lineHeight: 12,
                        letterSpacing: 0.24,
                        fontFamily: 'Montserrat',
                        fontWeight: '600'
                      }}
                    >
                      Budgeted amount
                    </Text>
                    <Text 
                      className="text-[1.4vh] text-gray-800 font-regular"
                      style={{ 
                        fontSize: 16,
                        lineHeight: 24,
                        letterSpacing: 0.32,
                        fontFamily: 'Montserrat',
                        fontWeight: '400',
                        textAlign: 'right'
                      }}
                    >
                      {formatAmount(budget.amount)}
                    </Text>
                  </View>
              
                  <View className="flex-row justify-between items-center" style={{ height: 24, paddingRight: 25, paddingLeft: 40 }}>
                    <Text 
                      className="text-[1.4vh] text-gray-600 font-semiBold"
                      style={{ 
                        fontSize: 12,
                        lineHeight: 12,
                        letterSpacing: 0.24,
                        fontFamily: 'Montserrat',
                        fontWeight: '600'
                      }}
                    >
                      Period
                    </Text>
                    <Text 
                      className="text-[1.4vh] text-gray-800 font-regular"
                      style={{ 
                        fontSize: 16,
                        lineHeight: 24,
                        letterSpacing: 0.32,
                        fontFamily: 'Montserrat',
                        fontWeight: '400',
                        textAlign: 'right'
                      }}
                    >
                      {budget.period}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center" style={{ height: 24, paddingRight: 25, paddingLeft: 40 }}>
                    <Text 
                      className="text-[1.4vh] text-gray-600 font-semiBold"
                      style={{ fontSize: 12, lineHeight: 12, letterSpacing: 0.24, fontFamily: 'Montserrat', fontWeight: '800' }}
                    >
                      Balance
                    </Text>
                    <Text 
                      className="text-[1.4vh] font-regular"
                      style={{ 
                        fontSize: 16,
                        lineHeight: 24,
                        letterSpacing: 0.32,
                        fontFamily: 'Montserrat',
                        fontWeight: '800',
                        textAlign: 'right',
                        color: balanceColor
                      }}
                    >
                      {formatAmount(remaining.toString())}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            
           
          </View>
        );
      })}
      
      {budgets.length === 0 && (
        <View className="items-center justify-center py-[4vh] my-[2vh]">
          <Text className="text-[1.6vh] text-gray-500">No budgets found</Text>
        </View>
      )}

      <TouchableOpacity
        className="self-end mt-[1vh] mr-[1vw] flex-row items-center p-[1.5vw]"
        onPress={onAddBudget}
        activeOpacity={0.7}
        disabled={isModalTransitioning}
      >
        <Ionicons name="add" size={wp(5)} color="#4DA6FF" />
        <Text className="text-[1.6vh] text-primary-oceanBlue700 ml-[1vw] font-semiBold">Add Budget</Text>
      </TouchableOpacity>
    </SettingsSection>
  );
});

/**
 * Categories section component
 */
export const CategoriesSection = React.memo(({
  expanded,
  onToggle,
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddIncomeCategory,
  onAddExpenseCategory,
  isLoading,
}: {
  expanded: boolean;
  onToggle: () => void;
  categories: CategoryType[];
  onAddCategory: () => void;
  onEditCategory: (category: CategoryType) => void;
  onDeleteCategory: (category: CategoryType) => void;
  onAddIncomeCategory?: () => void;
  onAddExpenseCategory?: () => void;
  isLoading: boolean;
}) => {
  const renderCategoryIcon = useCallback((iconName: string) => {
    // Normalize icon name to handle case sensitivity
    const normalizedIconName = iconName?.toLowerCase();

    
    // Get the mapped icon name or use the original if not found
    const iconToUse = iconMapping[normalizedIconName] || iconName || 'help-circle-outline';
    
    return <Ionicons name={iconToUse as any} size={wp(5)} color="#4DA6FF" />;
  }, []);

  // Helper function to normalize category type
  const normalizeCategoryType = (categoryType: string) => {
    return categoryType?.toLowerCase();
  };

  // Filter categories by type with case-insensitive comparison
  const incomeCategories = categories.filter(cat => normalizeCategoryType(cat.categoryType) === "income");
  const expenseCategories = categories.filter(cat => normalizeCategoryType(cat.categoryType) === "expense");

  return (
    <SettingsSection title="Categories" expanded={expanded} onToggle={onToggle}>
      <View className="mb-[2vh]">
        <Text className="text-[1.8vh] text-gray-600 font-regular mb-[1.5vh]">Manage your expense and income categories</Text>
        
      </View>

      {isLoading ? (
        <View className="items-center py-[4vh]">
          <Text className="text-[1.6vh] text-gray-500">Loading categories...</Text>
        </View>
      ) : categories.length === 0 ? (
        <View className="items-center py-[4vh]">
          <Text className="text-[1.6vh] text-gray-500">No categories found</Text>
          <TouchableOpacity
            onPress={onAddCategory}
            className="mt-[2vh] bg-blue-500 px-[4vw] py-[1.5vh] rounded-lg"
          >
            <Text className="text-white text-[1.6vh] font-medium">Create First Category</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {/* Income Categories */}
          <View className="mb-[3vh]">
            <View className="flex-row items-center justify-between mb-[1.5vh]">
              <Text className="text-[1.8vh] text-green-600 font-semibold">Income Categories</Text>
              {onAddIncomeCategory && (
                <TouchableOpacity 
                  className="flex-row items-center p-[1vw]" 
                  onPress={onAddIncomeCategory}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={wp(4)} color="#4DA6FF" />
                  <Text className="text-[1.4vh] text-[#4DA6FF] ml-[0.5vw] font-semiBold">Add</Text>
                </TouchableOpacity>
              )}
            </View>
            {incomeCategories.map((category) => (
                <View key={category.uuid} className="flex-row items-center justify-between bg-gray-50 p-[3vw] rounded-lg mb-[1vh]">
                  <View className="flex-row items-center flex-1">
                    <View className="mr-[3vw]">
                      {renderCategoryIcon(category.icon)}
                    </View>
                    <Text className="text-[1.8vh] text-gray-800 font-medium flex-1">{category.name}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => onEditCategory(category)}
                      className="mr-[3vw] p-[1vw]"
                    >
                      <Ionicons name="pencil" size={wp(4)} color="#4DA6FF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onDeleteCategory(category)}
                      className="p-[1vw]"
                    >
                      <Ionicons name="trash" size={wp(4)} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </View>

          {/* Expense Categories */}
          <View>
            <View className="flex-row items-center justify-between mb-[1.5vh]">
              <Text className="text-[1.8vh] text-red-600 font-semibold">Expense Categories</Text>
              {onAddExpenseCategory && (
                <TouchableOpacity 
                  className="flex-row items-center p-[1vw]" 
                  onPress={onAddExpenseCategory}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={wp(4)} color="#4DA6FF" />
                  <Text className="text-[1.4vh] text-[#4DA6FF] ml-[0.5vw] font-semiBold">Add</Text>
                </TouchableOpacity>
              )}
            </View>
            {expenseCategories.map((category) => (
                <View key={category.uuid} className="flex-row items-center justify-between bg-gray-50 p-[3vw] rounded-lg mb-[1vh]">
                  <View className="flex-row items-center flex-1">
                    <View className="mr-[3vw]">
                      {renderCategoryIcon(category.icon)}
                    </View>
                    <Text className="text-[1.8vh] text-gray-800 font-medium flex-1">{category.name}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => onEditCategory(category)}
                      className="mr-[2vw] p-[1vw]"
                    >
                      <Ionicons name="pencil" size={wp(4)} color="#4DA6FF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onDeleteCategory(category)}
                      className="p-[1vw]"
                    >
                      <Ionicons name="trash" size={wp(4)} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </View>
        </View>
      )}
    </SettingsSection>
  );
});

/**
 * General settings section component
 */
export const GeneralSettingsSection = ({
  expanded,
  onToggle,
  onUpgradeToPro,
  isModalTransitioning,
}: {
  expanded: boolean;
  onToggle: () => void;
  onUpgradeToPro: () => void;
  isModalTransitioning: boolean;
}) => {
  const router = useRouter();

  return (
    <SettingsSection title="General Settings" expanded={expanded} onToggle={onToggle}>
      <TouchableOpacity className="flex-row items-center my-[1vh]" onPress={onUpgradeToPro} activeOpacity={0.7} disabled={isModalTransitioning}>
        <View className="w-[10vw] h-[10vw] rounded-full bg-primary-oceanBlue50 justify-center items-center mr-[3vw]">
          <Ionicons name="arrow-up-circle-outline" size={wp(6)} color="#4DA6FF" />
        </View>
        <View className="flex-1">
          <Text className="text-[1.8vh] text-gray-800 font-semiBold">Upgrade to Pro</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-row items-center my-[1vh]"
        onPress={() => router.push("/investment/terms?section=privacy" as any)}
        activeOpacity={0.7}
        disabled={isModalTransitioning}
      >
        <View className="w-[10vw] h-[10vw] rounded-full bg-primary-oceanBlue50 justify-center items-center mr-[3vw]">
          <Ionicons name="document-text-outline" size={wp(6)} color="#4DA6FF" />
        </View>
        <View className="flex-1">
          <Text className="text-[1.8vh] text-gray-800 font-semiBold">Terms & Privacy</Text>
        </View>
        <Ionicons name="chevron-forward" size={wp(4)} color="#999" />
      </TouchableOpacity>

      <View className="flex-row items-center my-[1vh]">
        <View className="w-[10vw] h-[10vw] rounded-full bg-primary-oceanBlue50 justify-center items-center mr-[3vw]">
          <Ionicons name="language-outline" size={wp(6)} color="#4DA6FF" />
        </View>
        <View className="flex-1">
          <Text className="text-[1.8vh] text-gray-800 font-semiBold">Language</Text>
        </View>
      </View>

      <View className="flex-row items-center my-[1vh]">
        <View className="w-[10vw] h-[10vw] rounded-full bg-primary-oceanBlue50 justify-center items-center mr-[3vw]">
          <Ionicons name="cash-outline" size={wp(6)} color="#4DA6FF" />
        </View>
        <View className="flex-1">
          <Text className="text-[1.8vh] text-gray-800 font-semiBold">Currency</Text>
        </View>
      </View>
    </SettingsSection>
  );
};

/**
 * Data backup section component
 */
export const DataBackupSection = ({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) => {
  return (
    <SettingsSection title="Data Backup" expanded={expanded} onToggle={onToggle}>
      <View className="flex-row items-center my-[1vh]">
        <View className="w-[10vw] h-[10vw] rounded-full bg-primary-oceanBlue50 justify-center items-center mr-[3vw]">
          <Ionicons name="logo-google" size={wp(6)} color="#4DA6FF" />
        </View>
        <View className="flex-1">
          <Text className="text-[1.8vh] text-gray-800 font-semiBold">Google Drive</Text>
        </View>
      </View>

      <View className="flex-row items-center my-[1vh]">
        <View className="w-[10vw] h-[10vw] rounded-full bg-primary-oceanBlue50 justify-center items-center mr-[3vw]">
          <Ionicons name="cloud-upload-outline" size={wp(6)} color="#4DA6FF" />
        </View>
        <View className="flex-1">
          <Text className="text-[1.8vh] text-gray-800 font-semiBold">Create backup</Text>
        </View>
      </View>

      <View className="flex-row items-center my-[1vh]">
        <View className="w-[10vw] h-[10vw] rounded-full bg-primary-oceanBlue50 justify-center items-center mr-[3vw]">
          <Ionicons name="cloud-download-outline" size={wp(6)} color="#4DA6FF" />
        </View>
        <View className="flex-1">
          <Text className="text-[1.8vh] text-gray-800 font-semiBold">Restore data</Text>
        </View>
      </View>
    </SettingsSection>
  );
};
