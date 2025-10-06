// CoRide Morocco Form Schemas

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
  description?: string;
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
  // Contact Support Form
  contactSupport: {
    schema: {
      title: "Contact Support",
      description: "Get help from our support team",
      type: "object",
      properties: {
        subject: {
          type: "string",
          title: "Subject",
          maxLength: 200
        },
        category: {
          type: "string",
          title: "Category",
          enum: ["account_issue", "ride_problem", "payment_issue", "safety_concern", "app_bug", "feature_request", "other"],
          enumNames: ["Account Issue", "Ride Problem", "Payment Issue", "Safety Concern", "App Bug", "Feature Request", "Other"]
        },
        message: {
          type: "string",
          title: "Message",
          maxLength: 2000
        },
        urgency: {
          type: "string",
          title: "Priority Level",
          enum: ["low", "medium", "high", "urgent"],
          enumNames: ["Low", "Medium", "High", "Urgent"]
        }
      },
      required: ["subject", "category", "message", "urgency"]
    },
    uiSchema: {
      subject: { "ui:placeholder": "Brief description of your issue" },
      category: { "ui:widget": "select" },
      message: { "ui:widget": "textarea" },
      urgency: { "ui:widget": "select" }
    },
    mutation: "contactSupport",
    successMessage: "Your message has been sent successfully!"
  },

  // Ride Request Form  
  createRideRequest: {
    schema: {
      title: "Request a Ride",
      description: "Find a ride to your destination",
      type: "object",
      properties: {
        from: {
          type: "string",
          title: "Pickup Location",
          maxLength: 500
        },
        to: {
          type: "string",
          title: "Destination",
          maxLength: 500
        },
        departureTime: {
          type: "string",
          title: "Departure Time",
          format: "datetime-local"
        },
        passengers: {
          type: "number",
          title: "Number of Passengers",
          minimum: 1,
          maximum: 8
        },
        maxPrice: {
          type: "string",
          title: "Maximum Price (MAD)",
          pattern: "^[0-9]+(\\.[0-9]{1,2})?$"
        },
        notes: {
          type: "string",
          title: "Additional Notes",
          maxLength: 500
        }
      },
      required: ["from", "to", "departureTime", "passengers"]
    },
    uiSchema: {
      from: { "ui:widget": "location", "ui:placeholder": "Enter pickup address" },
      to: { "ui:widget": "location", "ui:placeholder": "Enter destination" },
      departureTime: { "ui:widget": "datetime" },
      passengers: { "ui:widget": "select" },
      notes: { "ui:widget": "textarea" }
    },
    mutation: "createRideRequest",
    successMessage: "Your ride request has been posted!"
  },

  // Ride Offer Form
  createRideOffer: {
    schema: {
      title: "Offer a Ride",
      description: "Share your ride with passengers",
      type: "object",
      properties: {
        from: {
          type: "string",
          title: "Starting Location",
          maxLength: 500
        },
        to: {
          type: "string",
          title: "Destination",
          maxLength: 500
        },
        departureTime: {
          type: "string",
          title: "Departure Time",
          format: "datetime-local"
        },
        availableSeats: {
          type: "number",
          title: "Available Seats",
          minimum: 1,
          maximum: 8
        },
        pricePerSeat: {
          type: "string",
          title: "Price per Seat (MAD)",
          pattern: "^[0-9]+(\\.[0-9]{1,2})?$"
        },
        vehicleInfo: {
          type: "string",
          title: "Vehicle Information",
          maxLength: 200
        }
      },
      required: ["from", "to", "departureTime", "availableSeats", "pricePerSeat", "vehicleInfo"]
    },
    uiSchema: {
      from: { "ui:widget": "location" },
      to: { "ui:widget": "location" },
      departureTime: { "ui:widget": "datetime" },
      availableSeats: { "ui:widget": "select" },
      vehicleInfo: { "ui:placeholder": "e.g., White Toyota Corolla - ABC123" }
    },
    mutation: "createRideOffer",
    successMessage: "Your ride offer has been posted!"
  },

  // Feedback Form
  submitFeedback: {
    schema: {
      title: "Submit Feedback", 
      description: "Help us improve CoRide Morocco",
      type: "object",
      properties: {
        feedbackType: {
          type: "string",
          title: "Feedback Type",
          enum: ["compliment", "suggestion", "complaint", "feature_request", "bug_report"],
          enumNames: ["Compliment", "Suggestion", "Complaint", "Feature Request", "Bug Report"]
        },
        subject: {
          type: "string",
          title: "Subject",
          maxLength: 200
        },
        message: {
          type: "string",
          title: "Your Feedback",
          maxLength: 2000
        },
        rating: {
          type: "number",
          title: "Overall App Rating",
          minimum: 1,
          maximum: 5
        }
      },
      required: ["feedbackType", "subject", "message", "rating"]
    },
    uiSchema: {
      feedbackType: { "ui:widget": "select" },
      message: { "ui:widget": "textarea" },
      rating: { "ui:widget": "rating" }
    },
    mutation: "submitFeedback",
    successMessage: "Thank you for your feedback!"
  },

  // Report Issue Form
  reportIssue: {
    schema: {
      title: "Report an Issue",
      description: "Report a problem with a ride or user",
      type: "object", 
      properties: {
        issueType: {
          type: "string",
          title: "Issue Type",
          enum: ["safety_concern", "inappropriate_behavior", "no_show", "vehicle_condition", "payment_dispute", "other"],
          enumNames: ["Safety Concern", "Inappropriate Behavior", "No Show", "Vehicle Condition", "Payment Dispute", "Other"]
        },
        incident: {
          type: "string",
          title: "Incident Description",
          maxLength: 2000
        },
        occurred: {
          type: "string",
          title: "When did this occur?",
          format: "datetime-local"
        },
        severity: {
          type: "string",
          title: "Severity Level",
          enum: ["minor", "moderate", "serious", "critical"],
          enumNames: ["Minor", "Moderate", "Serious", "Critical"]
        }
      },
      required: ["issueType", "incident", "occurred", "severity"]
    },
    uiSchema: {
      issueType: { "ui:widget": "select" },
      incident: { "ui:widget": "textarea" },
      occurred: { "ui:widget": "datetime" },
      severity: { "ui:widget": "select" }
    },
    mutation: "reportIssue",
    successMessage: "Your report has been submitted."
  },

  // Add Location Form
  addLocation: {
    schema: {
      title: "Add Location",
      description: "Save a frequently visited location for quick access",
      type: "object",
      properties: {
        locationType: {
          type: "string",
          title: "Location Type",
          enum: ["home", "work", "university", "other"],
          enumNames: ["Home", "Work", "University", "Other"]
        },
        locationName: {
          type: "string",
          title: "Location Name",
          maxLength: 100,
          minLength: 2
        },
        address: {
          type: "string",
          title: "Address",
          maxLength: 500,
          minLength: 5
        },
        latitude: {
          type: "number",
          title: "Latitude",
          minimum: -90,
          maximum: 90
        },
        longitude: {
          type: "number",
          title: "Longitude",
          minimum: -180,
          maximum: 180
        }
      },
      required: ["locationType", "locationName", "address"]
    },
    uiSchema: {
      locationType: { 
        "ui:widget": "select",
        "ui:description": "Choose the type that best describes this location"
      },
      locationName: { 
        "ui:placeholder": "e.g., Home, Office, University...",
        "ui:description": "Give this location a memorable name"
      },
      address: { 
        "ui:widget": "location",
        "ui:placeholder": "Select location on map",
        "ui:description": "Tap to open map and select the exact location"
      },
      latitude: { 
        "ui:widget": "hidden"
      },
      longitude: { 
        "ui:widget": "hidden"
      }
    },
    mutation: "addLocation",
    successMessage: "Location saved successfully!",
    errorMessage: "Failed to save location. Please try again."
  },

  // Driver License Details Form
  driverLicenseDetails: {
    schema: {
      title: "Driver License Details",
      description: "Please provide your driver license information before uploading photos",
      type: "object",
      properties: {
        licenseNumber: {
          type: "string",
          title: "License Number",
          minLength: 9,
          maxLength: 9,
          pattern: "^[A-Z0-9]{2}\/[0-9]{6}$"
        },
        expiryDate: {
          type: "string",
          title: "Expiry Date",
          format: "date"
        }
      },
      required: ["licenseNumber", "expiryDate"]
    },
    uiSchema: {
      licenseNumber: {
        "ui:placeholder": "Enter your license number (e.g., AB/123456 or 05/789873)",
        "ui:description": "Moroccan driver license format: 2 letters/numbers / 6 numbers",
        "ui:options": { 
          autoCapitalize: "characters",
          mask: "XX/XXXXXX",
          placeholder: "XX/XXXXXX"
        }
      },
      expiryDate: {
        "ui:widget": "date",
        "ui:placeholder": "Select expiry date",
        "ui:description": "Select your license expiry date",
        "ui:options": { 
          minimumDate: "today",
          maximumDate: "2040-12-31",
          futureOnly: true
        }
      }
    },
    mutation: "driverLicenseDetails",
    successMessage: "License details validated successfully!",
    errorMessage: "Please check your license details and try again."
  }
};

