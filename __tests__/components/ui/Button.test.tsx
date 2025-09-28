import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button, ButtonText } from "@/components/ui/button";

describe("Button Component", () => {
  it("renders correctly with default props", () => {
    const { getByText } = render(
      <Button>
        <ButtonText>Test Button</ButtonText>
      </Button>
    );

    expect(getByText("Test Button")).toBeTruthy();
  });

  it("calls onPress handler when pressed", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button onPress={onPressMock}>
        <ButtonText>Test Button</ButtonText>
      </Button>
    );

    fireEvent.press(getByText("Test Button"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("renders with primary action and solid variant by default", () => {
    const { getByTestId } = render(
      <Button testID="button">
        <ButtonText>Test Button</ButtonText>
      </Button>
    );

    const button = getByTestId("button");
    // Check style props through className or style
    // Note: The exact implementation depends on how the component applies styles
    expect(button.props.className).toContain("bg-primary-500");
  });

  it("renders with secondary action when specified", () => {
    const { getByTestId } = render(
      <Button action="secondary" testID="button">
        <ButtonText>Test Button</ButtonText>
      </Button>
    );

    const button = getByTestId("button");
    expect(button.props.className).toContain("bg-secondary-500");
  });

  it("renders with outline variant when specified", () => {
    const { getByTestId } = render(
      <Button variant="outline" testID="button">
        <ButtonText>Test Button</ButtonText>
      </Button>
    );

    const button = getByTestId("button");
    expect(button.props.className).toContain("bg-transparent");
    expect(button.props.className).toContain("border");
  });

  it("renders with different sizes when specified", () => {
    const { getByTestId } = render(
      <Button size="lg" testID="button">
        <ButtonText>Test Button</ButtonText>
      </Button>
    );

    const button = getByTestId("button");
    expect(button.props.className).toContain("h-11");
  });

  it("renders correctly in disabled state", () => {
    const { getByTestId } = render(
      <Button isDisabled testID="button">
        <ButtonText>Test Button</ButtonText>
      </Button>
    );

    const button = getByTestId("button");
    // Check if the className contains the disabled class
    expect(button.props.className).toContain("data-[disabled=true]");
  });

  it("should not call onPress when disabled", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button onPress={onPressMock} isDisabled>
        <ButtonText>Test Button</ButtonText>
      </Button>
    );

    fireEvent.press(getByText("Test Button"));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
