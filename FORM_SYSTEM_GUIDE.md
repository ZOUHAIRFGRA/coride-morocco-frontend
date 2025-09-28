# 📝 Form System Guide for Backend Developers

> **Issue #60 Complete**: Dynamic schema-driven form system where adding forms only requires editing the schema file.

## 🎯 **Overview**

The VoxProfit app now uses a **schema-driven form system** that allows backend developers to add new forms without writing any UI code. Simply define your form in the schema registry, and it will automatically render with validation, styling, and API integration.

---

## 🚀 **Quick Start: Adding a New Form**

### **Step 1: Define Your Form Schema**

Add your form definition to `constants/formSchemas.ts`:

```typescript
export const formSchemas: Record<string, FormDefinition> = {
  // ...existing forms...

  yourNewForm: {
    schema: {
      title: "Your Form Title",
      description: "Brief description of what this form does",
      type: "object",
      properties: {
        fieldName: {
          type: "string",
          title: "Field Label",
          maxLength: 100,
          description: "Help text for this field"
        },
        // Add more fields...
      },
      required: ["fieldName"]
    },
    uiSchema: {
      fieldName: {
        "ui:placeholder": "Enter value here"
      }
    },
    mutation: "yourApiMutation",
    successMessage: "Form submitted successfully!"
  }
};
```

### **Step 2: Use Your Form**

**Option A: As a Modal**
```typescript
<FormModal 
  visible={true}
  formName="yourNewForm"
  onClose={handleClose}
  onSuccess={handleSuccess}
/>
```

**Option B: As a Full Screen**
```typescript
// Navigate to: /form/yourNewForm
router.push("/form/yourNewForm");
```

**That's it! No UI code needed.** 🎉

---

## 📋 **Schema Reference**

### **Form Definition Structure**

```typescript
interface FormDefinition {
  schema: FormSchema;        // JSON Schema for validation
  uiSchema: UISchema;        // UI hints and styling
  mutation: string;          // API endpoint name
  successMessage: string;    // Success feedback
  errorMessage?: string;     // Optional error message
}
```

### **Field Types Supported**

| **Type** | **Purpose** | **Example** |
|----------|-------------|-------------|
| `string` | Text input, email, phone | Name, email, description |
| `number` | Numeric input, sliders | Age, price, confidence |
| `boolean` | Switches, checkboxes | Terms acceptance, toggles |
| `array` | Multiple selections | Tags, funding sources |
| `object` | Nested form sections | Address, contact info |

### **Field Properties**

```typescript
interface FormField {
  type: string;              // "string", "number", "boolean", "array"
  title: string;             // Field label shown to user
  description?: string;      // Help text below field
  
  // String constraints
  maxLength?: number;        // Maximum character length
  minLength?: number;        // Minimum character length
  pattern?: string;          // Regex validation pattern
  format?: string;           // "email", "date", "ipv4", etc.
  
  // Number constraints  
  minimum?: number;          // Minimum value
  maximum?: number;          // Maximum value
  multipleOf?: number;       // Must be multiple of this value
  
  // Dropdown options
  enum?: string[];           // Available options ["option1", "option2"]
  enumNames?: string[];      // Display names ["Option 1", "Option 2"]
  
  // Array constraints
  minItems?: number;         // Minimum array length
  maxItems?: number;         // Maximum array length
  uniqueItems?: boolean;     // All items must be unique
}
```

### **UI Schema Options**

```typescript
interface UISchemaField {
  "ui:widget"?: string;      // Widget type (see below)
  "ui:placeholder"?: string; // Placeholder text
  "ui:help"?: string;        // Help text
  "ui:options"?: object;     // Widget-specific options
}
```

### **Available Widgets**

