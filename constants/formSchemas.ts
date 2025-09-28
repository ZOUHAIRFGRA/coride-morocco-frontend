/**
 * Form Schema Registry
 * Central location for all form definitions using JSON Schema format
 * Adding or changing a form should only require editing this file
 */

import { COUNTRIES } from './countries';
import { CATEGORY_ICONS } from './budgetingDefaults';

export interface FormField {
  type: string;
  title: string;
  description?: string;
  format?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  enum?: string[] | number[];
  enumNames?: string[];
  items?: any;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

export interface FormSchema {
  title: string;
  description: string;
  type: string;
  properties: Record<string, FormField>;
  required: string[];
}

export interface UISchemaField {
  "ui:widget"?: string;
  "ui:options"?: Record<string, any>;
  "ui:placeholder"?: string;
  "ui:help"?: string;
  "ui:description"?: string;
}

export interface FormDefinition {
  schema: FormSchema;
  uiSchema: Record<string, UISchemaField>;
  mutation: string;
  successMessage: string;
  errorMessage?: string;
}

export const formSchemas: Record<string, FormDefinition> = {
  createAlpacaAccount: {
    schema: {
      title: "Create Alpaca Account",
      description: "Register for a new Alpaca brokerage account.",
      type: "object",
      properties: {
        emailAddress: {
          type: "string",
          title: "Email Address",
          format: "email",
          description: "Your email address for account verification"
        },
        phoneNumber: {
          type: "string",
          title: "Phone Number",
          maxLength: 30,
          description: "Your phone number for account verification"
        },
        streetAddress: {
          type: "string",
          title: "Street Address",
          maxLength: 100,
          description: "Your full street address"
        },
        city: {
          type: "string",
          title: "City",
          maxLength: 70,
          description: "City where you reside"
        },
        state: {
          type: "string",
          title: "State",
          maxLength: 70,
          description: "State or province where you reside"
        },
        postalCode: {
          type: "string",
          title: "Postal Code",
          maxLength: 20,
          description: "Your postal or ZIP code"
        },
        country: {
          type: "string",
          title: "Country",
          maxLength: 70,
          enum: [
            "United States",
            "Canada",
            "United Kingdom",
            "Germany",
            "France",
            "Italy",
            "Spain",
            "Netherlands",
            "Sweden",
            "Norway",
            "Finland",
            "Denmark"
          ],
          enumNames: [
            "United States",
            "Canada",
            "United Kingdom",
            "Germany",
            "France",
            "Italy",
            "Spain",
            "Netherlands",
            "Sweden",
            "Norway",
            "Finland",
            "Denmark"
          ]
        },
        givenName: {
          type: "string",
          title: "First Name",
          maxLength: 70,
          description: "Your legal first name"
        },
        familyName: {
          type: "string",
          title: "Last Name",
          maxLength: 70,
          description: "Your legal last name"
        },
        dateOfBirth: {
          type: "string",
          title: "Date of Birth",
          format: "date",
          description: "Your date of birth (must be 18 or older)"
        },
        taxId: {
          type: "string",
          title: "Tax ID",
          maxLength: 20,
          description: "Your tax identification number"
        },
        taxIdType: {
          type: "string",
          title: "Tax ID Type",
          enum: ["USA_SSN", "USA_ITIN", "FOREIGN"],
          enumNames: ["US SSN", "US ITIN", "Foreign"]
        },
        citizenship: {
          type: "string",
          title: "Citizenship",
          maxLength: 70,
          description: "Country of citizenship"
        },
        countryOfBirth: {
          type: "string",
          title: "Country of Birth",
          maxLength: 70,
          description: "Country where you were born"
        },
        countryOfTaxResidence: {
          type: "string",
          title: "Country of Tax Residence",
          maxLength: 70,
          description: "Country where you pay taxes"
        },
        fundingSources: {
          type: "array",
          title: "Funding Sources",
          description: "Select all applicable funding sources",
          items: {
            type: "string",
            enum: [
              "EMPLOYMENT_INCOME",
              "INVESTMENTS",
              "INHERITANCE",
              "BUSINESS_PROCEEDS",
              "SAVINGS",
              "CRYPTOCURRENCY",
              "OTHER"
            ],
            enumNames: [
              "Employment Income",
              "Investments",
              "Inheritance",
              "Business Proceeds",
              "Savings",
              "Cryptocurrency",
              "Other"
            ]
          },
          minItems: 1,
          uniqueItems: true
        },
        isControlPerson: {
          type: "boolean",
          title: "Are you a control person?",
          description: "Officer, director, or 10%+ shareholder of a public company."
        },
        isAffiliatedExchangeOrFinra: {
          type: "boolean",
          title: "Affiliated with exchange or FINRA?",
          description: "Are you affiliated with a broker-dealer, exchange, or FINRA?"
        },
        isPoliticallyExposed: {
          type: "boolean",
          title: "Are you a politically exposed person?",
          description: "Someone entrusted with prominent public function"
        },
        immediateFamilyExposed: {
          type: "boolean",
          title: "Immediate family member politically exposed?",
          description: "Is any immediate family member politically exposed?"
        },
        ipAddress: {
          type: "string",
          title: "IP Address",
          format: "ipv4",
          description: "Your current IP address for verification"
        }
      },
      required: [
        "emailAddress",
        "phoneNumber",
        "streetAddress",
        "city",
        "state",
        "postalCode",
        "country",
        "givenName",
        "familyName",
        "dateOfBirth",
        "taxId",
        "taxIdType",
        "citizenship",
        "countryOfBirth",
        "countryOfTaxResidence",
        "fundingSources",
        "isControlPerson",
        "isAffiliatedExchangeOrFinra",
        "isPoliticallyExposed",
        "immediateFamilyExposed",
        "ipAddress"
      ]
    },
    uiSchema: {
      dateOfBirth: {
        "ui:widget": "date",
        "ui:help": "You must be 18 or older to create an account"
      },
      taxIdType: {
        "ui:widget": "select"
      },
      country: {
        "ui:widget": "select",
        "ui:options": {
          "searchable": true
        }
      },
      citizenship: {
        "ui:widget": "select",
        "ui:options": {
          "searchable": true
        }
      },
      countryOfBirth: {
        "ui:widget": "select",
        "ui:options": {
          "searchable": true
        }
      },
      countryOfTaxResidence: {
        "ui:widget": "select",
        "ui:options": {
          "searchable": true
        }
      },
      fundingSources: {
        "ui:widget": "checkboxes"
      },
      isControlPerson: {
        "ui:widget": "switch"
      },
      isAffiliatedExchangeOrFinra: {
        "ui:widget": "switch"
      },
      isPoliticallyExposed: {
        "ui:widget": "switch"
      },
      immediateFamilyExposed: {
        "ui:widget": "switch"
      },
      emailAddress: {
        "ui:placeholder": "Enter your email address"
      },
      phoneNumber: {
        "ui:placeholder": "Enter your phone number"
      },
      streetAddress: {
        "ui:placeholder": "Enter your street address"
      },
      city: {
        "ui:placeholder": "Enter your city"
      },
      state: {
        "ui:placeholder": "Enter your state/province"
      },
      postalCode: {
        "ui:placeholder": "Enter your postal code"
      }
    },
    mutation: "createAlpacaAccount",
    successMessage: "Your Alpaca trading account was created successfully!"
  },

  createBankTransfer: {
    schema: {
      title: "Create Bank Transfer",
      description: "Initiate a bank transfer between connected bank accounts.",
      type: "object",
      properties: {
        bankConnectionId: {
          type: "string",
          title: "Bank Connection ID",
          maxLength: 100,
          description: "Select your connected bank account"
        },
        amount: {
          type: "string",
          title: "Amount",
          pattern: "^[0-9]+(\\.[0-9]{1,2})?$",
          description: "Amount to transfer in USD. Decimals allowed."
        },
        direction: {
          type: "string",
          title: "Direction",
          enum: ["INCOMING", "OUTGOING"],
          enumNames: ["Incoming (Deposit)", "Outgoing (Withdrawal)"]
        },
        timing: {
          type: "string",
          title: "Timing",
          enum: ["Immediate", "Scheduled"],
          enumNames: ["Immediate", "Scheduled"]
        },
        transferType: {
          type: "string",
          title: "Transfer Type",
          enum: ["ACH", "WIRE", "INTERNAL"],
          enumNames: ["ACH", "Wire", "Internal"]
        }
      },
      required: ["bankConnectionId", "amount", "direction", "timing", "transferType"]
    },
    uiSchema: {
      bankConnectionId: {
        "ui:widget": "select",
        "ui:help": "Select from your connected bank accounts"
      },
      direction: {
        "ui:widget": "select"
      },
      timing: {
        "ui:widget": "select"
      },
      transferType: {
        "ui:widget": "select"
      },
      amount: {
        "ui:placeholder": "0.00",
        "ui:help": "Minimum transfer: $10.00"
      }
    },
    mutation: "createBankTransfer",
    successMessage: "Your bank transfer has been initiated."
  },

  createPost: {
    schema: {
      title: "Create New Post",
      description: "Compose and submit a new trading action post.",
      type: "object",
      properties: {
        userProfile: {
          type: "string",
          title: "User Profile",
          description: "User profile header"
        },
        ticker: {
          type: "string",
          title: "Stock Ticker",
          maxLength: 10,
          pattern: "^[A-Z]{1,10}$",
          description: "Stock ticker symbol (e.g., AAPL, TSLA)"
        },
        action: {
          type: "string",
          title: "Action",
          enum: ["BUY", "SELL", "HOLD"],
          enumNames: ["Buy", "Sell", "Hold"]
        },
        confidence: {
          type: "number",
          title: "Confidence",
          minimum: 0,
          maximum: 100,
          multipleOf: 1,
          description: "How confident are you in this trade? (0-100%)"
        },
        analysis: {
          type: "string",
          title: "Your Analysis",
          maxLength: 1000,
          description: "Share your trading analysis and reasoning"
        },
        clientMutationId: {
          type: "string",
          title: "Client Mutation ID",
          maxLength: 100,
          description: "Unique identifier for this post"
        },
        newsSources: {
          type: "array",
          title: "News & Analysis Sources",
          description: "Add sources for your analysis",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                title: "Source Title",
                maxLength: 200,
                description: "Title or name of the source"
              },
              url: {
                type: "string",
                title: "Source URL",
                maxLength: 500,
                format: "uri",
                description: "Link to the source"
              }
            },
            required: ["title", "url"]
          },
          minItems: 0,
          maxItems: 10
        }
      },
      required: ["action", "analysis", "clientMutationId", "confidence", "ticker"]
    },
    uiSchema: {
      userProfile: {
        "ui:widget": "user_profile_header"
      },
      ticker: {
        "ui:widget": "tickerInput",
        "ui:placeholder": "e.g. AAPL, MSFT, TSLA"
      },
      action: {
        "ui:widget": "buySellButtons"
      },
      confidence: {
        "ui:widget": "confidenceSlider",
        "ui:options": { min: 0, max: 100, step: 1 }
      },
      analysis: {
        "ui:widget": "textarea",
        "ui:placeholder": "Share your analysis and reasoning for this trade..."
      },
      clientMutationId: {
        "ui:widget": "hidden"
      },
      newsSources: {
        "ui:widget": "news_sources_array",
        "ui:options": {
          "addable": true,
          "removable": true,
          "orderable": false
        }
      }
    },
    mutation: "createPost",
    successMessage: "Your post has been published."
  },



  createKycAlpacaAccount: {
    schema: {
      title: "Complete Your Trading Profile",
      description: "To start trading, we need to collect some information to comply with financial regulations.",
      type: "object",
      properties: {
        // Personal Information Section
        "_personalInfoSection": {
          type: "string",
          title: "Personal Information",
          description: "section_header"
        },
        givenName: {
          type: "string",
          title: "First Name",
          maxLength: 100,
          description: "Your legal first name"
        },
        familyName: {
          type: "string", 
          title: "Last Name",
          maxLength: 100,
          description: "Your legal last name"
        },
        emailAddress: {
          type: "string",
          title: "Email Address",
          format: "email",
          maxLength: 255,
          description: "Your email address for account communications"
        },
        phoneNumber: {
          type: "string",
          title: "Phone Number",
          maxLength: 30,
          pattern: "^[\\d\\s\\(\\)\\+\\-\\.]+$",
          description: "Your phone number for account verification"
        },
        dateOfBirth: {
          type: "string",
          title: "Date of Birth",
          format: "date",
          description: "Select your date of birth"
        },
        taxId: {
          type: "string",
          title: "Social Security Number",
          maxLength: 20,
          pattern: "^\\d{3}-?\\d{2}-?\\d{4}$",
          description: "Your tax identification number"
        },
        
        // Address Information Section
        "_addressInfoSection": {
          type: "string",
          title: "Address Information", 
          description: "section_header"
        },
        streetAddress: {
          type: "string",
          title: "Street Address",
          maxLength: 200,
          description: "Your complete street address"
        },
        streetAddressLine2: {
          type: "string",
          title: "Street Address Line 2",
          maxLength: 200,
          description: "Apartment, suite, unit, building, floor, etc. (optional)"
        },
        city: {
          type: "string",
          title: "City",
          maxLength: 100,
          description: "Your city"
        },
        country: {
          type: "string",
          title: "Country",
          enum: ["USA"],
          enumNames: ["USA"],
          description: "Your country of residence"
        },
        state: {
          type: "string",
          title: "State",
          enum: [
            "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
            "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
            "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
            "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
            "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
          ],
          enumNames: [
            "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
            "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
            "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
            "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
            "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
          ],
          description: "Select your state"
        },
        postalCode: {
          type: "string",
          title: "Postal Code",
          maxLength: 20,
          pattern: "^\\d{5}(-\\d{4})?$",
          description: "Your ZIP code"
        },
        
        // Required Disclosures Section
        "_disclosuresSection": {
          type: "string",
          title: "Required Disclosures",
          description: "section_header"
        },
        isControlPerson: {
          type: "boolean",
          title: "Are you a control person of a publicly traded company?",
          description: "A control person is a director, officer, or 10% stockholder."
        },
        isAffiliatedExchangeOrFinra: {
          type: "boolean",
          title: "Are you affiliated with a broker or exchange?",
          description: ""
        },
        isPoliticallyExposed: {
          type: "boolean",
          title: "Are you a politically exposed person?",
          description: ""
        },
        immediateFamilyExposed: {
          type: "boolean",
          title: "Is any immediate family member politically exposed?",
          description: ""
        },
        
        // Investment Profile Section
        "_investmentProfileSection": {
          type: "string",
          title: "Investment Profile",
          description: "section_header"
        },
        investmentExperience: {
          type: "string",
          title: "Investment Experience",
          enum: ["none", "beginner", "intermediate", "advanced", "expert"],
          enumNames: ["No Experience", "Beginner (1-2 years)", "Intermediate (3-5 years)", "Advanced (6-10 years)", "Expert (10+ years)"],
          description: "Select your level of investment experience"
        },
        annualIncome: {
          type: "string",
          title: "Annual Income",
          enum: ["under_25k", "25k_50k", "50k_100k", "100k_250k", "250k_500k", "500k_1m", "over_1m"],
          enumNames: ["Under $25,000", "$25,000 - $50,000", "$50,000 - $100,000", "$100,000 - $250,000", "$250,000 - $500,000", "$500,000 - $1,000,000", "Over $1,000,000"],
          description: "Select your annual income range"
        },
        netWorth: {
          type: "string",
          title: "Net Worth",
          enum: ["under_25k", "25k_50k", "50k_100k", "100k_250k", "250k_500k", "500k_1m", "over_1m"],
          enumNames: ["Under $25,000", "$25,000 - $50,000", "$50,000 - $100,000", "$100,000 - $250,000", "$250,000 - $500,000", "$500,000 - $1,000,000", "Over $1,000,000"],
          description: "Select your net worth range"
        },
        riskTolerance: {
          type: "string",
          title: "Risk Tolerance",
          enum: ["low", "medium", "high"],
          enumNames: ["Low (Conservative)", "Medium (Moderate)", "High (Aggressive)"],
          description: "Select your risk tolerance level"
        },
        
        // Terms and Conditions Section
        "_termsSection": {
          type: "string",
          title: "Terms and Conditions",
          description: "section_header"
        },
        acceptedTerms: {
          type: "boolean",
          title: "I agree to the Terms and Conditions and Customer Agreement",
          description: "You must accept the terms to continue"
        },
        acceptedPrivacyPolicy: {
          type: "boolean",
          title: "I agree to the Privacy Policy",
          description: "You must accept the privacy policy to continue"
        },
        acceptedDataSharing: {
          type: "boolean",
          title: "I agree to the Data Sharing Agreement",
          description: "You must accept the data sharing agreement to continue"
        },
        
        // Hidden fields that get auto-populated
        citizenship: {
          type: "string",
          title: "Citizenship"
        },
        countryOfBirth: {
          type: "string", 
          title: "Country of Birth"
        },
        countryOfTaxResidence: {
          type: "string",
          title: "Country of Tax Residence"
        },
        taxIdType: {
          type: "string",
          title: "Tax ID Type"
        },
        fundingSources: {
          type: "array",
          title: "Funding Sources",
          items: {
            type: "string"
          }
        },
        ipAddress: {
          type: "string",
          title: "IP Address"
        }
      },
      required: [
        "givenName",
        "familyName", 
        "emailAddress",
        "phoneNumber",
        "dateOfBirth",
        "taxId",
        "streetAddress",
        "city",
        "state",
        "postalCode",
        "investmentExperience",
        "annualIncome",
        "netWorth",
        "riskTolerance",
        "acceptedTerms",
        "acceptedPrivacyPolicy",
        "acceptedDataSharing"
      ]
    },
    uiSchema: {
      // Section headers
      "_personalInfoSection": {
        "ui:widget": "section_header"
      },
      "_addressInfoSection": {
        "ui:widget": "section_header"
      },
      "_disclosuresSection": {
        "ui:widget": "section_header"
      },
      "_termsSection": {
        "ui:widget": "section_header"
      },
      "_investmentProfileSection": {
        "ui:widget": "section_header"
      },
      
      // Personal Information Fields
      givenName: {
        "ui:placeholder": "Enter your first name",
        "ui:options": {
          "autoCapitalize": "words"
        }
      },
      familyName: {
        "ui:placeholder": "Enter your last name",
        "ui:options": {
          "autoCapitalize": "words"
        }
      },
      emailAddress: {
        "ui:placeholder": "Enter your email",
        "ui:options": {
          "keyboardType": "email-address"
        }
      },
      phoneNumber: {
        "ui:placeholder": "(555) 123-4567",
        "ui:options": {
          "keyboardType": "phone-pad"
        }
      },
      dateOfBirth: {
        "ui:widget": "date",
        "ui:placeholder": "Select your date of birth",
        "ui:options": {
          "minimumDate": "1900-01-01",
          "maximumDate": new Date().toISOString().split('T')[0]
        }
      },
      taxId: {
        "ui:placeholder": "XXX-XX-XXXX",
        "ui:options": {
          "keyboardType": "numeric",
          "maxLength": 11
        }
      },
      
      // Address Information Fields
      streetAddress: {
        "ui:placeholder": "Enter your street address",
        "ui:options": {
          "autoCapitalize": "words"
        }
      },
      streetAddressLine2: {
        "ui:placeholder": "Apartment, suite, unit, building, floor, etc. (optional)",
        "ui:options": {
          "autoCapitalize": "words"
        }
      },
      city: {
        "ui:placeholder": "Enter your city",
        "ui:options": {
          "autoCapitalize": "words"
        }
      },
      country: {
        "ui:widget": "text",
        "ui:placeholder": "USA",
        "ui:options": {
          "disabled": true
        }
      },
      state: {
        "ui:widget": "state_select",
        "ui:placeholder": "Select your state"
      },
      postalCode: {
        "ui:placeholder": "12345",
        "ui:options": {
          "keyboardType": "numeric"
        }
      },
      
      // Disclosure Fields - Toggle switches
      isControlPerson: {
        "ui:widget": "disclosure_toggle"
      },
      isAffiliatedExchangeOrFinra: {
        "ui:widget": "disclosure_toggle"
      },
      isPoliticallyExposed: {
        "ui:widget": "disclosure_toggle"
      },
      immediateFamilyExposed: {
        "ui:widget": "disclosure_toggle"
      },
      
      // Investment Profile Fields
      investmentExperience: {
        "ui:widget": "select",
        "ui:placeholder": "Select your investment experience"
      },
      annualIncome: {
        "ui:widget": "select",
        "ui:placeholder": "Select your annual income range"
      },
      netWorth: {
        "ui:widget": "select",
        "ui:placeholder": "Select your net worth range"
      },
      riskTolerance: {
        "ui:widget": "select",
        "ui:placeholder": "Select your risk tolerance level"
      },
      
      // Terms checkboxes
      acceptedTerms: {
        "ui:widget": "terms_checkbox"
      },
      acceptedPrivacyPolicy: {
        "ui:widget": "terms_checkbox"
      },
      acceptedDataSharing: {
        "ui:widget": "terms_checkbox"
      },
      
      // Hidden fields
      citizenship: {
        "ui:widget": "hidden"
      },
      countryOfBirth: {
        "ui:widget": "hidden"
      },
      countryOfTaxResidence: {
        "ui:widget": "hidden"
      },
      taxIdType: {
        "ui:widget": "hidden"
      },
      fundingSources: {
        "ui:widget": "hidden"
      },
      ipAddress: {
        "ui:widget": "hidden"
      }
    },
    mutation: "createAlpacaAccount",
    successMessage: "Your trading profile has been created successfully!"
  },

  createAccount: {
    schema: {
      title: "Add New Account",
      description: "Create a new account to track your finances.",
      type: "object",
      properties: {
        name: {
          type: "string",
          title: "Account Name",
          maxLength: 100,
          description: "Name for your account"
        },
        currency: {
          type: "string",
          title: "Currency",
          enum: ["US Dollar", "Euro", "British Pound", "Canadian Dollar", "Australian Dollar"],
          enumNames: ["US Dollar ($)", "Euro (€)", "British Pound (£)", "Canadian Dollar (C$)", "Australian Dollar (A$)"],
          description: "Select your account currency"
        },
        initialBalance: {
          type: "string",
          title: "Initial Balance",
          pattern: "^[0-9]+(\\.[0-9]{1,2})?$",
          description: "Starting balance for your account"
        },
        initialDate: {
          type: "string",
          title: "Initial Balance Date",
          format: "date",
          description: "Date of the initial balance"
        },
        icon: {
          type: "string",
          title: "Account Icon",
          enum: ["cash", "card", "wallet", "bank", "piggy", "savings"],
          enumNames: ["Cash", "Card", "Wallet", "Bank", "Piggy Bank", "Savings"],
          description: "Choose an icon for your account"
        }
      },
      required: ["name", "currency", "initialBalance", "initialDate", "icon"]
    },
    uiSchema: {
      name: {
        "ui:placeholder": "Account Name"
      },
      currency: {
        "ui:widget": "select"
      },
      initialBalance: {
        "ui:placeholder": "$ 0.00"
      },
      initialDate: {
        "ui:widget": "date"
      },
      icon: {
        "ui:widget": "select"
      }
    },
    mutation: "createAccount",
    successMessage: "Account created successfully!"
  },

  createBudget: {
    schema: {
      title: "Add a Budget",
      description: "Create a new budget to manage your spending.",
      type: "object", 
      properties: {
        name: {
          type: "string",
          title: "Budget Name",
          maxLength: 100,
          description: "Name for your budget"
        },
        amount: {
          type: "string",
          title: "Amount",
          pattern: "^[0-9]+$",
          description: "Budget amount"
        },
        account: {
          type: "string",
          title: "Account",
          description: "Select payment method or account"
        },
        range: {
          type: "string",
          title: "Budget Range",
          enum: ["Daily", "Weekly", "Monthly", "Quarterly"],
          enumNames: ["Daily", "Weekly", "Monthly", "Quarterly"],
          description: "How often does this budget reset?"
        }
      },
      required: ["name", "amount", "account", "range"]
    },
    uiSchema: {
      name: {
        "ui:placeholder": "Budget name"
      },
      amount: {
        "ui:placeholder": "18000"
      },
      account: {
        "ui:widget": "select",
        "ui:placeholder": "Select an account"
      },
      range: {
        "ui:widget": "select"
      }
    },
    mutation: "createBudget",
    successMessage: "Budget created successfully!"
  },

  createPriceAlert: {
    schema: {
      title: "Set Price Alert",
      description: "Get notified when a stock reaches your target price.",
      type: "object",
      properties: {
        ticker: {
          type: "string",
          title: "Stock Symbol",
          maxLength: 10,
          pattern: "^[A-Z]{1,10}$",
          description: "Stock ticker symbol (e.g., AAPL, TSLA)"
        },
        alertType: {
          type: "string",
          title: "Alert Type",
          enum: ["price", "percentage"],
          enumNames: ["Price Target", "Percentage Change"],
          description: "Type of price alert"
        },
        targetPrice: {
          type: "string",
          title: "Target Price",
          pattern: "^[0-9]+(\\.[0-9]{1,4})?$",
          description: "Target price or percentage"
        },
        condition: {
          type: "string",
          title: "Condition",
          enum: ["above", "below"],
          enumNames: ["Above", "Below"],
          description: "Alert when price goes above or below target"
        }
      },
      required: ["ticker", "alertType", "targetPrice", "condition"]
    },
    uiSchema: {
      ticker: {
        "ui:placeholder": "Enter stock symbol"
      },
      alertType: {
        "ui:widget": "select"
      },
      targetPrice: {
        "ui:placeholder": "96.345"
      },
      condition: {
        "ui:widget": "select"
      }
    },
    mutation: "createPriceAlert",
    successMessage: "Price alert set successfully!"
  },

  createEntity: {
    schema: {
      title: "Create Entity",
      description: "Register a new entity (business or organization).",
      type: "object",
      properties: {
        name: {
          type: "string",
          title: "Entity Name",
          maxLength: 100,
          description: "Name of the entity"
        },
        fyStartMonth: {
          type: "number",
          title: "Fiscal Year Start Month",
          minimum: 1,
          maximum: 12,
          enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          enumNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
          description: "Month when the fiscal year starts (1-12)"
        },
        // accrualMethod: {
        //   type: "boolean",
        //   title: "Uses Accrual Method?",
        //   description: "Is the entity using accrual accounting method?"
        // },
        address1: {
          type: "string",
          title: "Address Line 1",
          maxLength: 100,
          description: "Primary address line"
        },
        address2: {
          type: "string",
          title: "Address Line 2",
          maxLength: 100,
          description: "Secondary address line (optional)"
        },
        city: {
          type: "string",
          title: "City",
          maxLength: 70,
          description: "City"
        },
        state: {
          type: "string",
          title: "State",
          maxLength: 70,
          description: "State or province"
        },
        zipCode: {
          type: "string",
          title: "ZIP Code",
          maxLength: 20,
          description: "Postal or ZIP code"
        },
        country: {
          type: "string",
          title: "Country",
          maxLength: 70,
          enum: COUNTRIES.map(c => c.code),
          enumNames: COUNTRIES.map(c => c.name),
          description: "Country"
        },
        email: {
          type: "string",
          title: "Email",
          format: "email",
          maxLength: 100,
          description: "Contact email"
        }
      },
      required: [
        "name",
        "fyStartMonth",
        "address1",
        "city",
        "state",
        "zipCode",
        "country",
        "email"
      ]
    },
    uiSchema: {
      name: {
        "ui:placeholder": "Entity name"
      },
      fyStartMonth: {
        "ui:widget": "select"
      },
      // accrualMethod: {
      //   "ui:widget": "switch"
      // },
      address1: {
        "ui:placeholder": "Address line 1"
      },
      address2: {
        "ui:placeholder": "Address line 2 (optional)"
      },
      city: {
        "ui:placeholder": "City"
      },
      state: {
        "ui:placeholder": "State"
      },
      zipCode: {
        "ui:placeholder": "ZIP code"
      },
      country: {
        "ui:widget": "select",
        "ui:options": {
          "searchable": true
        }
      },
      email: {
        "ui:placeholder": "Email address"
      }
    },
    mutation: "entityCreate",
    successMessage: "Entity created successfully!"
  },

  createCustomer: {
    schema: {
      title: "Create Customer",
      description: "Add a new customer to your entity.",
      type: "object",
      properties: {
        customerName: {
          type: "string",
          title: "Customer Name",
          maxLength: 100,
          description: "Full name of the customer"
        },
        entityUuid: {
          type: "string",
          title: "Entity",
          maxLength: 50,
          description: "Select the entity this customer belongs to"
        },
        address1: {
          type: "string",
          title: "Address Line 1",
          maxLength: 100,
          description: "Primary address line"
        },
        address2: {
          type: "string",
          title: "Address Line 2",
          maxLength: 100,
          description: "Secondary address line (optional)"
        },
        city: {
          type: "string",
          title: "City",
          maxLength: 70,
          description: "City"
        },
        state: {
          type: "string",
          title: "State",
          maxLength: 70,
          description: "State or province"
        },
        zipCode: {
          type: "string",
          title: "ZIP Code",
          maxLength: 20,
          description: "Postal or ZIP code"
        },
        country: {
          type: "string",
          title: "Country",
          maxLength: 70,
          description: "Country"
        },
        email: {
          type: "string",
          title: "Email",
          format: "email",
          maxLength: 100,
          description: "Customer email address"
        },
        phone: {
          type: "string",
          title: "Phone",
          maxLength: 30,
          description: "Customer phone number"
        },
        website: {
          type: "string",
          title: "Website",
          maxLength: 100,
          description: "Customer website"
        },
        description: {
          type: "string",
          title: "Description",
          maxLength: 200,
          description: "Short description or notes"
        },
        salesTaxRate: {
          type: "string",
          title: "Sales Tax Rate (%)",
          pattern: "^[0-9]+(\\.[0-9]{1,2})?$",
          description: "Sales tax rate for this customer"
        }
      },
      required: [
        "customerName",
        "entityUuid",
      ]
    },
    uiSchema: {
      customerName: {
        "ui:placeholder": "Customer name"
      },
      entityUuid: {
        "ui:widget": "select",
        "ui:placeholder": "Select entity"
      },
      address1: {
        "ui:placeholder": "Address line 1"
      },
      address2: {
        "ui:placeholder": "Address line 2 (optional)"
      },
      city: {
        "ui:placeholder": "City"
      },
      state: {
        "ui:placeholder": "State"
      },
      zipCode: {
        "ui:placeholder": "ZIP code"
      },
      country: {
        "ui:placeholder": "Country"
      },
      email: {
        "ui:placeholder": "Email address"
      },
      phone: {
        "ui:placeholder": "Phone number"
      },
      website: {
        "ui:placeholder": "Website"
      },
      description: {
        "ui:widget": "textarea",
        "ui:placeholder": "Description or notes"
      },
      salesTaxRate: {
        "ui:placeholder": "0.00"
      }
    },
    mutation: "customerCreate",
    successMessage: "Customer created successfully!"
  },
};

