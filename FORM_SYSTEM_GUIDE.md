# Form System Guide for CoRide Morocco

## Core Principle: Always Use Form-Driven Schemas

**IMPORTANT**: All forms in the CoRide Morocco app must use the form-driven schema system. Never create standalone forms - always leverage the schema registry for consistency, validation, and maintainability.

## System Overview

The CoRide Morocco app uses a centralized form system based on JSON Schema that provides:
- ✅ Automatic form rendering and validation
- ✅ Consistent UI/UX across all forms
- ✅ Type safety with TypeScript interfaces
- ✅ Mock API integration for development
- ✅ Centralized form definitions

## Key Components

### 1. Schema Registry (`constants/formSchemas.ts`)
- **Purpose**: Central registry for all form definitions
- **Pattern**: Use JSON Schema format for consistent structure
- **Forms Available**: contactSupport, createRideRequest, createRideOffer, submitFeedback, reportIssue

### 2. Form Modal (`components/schema-forms/FormModal.tsx`)
- **Purpose**: Renders forms as modal overlays
- **Usage**: For quick forms and secondary actions
- **Integration**: Uses mock API functions for CoRide Morocco

### 3. Form Screen (`components/schema-forms/FormScreen.tsx`)
- **Purpose**: Renders forms as full-screen experiences
- **Usage**: For complex forms and primary actions
- **Features**: Navigation, keyboard handling, validation feedback

### 4. Field Renderer (`components/schema-forms/FormFieldRenderer.tsx`)
- **Purpose**: Renders individual form fields based on schema
- **Support**: Text, email, password, number, select, textarea, datetime fields
- **Features**: Automatic validation, error display, accessibility

## Form Creation Workflow

### Step 1: Define Schema in `formSchemas.ts`
```typescript
export const formSchemas: FormSchemas = {
  myNewForm: {
    schema: {
      type: "object",
      title: "My New Form",
      description: "Description of what this form does",
      properties: {
        fieldName: {
          type: "string",
          title: "Field Label",
          // Add validation rules here
        }
      },
      required: ["fieldName"]
    },
    uiSchema: {
      fieldName: {
        "ui:widget": "text",
        "ui:placeholder": "Enter value..."
      }
    },
    successMessage: "Form submitted successfully!",
    errorMessage: "There was an error submitting the form."
  }
};
```

### Step 2: Add Mock API Function
```typescript
// In FormModal.tsx or FormScreen.tsx
const mockSubmitForm = async (formName: string, data: any) => {
  // Add your form handling logic
  switch (formName) {
    case "myNewForm":
      return { success: true, message: "Success message" };
  }
};
```

### Step 3: Use the Form Components
```typescript
// For Modal
<FormModal
  isVisible={isModalVisible}
  onClose={() => setModalVisible(false)}
  formName="myNewForm"
/>

// For Screen (via navigation)
router.push(`/form-screen?formName=myNewForm`);
```

## CoRide Morocco Specific Forms

### Contact Support (`contactSupport`)
- **Purpose**: User support requests and inquiries
- **Fields**: subject, message, priority
- **Usage**: Help section, support chat

### Create Ride Request (`createRideRequest`)
- **Purpose**: Passengers requesting rides
- **Fields**: from, to, departureTime, passengers, notes
- **Features**: Default departure time, passenger count validation

### Create Ride Offer (`createRideOffer`)
- **Purpose**: Drivers offering rides
- **Fields**: from, to, departureTime, availableSeats, pricePerSeat, notes
- **Features**: Seat count validation, price formatting

### Submit Feedback (`submitFeedback`)
- **Purpose**: User experience feedback and ratings
- **Fields**: rating, category, message
- **Features**: 5-star rating system, categorized feedback

### Report Issue (`reportIssue`)
- **Purpose**: Safety and quality issue reporting
- **Fields**: type, description, severity, occurred, location
- **Features**: Severity levels, timestamp tracking

## Field Types and Validation

### Supported Field Types
- `string`: Text input with optional length limits
- `number`: Numeric input with min/max validation
- `email`: Email validation with format checking
- `datetime-local`: Date and time picker
- `select`: Dropdown with predefined options
- `textarea`: Multi-line text input

### UI Schema Options
```typescript
uiSchema: {
  fieldName: {
    "ui:widget": "text" | "textarea" | "select" | "number" | "email" | "datetime-local",
    "ui:placeholder": "Placeholder text",
    "ui:description": "Help text for users",
    "ui:options": ["option1", "option2"] // For select fields
  }
}
```

## Best Practices

### DO ✅
- Always use the schema registry for new forms
- Follow the established naming conventions
- Include comprehensive validation rules
- Provide clear error messages
- Add accessibility labels
- Use mock API functions for development
- Test forms on both modal and screen components

### DON'T ❌
- Create standalone form components
- Hardcode form fields in JSX
- Skip validation or error handling
- Forget to update the schema registry
- Use real API calls in development
- Mix form patterns (always use schema-driven)

## Error Handling

### Validation Errors
- Automatic field-level validation based on JSON Schema
- Real-time error display as users type
- Form-level validation before submission
- Clear, actionable error messages

### Submission Errors
- Network error handling with retry options
- User-friendly error messages
- Haptic feedback for better UX
- Logging for debugging purposes

## Development Guidelines

### Adding New Forms
1. Define schema in `formSchemas.ts`
2. Add mock API function
3. Test with both FormModal and FormScreen
4. Verify validation rules work correctly
5. Test accessibility features
6. Update this documentation

### Modifying Existing Forms
1. Update schema definition
2. Ensure backward compatibility
3. Test all form usage locations
4. Update validation tests
5. Verify API integration still works

### Testing Forms
1. Test all field types and validation rules
2. Test both success and error scenarios
3. Verify accessibility (screen readers, keyboard navigation)
4. Test on different screen sizes
5. Test with real data variations

## Integration Points

### Navigation
```typescript
// Navigate to form screen
router.push(`/(main)/form-screen?formName=${formName}`);

// Open form modal
setFormModalVisible(true);
setSelectedForm(formName);
```

### API Integration
- Mock functions during development
- Replace with real API calls when backend is ready
- Maintain same response format for consistency
- Handle loading states and error scenarios

## Security Considerations

### Data Validation
- All input sanitization through JSON Schema
- Type checking at runtime
- Required field enforcement
- Length limits and format validation

### Sensitive Data
- No sensitive data in form schemas
- Secure transmission for production APIs
- Proper error message handling (no data leaks)
- Input sanitization for security

## Future Enhancements

### Planned Features
- File upload support for forms
- Multi-step form wizard capability
- Dynamic field conditions (show/hide based on other fields)
- Form analytics and usage tracking
- Offline form submission queue

### Extensibility
- Plugin system for custom field types
- Custom validation rules
- Form templates for common patterns
- Integration with external services

---

**Remember**: The form-driven schema system is the foundation of all form interactions in CoRide Morocco. Always use this system to ensure consistency, maintainability, and the best user experience.

For questions or clarifications about the form system, refer to this guide or check the existing form implementations in the schema registry.