| **Widget** | **Use For** | **Example** |
|------------|-------------|-------------|
| `"text"` | Default text input | Names, descriptions |
| `"email"` | Email validation | Email addresses |
| `"password"` | Hidden input | Passwords, tokens |
| `"textarea"` | Multi-line text | Comments, analysis |
| `"select"` | Dropdown menu | Countries, categories |
| `"radio"` | Single choice | Payment method |
| `"checkboxes"` | Multiple choice | Features, preferences |
| `"switch"` | Boolean toggle | Enable/disable |
| `"date"` | Date picker | Birth date, deadlines |
| `"slider"` | Numeric range | Confidence, rating |
| `"hidden"` | Auto-populated | IDs, timestamps |

---

## 🎨 **Styling & Theming**

The form system automatically applies your app's theme from `constants/theme.ts`:

```typescript
// Forms automatically use these theme values:
COLORS.primary.light        // Primary buttons, accents
COLORS.primary.gradient     // Button gradients
COLORS.text.primary         // Field labels
COLORS.text.secondary       // Help text, placeholders
COLORS.background.white     // Form background
COLORS.border.primary       // Field borders
FONTS.regular              // Body text
FONTS.semiBold             // Labels, buttons
```

### **Custom Styling Options**

```typescript
uiSchema: {
  fieldName: {
    "ui:options": {
      backgroundColor: "#F5F9FF",  // Custom background
      borderColor: "#0077B6",      // Custom border
      textColor: "#333"            // Custom text color
    }
  }
}
```

---

## 🔌 **API Integration**

### **1. Define Your Mutation**

Ensure your API mutation is available in the Redux store:

```typescript
// In your API slice
export const yourApiSlice = createApi({
  endpoints: (builder) => ({
    yourApiMutation: builder.mutation({
      query: (data) => ({
        url: '/your-endpoint',
        method: 'POST',
        body: data
      })
    })
  })
});
```

### **2. Add Mutation to FormModal**

Update `components/ui/FormModal.tsx` to include your mutation:

```typescript
import { useYourApiMutationMutation } from '@/redux/your-slice';

// Inside FormModal component:
const [yourApiMutation, { isLoading: isYourApiLoading }] = useYourApiMutationMutation();

// Add to getMutationHook function:
case "yourApiMutation":
  return { mutate: yourApiMutation, isLoading: isYourApiLoading };
```

### **3. Data Transformation**

If you need to transform data before sending to API:

```typescript
// In FormModal's handleSubmit function:
switch (formName) {
  case "yourNewForm":
    submissionData = {
      ...submissionData,
      // Transform data as needed
      processedField: processData(submissionData.rawField)
    };
    break;
}
```

---

## 📋 **Complete Example: Contact Form**

```typescript
// In constants/formSchemas.ts
createContact: {
  schema: {
    title: "Contact Us",
    description: "Send us a message and we'll get back to you soon.",
    type: "object",
    properties: {
      name: {
        type: "string",
        title: "Full Name",
        maxLength: 100,
        description: "Your first and last name"
      },
      email: {
        type: "string",
        title: "Email Address",
        format: "email",
        description: "We'll use this to respond to you"
      },
      subject: {
        type: "string",
        title: "Subject",
        enum: ["General", "Support", "Feedback", "Partnership"],
        enumNames: ["General Inquiry", "Technical Support", "App Feedback", "Business Partnership"]
      },
      message: {
        type: "string",
        title: "Message",
        maxLength: 1000,
        description: "Tell us how we can help you"
      },
      priority: {
        type: "string",
        title: "Priority Level",
        enum: ["low", "medium", "high"],
        enumNames: ["Low", "Medium", "High"]
      },
      newsletter: {
        type: "boolean",
        title: "Subscribe to our newsletter",
        description: "Get updates about new features and tips"
      }
    },
    required: ["name", "email", "subject", "message"]
  },
  uiSchema: {
    name: {
      "ui:placeholder": "Enter your full name"
    },
    email: {
      "ui:placeholder": "you@example.com"
    },
    subject: {
      "ui:widget": "select"
    },
    message: {
      "ui:widget": "textarea",
      "ui:placeholder": "Describe your inquiry in detail..."
    },
    priority: {
      "ui:widget": "radio"
    },
    newsletter: {
      "ui:widget": "switch"
    }
  },
  mutation: "createContact",
  successMessage: "Thank you! We'll get back to you within 24 hours."
}
```