/**
 * Get form definition by name
 * @param formName - The name of the form to retrieve
 * @returns Form definition or undefined if not found
 */
export function getFormSchema(formName: string): FormDefinition | undefined {
  return formSchemas[formName];
}

/**
 * Get all available form names
 * @returns Array of form names
 */
export function getAvailableFormNames(): string[] {
  return Object.keys(formSchemas);
}

/**
 * Validate form data against schema
 * @param formName - The name of the form
 * @param data - The form data to validate
 * @returns Validation result with errors if any
 */
export function validateFormData(
  formName: string,
  data: Record<string, any>
): { isValid: boolean; errors: Record<string, string> } {
  const formDef = getFormSchema(formName);
  if (!formDef) {
    return { isValid: false, errors: { form: "Form definition not found" } };
  }

  const errors: Record<string, string> = {};
  const { schema } = formDef;

  // Check required fields
  for (const requiredField of schema.required) {
    if (!data[requiredField] || data[requiredField] === "") {
      const fieldDef = schema.properties[requiredField];
      errors[requiredField] = `${fieldDef.title} is required`;
    }
  }

  // Validate field types and constraints
  for (const [fieldName, fieldData] of Object.entries(data)) {
    const fieldDef = schema.properties[fieldName];
    if (!fieldDef) continue;

    const value = fieldData;

    // Skip validation for empty optional fields
    if (
      (!value || value === "") &&
      !schema.required.includes(fieldName)
    ) {
      continue;
    }

    // Type validation
    switch (fieldDef.type) {
      case "string":
        if (typeof value !== "string") {
          errors[fieldName] = `${fieldDef.title} must be a string`;
          continue;
        }

        // Length validation
        if (fieldDef.minLength && value.length < fieldDef.minLength) {
          errors[fieldName] = `${fieldDef.title} must be at least ${fieldDef.minLength} characters`;
        }
        if (fieldDef.maxLength && value.length > fieldDef.maxLength) {
          errors[fieldName] = `${fieldDef.title} must be less than ${fieldDef.maxLength} characters`;
        }

        // Pattern validation
        if (fieldDef.pattern) {
          const regex = new RegExp(fieldDef.pattern);
          if (!regex.test(value)) {
            errors[fieldName] = `${fieldDef.title} format is invalid`;
          }
        }

        // Format validation
        if (fieldDef.format === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors[fieldName] = `${fieldDef.title} must be a valid email address`;
          }
        }

        // Enum validation
        if (fieldDef.enum) {
          const isValidEnum = fieldDef.enum.some(enumValue => 
            String(enumValue) === String(value) || enumValue === value
          );
          
          if (!isValidEnum) {
            errors[fieldName] = `${fieldDef.title} must be one of: ${fieldDef.enumNames?.join(", ") || fieldDef.enum.join(", ")}`;
          }
        }
        break;

      case "number":
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        if (isNaN(numValue)) {
          errors[fieldName] = `${fieldDef.title} must be a valid number`;
          continue;
        }

        if (fieldDef.minimum !== undefined && numValue < fieldDef.minimum) {
          errors[fieldName] = `${fieldDef.title} must be at least ${fieldDef.minimum}`;
        }
        if (fieldDef.maximum !== undefined && numValue > fieldDef.maximum) {
          errors[fieldName] = `${fieldDef.title} must be at most ${fieldDef.maximum}`;
        }
        if (fieldDef.multipleOf && numValue % fieldDef.multipleOf !== 0) {
          errors[fieldName] = `${fieldDef.title} must be a multiple of ${fieldDef.multipleOf}`;
        }
        break;

      case "boolean":
        if (typeof value !== "boolean") {
          errors[fieldName] = `${fieldDef.title} must be true or false`;
        }
        break;

      case "array":
        if (!Array.isArray(value)) {
          errors[fieldName] = `${fieldDef.title} must be an array`;
          continue;
        }

        if (fieldDef.minItems && value.length < fieldDef.minItems) {
          errors[fieldName] = `${fieldDef.title} must have at least ${fieldDef.minItems} items`;
        }
        if (fieldDef.maxItems && value.length > fieldDef.maxItems) {
          errors[fieldName] = `${fieldDef.title} must have at most ${fieldDef.maxItems} items`;
        }
        if (fieldDef.uniqueItems) {
          const uniqueValues = new Set(value);
          if (uniqueValues.size !== value.length) {
            errors[fieldName] = `${fieldDef.title} must have unique items`;
          }
        }
        break;
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}


/**
 * Enhanced form schemas with journal entry and transaction management
 */
const journalEntrySchemas = {
  createJournalEntry: {
    schema: {
      title: "Create Journal Entry",
      description: "Create a new journal entry with balanced transactions.",
      type: "object",
      properties: {
        description: {
          type: "string",
          title: "Description",
          maxLength: 255,
          description: "Brief description of the journal entry"
        },
        date: {
          type: "string",
          format: "date",
          title: "Date",
          description: "Date of the transaction"
        },
        reference: {
          type: "string",
          title: "Reference",
          maxLength: 100,
          description: "Reference number or document ID"
        },
        transactions: {
          type: "array",
          title: "Transactions",
          description: "List of transactions (minimum 2 required). You'll need valid account UUIDs from your entity's chart of accounts.",
          minItems: 2,
          items: {
            type: "object",
            properties: {
              accountUuid: {
                type: "string",
                title: "Account UUID",
                description: "Enter the UUID of the account for this transaction. You can find account UUIDs by viewing existing transactions in your entity."
              },
              transactionType: {
                type: "string",
                title: "Transaction Type",
                enum: ["debit", "credit"],
                enumNames: ["Debit", "Credit"],
                description: "Select whether this is a debit or credit transaction"
              },
              amount: {
                type: "number",
                title: "Amount",
                minimum: 0,
                description: "Transaction amount"
              }
            },
            required: ["accountUuid", "description", "transactionType", "amount"]
          }
        }
      },
      required: ["description", "date", "transactions"]
    },
    uiSchema: {
      description: {
        "ui:placeholder": "Enter journal entry description"
      },
      date: {
        "ui:widget": "date"
      },
      reference: {
        "ui:placeholder": "Reference number (optional)"
      },
      transactions: {
        "ui:widget": "array",
        "ui:options": {
          addable: true,
          removable: true,
          orderable: false
        },
        items: {
          accountUuid: {
            "ui:placeholder": "Enter account UUID (e.g., 12345678-1234-1234-1234-123456789abc)"
          },
          // description: {
          //   "ui:placeholder": "Transaction description"
          // },
          transactionType: {
            "ui:widget": "select",
            "ui:placeholder": "Select transaction type"
          },
          amount: {
            "ui:widget": "number",
            "ui:placeholder": "0.00"
          }
        }
      }
    },
    mutation: "createJournalEntry",
    successMessage: "Journal entry created successfully!",
    errorMessage: "Failed to create journal entry. Please check your data and try again."
  },





  // Full journal entry update schema (same as create, but for editing)
  updateJournalEntry: {
    schema: {
      title: "Edit Journal Entry",
      description: "Edit an existing journal entry with multiple transactions.",
      type: "object",
      properties: {
        description: {
          type: "string",
          title: "Description",
          maxLength: 255,
          description: "Brief description of this journal entry"
        },
        transactions: {
          type: "array",
          title: "Transactions",
          description: "List of transactions (minimum 2 required). You'll need valid account UUIDs from your entity's chart of accounts.",
          minItems: 2,
          items: {
            type: "object",
            properties: {
              accountUuid: {
                type: "string",
                title: "Account UUID",
                description: "Enter the UUID of the account for this transaction."
              },
              description: {
                type: "string",
                title: "Transaction Description",
                maxLength: 255,
                description: "Description for this specific transaction"
              },
              transactionType: {
                type: "string",
                title: "Transaction Type",
                enum: ["debit", "credit"],
                enumNames: ["Debit", "Credit"],
                description: "Select whether this is a debit or credit transaction"
              },
              amount: {
                type: "number",
                title: "Amount",
                minimum: 0,
                description: "Transaction amount"
              }
            },
            required: ["accountUuid", "description", "transactionType", "amount"]
          }
        }
      },
      required: ["transactions"] // Only transactions required now
    },
    uiSchema: {
      transactions: {
        "ui:widget": "array",
        "ui:options": {
          addable: true,
          removable: true,
          orderable: false
        },
        items: {
          accountUuid: {
            "ui:placeholder": "Enter account UUID (e.g., 12345678-1234-1234-1234-123456789abc)"
          },
          description: {
            "ui:placeholder": "Transaction description"
          },
          transactionType: {
            "ui:widget": "select",
            "ui:placeholder": "Select transaction type"
          },
          amount: {
            "ui:widget": "number",
            "ui:placeholder": "0.00"
          }
        }
      }
    },
    mutation: "updateJournalEntry",
    successMessage: "Journal entry updated successfully!",
    errorMessage: "Failed to update journal entry. Please check your data and try again."
  }
};

// Merge journal entry schemas with existing schemas
Object.assign(formSchemas, journalEntrySchemas);

// Budget Record Form Schemas
export const createBudgetRecordSchema = {
  type: "object",
  properties: {
    amount: {
      type: "string",
      title: "Amount",
      pattern: "^[0-9]+(\\.[0-9]{1,2})?$",
      description: "Enter the transaction amount"
    },
    description: {
      type: "string",
      title: "Description",
      maxLength: 255,
      description: "Enter a description for this transaction"
    },
    recordType: {
      type: "string",
      title: "Type",
      enum: ["INCOME", "EXPENSE"],
      enumNames: ["Income", "Expense"],
      description: "Select transaction type"
    },
    categoryUuid: {
      type: "string",
      title: "Category",
      description: "Select a category"
    },
    bankAccountUuid: {
      type: "string",
      title: "Account",
      description: "Select an account"
    }
  },
  required: ["amount", "description", "recordType", "categoryUuid", "bankAccountUuid"]
};

export const editBudgetRecordSchema = {
  type: "object",
  title: "Edit Budget Record",
  description: "Edit an existing budget record",
  properties: {
    recordUuid: {
      type: "string",
      title: "Record UUID",
      description: "The UUID of the record to update"
    },
    amount: {
      type: "string",
      title: "Amount",
      pattern: "^[0-9]+(\\.[0-9]{1,2})?$",
      description: "Enter the transaction amount"
    },
    description: {
      type: "string",
      title: "Description",
      maxLength: 255,
      description: "Enter a description for this transaction"
    },
    recordType: {
      type: "string",
      title: "Type",
      enum: ["INCOME", "EXPENSE"],
      enumNames: ["INCOME", "EXPENSE"],
      description: "Select transaction type"
    },
    categoryUuid: {
      type: "string",
      title: "Category",
      description: "Select a category"
    },
    bankAccountUuid: {
      type: "string",
      title: "Account",
      description: "Select an account"
    }
  },
  required: ["recordUuid", "amount", "description", "recordType", "categoryUuid", "bankAccountUuid"]
};

export const createBudgetCategorySchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      title: "Category Name",
      maxLength: 100,
      description: "Enter the category name"

    },
    categoryType: {
      type: "string",
      title: "Type",
      enum: ["income", "expense"],
      enumNames: ["Income", "Expense"],
      description: "Select category type"
    },
    icon: {
      type: "string",
      title: "Icon",
      enum: Object.keys(CATEGORY_ICONS),
      enumNames: Object.values(CATEGORY_ICONS),
      description: "Select an icon for this category"
    }
  },
  required: ["name", "categoryType", "icon"]
};