// Utility Functions
export function getFormSchema(formName: string): FormDefinition | undefined {
  return formSchemas[formName];
}

export function getAvailableFormNames(): string[] {
  return Object.keys(formSchemas);
}

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
      errors[requiredField] = `${fieldDef?.title || requiredField} is required`;
    }
  }

  // Validate field constraints
  for (const [fieldName, fieldData] of Object.entries(data)) {
    const fieldDef = schema.properties[fieldName];
    if (!fieldDef || (!fieldData && !schema.required.includes(fieldName))) {
      continue;
    }

    const value = fieldData;

    switch (fieldDef.type) {
      case "string":
        if (typeof value !== "string") continue;
        
        if (fieldDef.minLength && value.length < fieldDef.minLength) {
          errors[fieldName] = `${fieldDef.title} must be at least ${fieldDef.minLength} characters`;
        }
        if (fieldDef.maxLength && value.length > fieldDef.maxLength) {
          errors[fieldName] = `${fieldDef.title} must be less than ${fieldDef.maxLength} characters`;
        }
        if (fieldDef.pattern && !new RegExp(fieldDef.pattern).test(value)) {
          errors[fieldName] = `${fieldDef.title} format is invalid`;
        }
        if (fieldDef.enum && !fieldDef.enum.some(enumVal => String(enumVal) === String(value))) {
          errors[fieldName] = `${fieldDef.title} must be one of: ${fieldDef.enumNames?.join(", ") || fieldDef.enum.join(", ")}`;
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
        break;
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