**Usage:**
```typescript
// As a modal
<FormModal 
  visible={showContactForm}
  formName="createContact"
  onClose={() => setShowContactForm(false)}
  onSuccess={(result) => {
    console.log('Contact form submitted:', result);
    // Handle success (analytics, navigation, etc.)
  }}
/>

// As a screen
router.push('/form/createContact');
```

---

## 🔍 **Validation Examples**

### **Email Validation**
```typescript
email: {
  type: "string",
  format: "email",
  title: "Email Address"
}
```

### **Phone Number Validation**
```typescript
phone: {
  type: "string",
  pattern: "^[\\d\\s\\(\\)\\+\\-\\.]+$",
  title: "Phone Number",
  description: "Include country code if international"
}
```

### **Password Strength**
```typescript
password: {
  type: "string",
  minLength: 8,
  pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]",
  title: "Password",
  description: "Must include uppercase, lowercase, number, and special character"
}
```

### **Price/Currency**
```typescript
amount: {
  type: "string",
  pattern: "^[0-9]+(\\.[0-9]{1,2})?$",
  title: "Amount",
  description: "Enter amount in USD (e.g., 123.45)"
}
```

### **Date Range**
```typescript
birthDate: {
  type: "string",
  format: "date",
  title: "Date of Birth",
  // Note: Add custom validation in validateFormData function for age checks
}
```

---

## 🎛️ **Advanced Features**

### **Conditional Fields**

While not built-in, you can implement conditional logic:

```typescript
// In FormModal component, add conditional field rendering:
{Object.entries(formDefinition.schema.properties).map(([fieldName, fieldDef]) => {
  // Skip field based on conditions
  if (fieldName === 'conditionalField' && !formData.triggerField) {
    return null;
  }
  
  return (
    <FormFieldRenderer key={fieldName} ... />
  );
})}
```

### **Dynamic Options**

Load dropdown options from API:

```typescript
// In FormModal useEffect:
useEffect(() => {
  if (formName === 'yourForm') {
    // Load dynamic options
    fetchCountries().then(countries => {
      setFormData(prev => ({
        ...prev,
        _dynamicOptions: { countries }
      }));
    });
  }
}, [formName]);
```

### **File Uploads**

For file uploads, extend the FormFieldRenderer:

```typescript
// Add to FormFieldRenderer component:
case 'file':
  return (
    <View>
      <Text>{fieldDef.title}</Text>
      <TouchableOpacity onPress={handleFilePickOpen}>
        <Text>Choose File</Text>
      </TouchableOpacity>
    </View>
  );
```

---

## 🧪 **Testing Your Forms**

### **1. Schema Validation Test**

```typescript
import { validateFormData } from '@/constants/formSchemas';

const testData = {
  name: "John Doe",
  email: "john@example.com",
  // ... your test data
};

const result = validateFormData('yourNewForm', testData);
console.log('Valid:', result.isValid);
console.log('Errors:', result.errors);
```

### **2. Component Testing**