export const editBudgetCategorySchema = {
  type: "object",
  properties: {
    categoryUuid: {
      type: "string",
      title: "Category UUID",
      description: "The UUID of the category to edit"
    },
    name: {
      type: "string",
      title: "Category Name",
      maxLength: 100,
      description: "Enter the category name"
    },
    icon: {
      type: "string",
      title: "Icon",
      enum: Object.keys(CATEGORY_ICONS),
      enumNames: Object.values(CATEGORY_ICONS),
      description: "Select an icon for this category"
    },
    categoryType: {
      type: "string",
      title: "Category Type",
      enum: ["expense", "income"],
      enumNames: ["Expense", "Income"],
      description: "Select the category type"
    }
  },
  required: ["categoryUuid", "name", "icon", "categoryType"]
};

export const createBudgetSchema = {
  type: "object",
  properties: {
    period: {
      type: "string",
      title: "Budget Period",
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      enumNames: ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"],
      description: "Select the budget period"
    },
    amount: {
      type: "string",
      title: "Budget Amount",
      pattern: "^[0-9]+(\\.[0-9]{1,2})?$",
      description: "Enter the budget amount"
    },
    categoryUuid: {
      type: "string",
      title: "Category",
      description: "Select a category for this budget"
    },
    balanceCarryOver: {
      type: "boolean",
      title: "",
      description: "Carry over remaining balance to next period"
    },
    predictiveMode: {
      type: "boolean",
      title: "",
      description: "Enable predictive budgeting mode"
    }
  },
  required: ["period", "amount", "categoryUuid"]
};

