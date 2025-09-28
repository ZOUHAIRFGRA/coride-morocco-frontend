# VoxProfit App Testing Guide

This document outlines the testing practices and guidelines for the VoxProfit application.

## Testing Framework

We use Jest as our primary testing framework, along with React Native Testing Library for component testing. This setup provides a robust environment
for unit testing React Native components, utilities, and business logic.

## Test Structure

The test files are organized in the `__tests__` directory, mirroring the structure of the source code:

```
__tests__/
  ├── components/        # Tests for UI components
  │   ├── ui/            # Tests for basic UI elements
  │   └── ...
  ├── contexts/          # Tests for context providers
  ├── utils/             # Tests for utility functions
  └── screens/           # Tests for screens/pages
```

## Running Tests

To run tests, use the following NPM scripts:

- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Coverage Thresholds

We aim to maintain high code coverage with the following thresholds:

- **Statements**: 80%
- **Branches**: 70%
- **Functions**: 80%
- **Lines**: 80%

## Writing Tests

### Component Tests

When testing components, follow these guidelines:

1. Test basic rendering
2. Test user interactions (e.g., button presses)
3. Test prop variations
4. Test state changes
5. Use test IDs for reliable element selection

Example:

```jsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { MyComponent } from "@/components/MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    const { getByText } = render(<MyComponent label="Test" />);
    expect(getByText("Test")).toBeTruthy();
  });

  it("handles press events", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<MyComponent label="Test" onPress={onPressMock} testID="my-button" />);

    fireEvent.press(getByTestId("my-button"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
```

### Context Tests

For testing context providers:

1. Test that the context provides the expected values
2. Test context updates when actions are dispatched
3. Test error handling when the context is used outside its provider

### Utility Tests

For utility functions:

1. Test regular usage with expected inputs
2. Test edge cases and boundary conditions
3. Test error handling

## Mocking

We use Jest's mocking capabilities to mock:

1. Native modules (like AsyncStorage)
2. Third-party libraries
3. API calls
4. Context providers when testing components that use contexts

Example of mocking a module:

```javascript
jest.mock("@react-native-async-storage/async-storage", () => require("@react-native-async-storage/async-storage/jest/async-storage-mock"));
```

## Best Practices

1. **Descriptive Test Names**: Use descriptive test names that explain what the test is checking
2. **Arrange-Act-Assert Pattern**: Structure tests with clear arrangement, action, and assertion phases
3. **Isolation**: Ensure tests are isolated and don't depend on each other
4. **Focused Tests**: Each test should focus on testing one specific behavior
5. **Clean Setup/Teardown**: Use `beforeEach` and `afterEach` to set up and clean up test environment

## Continuous Integration

Tests are automatically run as part of our CI pipeline. All tests must pass before code can be merged into the main branch.

## Snapshot Testing

Use snapshot testing judiciously for UI components that have a stable appearance. Remember to update snapshots when there are intentional UI changes:

```jsx
it("matches snapshot", () => {
  const tree = renderer.create(<MyComponent />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [React Hooks Testing Library](https://github.com/testing-library/react-hooks-testing-library)
