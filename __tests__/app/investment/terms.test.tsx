import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import TermsScreen from "../../../app/investment/terms";

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  Stack: {
    Screen: jest.fn(),
  },
}));

// Mock react-native-responsive-screen
jest.mock("react-native-responsive-screen", () => ({
  widthPercentageToDP: (percentage: number) => percentage,
  heightPercentageToDP: (percentage: number) => percentage,
}));

// Mock @/constants/theme
jest.mock("@/constants/theme", () => ({
  COLORS: {
    primary: {
      oceanBlue700: "#1E40AF",
      oceanBlue50: "#EFF6FF",
    },
    text: {
      gray: "#6B7280",
    },
  },
}));

const mockPush = jest.fn();
const mockBack = jest.fn();

describe("TermsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
  });

  it("renders the terms screen correctly", () => {
    const { getByText, getAllByText } = render(<TermsScreen />);

    expect(getByText("Terms & Privacy")).toBeTruthy();
    expect(getAllByText("Location Detection Terms")[0]).toBeTruthy();
    expect(getByText("Trading Terms & Conditions")).toBeTruthy();
    expect(getByText("Privacy Policy")).toBeTruthy();
    expect(getByText("Regulatory Compliance")).toBeTruthy();
  });

  it("displays location detection terms by default", () => {
    const { getByText } = render(<TermsScreen />);

    expect(getByText("Location Verification Policy")).toBeTruthy();
    expect(getByText("1. Legal Requirement")).toBeTruthy();
    expect(
      getByText(
        "Under securities regulations including the Securities Act of 1933, Investment Company Act of 1940, and various state securities laws, we must verify that users are located in authorized jurisdictions before providing investment services. This helps us comply with:"
      )
    ).toBeTruthy();
  });

  it("allows switching between different sections", () => {
    const { getByText } = render(<TermsScreen />);

    // Click on Trading Terms section
    fireEvent.press(getByText("Trading Terms & Conditions"));

    // Should show trading terms content
    expect(getByText("Investment and Trading Agreement")).toBeTruthy();
    expect(getByText("1. Investment Risks")).toBeTruthy();
  });

  it("allows switching to privacy policy section", () => {
    const { getByText } = render(<TermsScreen />);

    // Click on Privacy Policy section
    fireEvent.press(getByText("Privacy Policy"));

    // Should show privacy policy content
    expect(getByText("This Privacy Policy describes how VoxProfit collects, uses, and protects your personal information.")).toBeTruthy();
    expect(getByText("1. Information We Collect")).toBeTruthy();
  });

  it("allows switching to compliance section", () => {
    const { getByText } = render(<TermsScreen />);

    // Click on Regulatory Compliance section
    fireEvent.press(getByText("Regulatory Compliance"));

    // Should show compliance content
    expect(getByText("Regulatory Disclosures")).toBeTruthy();
    expect(getByText("1. FINRA BrokerCheck")).toBeTruthy();
  });

  it("calls router.back when back button is pressed", () => {
    const { getByText } = render(<TermsScreen />);

    fireEvent.press(getByText("Back"));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("loads specific section when section param is provided", () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      section: "privacy",
    });

    const { getByText } = render(<TermsScreen />);

    // Should show privacy policy content when section=privacy
    expect(getByText("Privacy Policy")).toBeTruthy();
  });

  it("displays contact information", () => {
    const { getByText } = render(<TermsScreen />);

    expect(getByText("Questions or Concerns?")).toBeTruthy();
    expect(getByText("support@voxprofit.com")).toBeTruthy();
    expect(getByText("privacy@voxprofit.com")).toBeTruthy();
    expect(getByText("Phone: 1-800-VOX-PROF")).toBeTruthy();
  });

  it("displays last updated information", () => {
    const { getByText } = render(<TermsScreen />);

    expect(getByText("Last Updated: " + new Date().toLocaleDateString())).toBeTruthy();
    expect(getByText("Version 1.0")).toBeTruthy();
  });

  it("contains important compliance warnings", () => {
    const { getByText } = render(<TermsScreen />);

    expect(getByText("⚠️ Important: VPN and Location Spoofing")).toBeTruthy();
    expect(
      getByText(
        "Using VPNs, proxies, or other location spoofing technologies may violate our Terms of Service and could result in account suspension or termination. We are required by law to verify your true location to provide financial services."
      )
    ).toBeTruthy();
  });

  it("contains risk warnings in trading section", () => {
    const { getByText } = render(<TermsScreen />);

    // Switch to trading section
    fireEvent.press(getByText("Trading Terms & Conditions"));

    expect(getByText("🚨 Risk Warning")).toBeTruthy();
    expect(
      getByText("Trading stocks, ETFs, and other securities can result in significant losses. Never invest more than you can afford to lose.")
    ).toBeTruthy();
  });

  it("contains GDPR compliance information", () => {
    const { getByText } = render(<TermsScreen />);

    // Switch to privacy section
    fireEvent.press(getByText("Privacy Policy"));

    expect(getByText("🔒 GDPR & CCPA Compliance")).toBeTruthy();
    expect(
      getByText("We comply with GDPR, CCPA, and other applicable privacy laws. Contact us at privacy@voxprofit.com for privacy-related requests.")
    ).toBeTruthy();
  });
});