export const editBudgetSchema = {
  type: "object",
  properties: {
    uuid: {
      type: "string",
      title: "Budget UUID",
      description: "The UUID of the budget to edit"
    },
    amount: {
      type: "string",
      title: "Budget Amount",
      pattern: "^[0-9]+(\\.[0-9]{1,2})?$",
      description: "Enter the budget amount"
    },
    period: {
      type: "string",
      title: "Budget Period",
      enum: ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"],
      enumNames: ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"],
      description: "Select the budget period"
    },
    categoryUuid: {
      type: "string",
      title: "Category",
      description: "Select a category for this budget"
    },
    balanceCarryOver: {
      type: "boolean",
      title: "",
      description: "Carry over remaining balance to next period"
    },
    predictiveMode: {
      type: "boolean",
      title: "",
      description: "Enable predictive budgeting mode"
    }
  },
  required: ["uuid", "amount", "period", "categoryUuid"]
};

// Add budget schemas to the main formSchemas object
Object.assign(formSchemas, {
  createBudgetRecord: {
    schema: {
      title: "Create Budget Record",
      description: "Create a new budget record",
      ...createBudgetRecordSchema
    },

    uiSchema: {
      recordType: {
        "ui:widget": "select",
        "ui:placeholder": "Select record type"
      },
      categoryUuid: {
        "ui:widget": "select",
        "ui:placeholder": "Select category"
      },
      bankAccountUuid: {
        "ui:widget": "select",
        "ui:placeholder": "Select bank account"
      }
    },
    mutation: "createRecord",
    successMessage: "Record created successfully!"
  },
  editBudgetRecord: {
    schema: editBudgetRecordSchema,
    uiSchema: {
      recordUuid: {
        "ui:widget": "hidden"
      },
      recordType: {
        "ui:widget": "select",
        "ui:placeholder": "Select record type"
      },
      categoryUuid: {
        "ui:widget": "select",
        "ui:placeholder": "Select category"
      },
      bankAccountUuid: {
        "ui:widget": "select",
        "ui:placeholder": "Select bank account",

      }
    },
    mutation: "updateRecord",
    successMessage: "Record updated successfully!"
  },
  createBudgetCategory: {
    schema: {
      title: "Create Category",
      description: "Create a new budget category",
      ...createBudgetCategorySchema
    },
    uiSchema: {
      categoryType: {
        "ui:widget": "select",
        "ui:placeholder": "Select category type"
      },
      icon: {
        "ui:widget": "select",
        "ui:placeholder": "Select an icon",
        "ui:options": {
          "searchable": true
        }
      }
    },
    mutation: "createCategory",
    successMessage: "Category created successfully!"
  },
  editBudgetCategory: {
    schema: {
      title: "Edit Category",
      description: "Edit an existing budget category",
      ...editBudgetCategorySchema
    },
    uiSchema: {
      categoryUuid: {
        "ui:widget": "hidden"
      },
      categoryType: {
        "ui:widget": "select",
        "ui:placeholder": "Select category type"
      },
      icon: {
        "ui:widget": "select",
        "ui:placeholder": "Select an icon"
      }
    },
    mutation: "updateCategory",
    successMessage: "Category updated successfully!"
  },
  createBudget: {
    schema: {
      title: "Create Budget",
      description: "Create a new budget",
      ...createBudgetSchema
    },
    uiSchema: {
      period: {
        "ui:widget": "select",
        "ui:placeholder": "Select budget period"
      },
      categoryUuid: {
        "ui:widget": "select",
        "ui:placeholder": "Select category"
      },
      balanceCarryOver: {
        "ui:widget": "switch"
      },
      predictiveMode: {
        "ui:widget": "switch"
      }
    },
    mutation: "createBudget",
    successMessage: "Budget created successfully!"
  },
  editBudget: {
    schema: {
      title: "Edit Budget",
      description: "Edit an existing budget",
      ...editBudgetSchema
    },
    uiSchema: {
      uuid: {
        "ui:widget": "hidden"
      },
      categoryUuid: {
        "ui:widget": "select",
        "ui:placeholder": "Select category"
      },
      period: {
        "ui:widget": "select",
        "ui:placeholder": "Select budget period"
      },
      balanceCarryOver: {
        "ui:widget": "switch"
      },
      predictiveMode: {
        "ui:widget": "switch"
      }
    },
    mutation: "updateBudget",
    successMessage: "Budget updated successfully!"
  },
  fundCash: {
    schema: {
      title: "Add Funds to Cash Account",
      description: "Add funds to your cash account balance",
      type: "object",
      properties: {
        fundAmount: {
          type: "number",
          title: "Amount to Add",
          minimum: 0.01,
          description: "Enter the amount you want to add to your cash account"
        }
      },
      required: ["fundAmount"]
    },
    uiSchema: {
      fundAmount: {
        "ui:widget": "number",
        "ui:placeholder": "Enter amount (e.g., 1000.00)",
        "ui:help": "Amount will be added to your cash account balance"
      }
    },
    mutation: "fundCash",
    successMessage: "Funds added successfully!"
  }
});