```typescript
// Test your form renders correctly
import { render } from '@testing-library/react-native';
import { FormModal } from '@/components/ui/FormModal';

test('renders contact form', () => {
  const { getByText } = render(
    <FormModal 
      visible={true}
      formName="createContact"
      onClose={jest.fn()}
    />
  );
  
  expect(getByText('Contact Us')).toBeTruthy();
});
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

**❌ Form not rendering**
```
✅ Check formName matches key in formSchemas exactly
✅ Verify schema structure follows FormDefinition interface
✅ Ensure mutation name is valid
```

**❌ Validation errors**
```
✅ Check required fields are present in test data
✅ Verify pattern regex is valid JavaScript regex
✅ Ensure enum values match exactly
```

**❌ API errors**
```
✅ Verify mutation is imported in FormModal.tsx
✅ Check API endpoint is working independently
✅ Ensure data transformation matches API expectations
```

**❌ Styling issues**
```
✅ Verify theme colors exist in constants/theme.ts
✅ Check NativeWind classes are supported by component
✅ Ensure responsive values use correct utility functions
```

### **Debugging Tools**

**1. Schema Validation**
```typescript
// Add to your form testing:
console.log('Form Schema:', getFormSchema('yourForm'));
console.log('Validation:', validateFormData('yourForm', testData));
```

**2. Form State**
```typescript
// Add to FormModal component for debugging:
console.log('Form Data:', formData);
console.log('Errors:', errors);
```

---

## 📚 **Available Forms**

Your app currently has these forms ready to use:

| **Form Name** | **Purpose** | **Usage** |
|---------------|-------------|-----------|
| `createAlpacaAccount` | Trading account creation | Investment onboarding |
| `createBankTransfer` | Bank transfers | Funding accounts |
| `createPost` | Trading posts | Social features |
| `createKycAlpacaAccount` | KYC compliance | Identity verification |
| `createAccount` | Financial accounts | Account management |
| `createBudget` | Budget planning | Financial planning |
| `createPriceAlert` | Stock alerts | Investment tracking |

---

## 🎯 **Best Practices**

### **1. Schema Design**
- ✅ Use clear, descriptive field titles
- ✅ Provide helpful descriptions for complex fields
- ✅ Choose appropriate validation constraints
- ✅ Group related fields logically

### **2. Validation**
- ✅ Make required fields obvious to users
- ✅ Use format validation for emails, dates, etc.
- ✅ Provide clear error messages
- ✅ Validate both client-side and server-side

### **3. User Experience**
- ✅ Use appropriate widgets for field types
- ✅ Provide placeholders and help text
- ✅ Keep forms concise when possible
- ✅ Test on different screen sizes

### **4. Maintenance**
- ✅ Document complex validation rules
- ✅ Keep schema and API in sync
- ✅ Test forms after schema changes
- ✅ Version control schema changes

---

## 🚀 **Migration from Custom Forms**

If you have existing custom forms, here's how to migrate them:

### **1. Extract Field Definitions**
```typescript
// From your custom form component:
const [name, setName] = useState("");
const [email, setEmail] = useState("");

// Convert to schema:
properties: {
  name: { type: "string", title: "Name" },
  email: { type: "string", format: "email", title: "Email" }
}
```

### **2. Extract Validation Rules**
```typescript
// From custom validation:
if (!email.includes('@')) {
  setError('Invalid email');
}

// Convert to schema:
email: {
  type: "string",
  format: "email",
  title: "Email Address"
}
```

### **3. Replace Component**
```typescript
// Replace custom form:
<YourCustomForm 
  visible={visible}
  onClose={onClose}
  onSubmit={onSubmit}
/>

// With schema form:
<FormModal
  visible={visible}
  formName="yourNewForm"
  onClose={onClose}
  onSuccess={onSubmit}
/>
```

---

## 📞 **Support**

If you need help adding forms or encounter issues:

1. **Check this guide** for examples and troubleshooting
2. **Review existing forms** in `formSchemas.ts` for patterns
3. **Test schemas** using the validation function
4. **Verify API integration** independently first

---

## 🎉 **Summary**

The schema-driven form system gives you:

- ✅ **Zero UI Code** - Just define schemas
- ✅ **Automatic Validation** - Built-in rules and error handling  
- ✅ **Consistent Styling** - Follows app theme automatically
- ✅ **API Integration** - Seamless backend connectivity
- ✅ **Mobile Optimized** - Works perfectly on iOS/Android
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Accessibility** - Screen reader and keyboard navigation
- ✅ **Future Proof** - Easy to extend and maintain

**Happy form building! 🚀**
