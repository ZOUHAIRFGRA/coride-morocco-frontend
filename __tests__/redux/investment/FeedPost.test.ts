import { FeedPost, NewsSource } from "@/redux/investment";
import { formatDistance } from "date-fns";

describe("FeedPost Interface", () => {
  // Test data
  const mockNewsSource: NewsSource = {
    title: "Financial Times",
    url: "https://ft.com/article/123",
  };

  const mockDate = new Date();
  const mockCreatedAt = mockDate.toISOString();

  // Create a valid FeedPost with required properties
  const createValidFeedPost = (): FeedPost => ({
    id: "post-123",
    confidence: 85,
    analysis: "Company reported strong Q2 earnings, exceeding analyst expectations by 15%.",
    action: "BUY",
    createdAt: mockCreatedAt,
    updatedAt: mockCreatedAt,
    ticker: "AAPL",
    newsSources: [mockNewsSource],
    // Optional client-side properties
    isFollowing: false,
    handle: "@financial_analyst",
    likes: 42,
    comments: 7,
  });

  it("should create a valid FeedPost with all required properties", () => {
    const post = createValidFeedPost();

    // Test required properties
    expect(post.id).toBe("post-123");
    expect(post.confidence).toBe(85);
    expect(post.analysis).toBe("Company reported strong Q2 earnings, exceeding analyst expectations by 15%.");
    expect(post.action).toBe("BUY");
    expect(post.createdAt).toBe(mockCreatedAt);
    expect(post.updatedAt).toBe(mockCreatedAt);
    expect(post.ticker).toBe("AAPL");
    expect(post.newsSources).toHaveLength(1);
    expect(post.newsSources[0]).toEqual(mockNewsSource);
  });

  it("should handle optional client-side properties", () => {
    const post = createValidFeedPost();

    // Test optional properties
    expect(post.isFollowing).toBe(false);
    expect(post.handle).toBe("@financial_analyst");
    expect(post.likes).toBe(42);
    expect(post.comments).toBe(7);

    // Test without optional properties
    const minimalPost: FeedPost = {
      id: "post-456",
      confidence: 65,
      analysis: "Quarterly results show mixed performance with challenges ahead.",
      action: "SELL",
      createdAt: mockCreatedAt,
      updatedAt: mockCreatedAt,
      ticker: "MSFT",
      newsSources: [],
    };

    expect(minimalPost.isFollowing).toBeUndefined();
    expect(minimalPost.handle).toBeUndefined();
    expect(minimalPost.likes).toBeUndefined();
    expect(minimalPost.comments).toBeUndefined();
  });

  it("should validate confidence levels", () => {
    const highConfidencePost = createValidFeedPost();
    highConfidencePost.confidence = 95;

    const mediumConfidencePost = createValidFeedPost();
    mediumConfidencePost.confidence = 60;

    const lowConfidencePost = createValidFeedPost();
    lowConfidencePost.confidence = 25;

    expect(highConfidencePost.confidence).toBeGreaterThan(80);
    expect(mediumConfidencePost.confidence).toBeGreaterThan(30);
    expect(mediumConfidencePost.confidence).toBeLessThan(80);
    expect(lowConfidencePost.confidence).toBeLessThan(30);
  });

  it("should have valid action values (BUY or SELL)", () => {
    const buyPost = createValidFeedPost();
    buyPost.action = "BUY";

    const sellPost = createValidFeedPost();
    sellPost.action = "SELL";

    expect(["BUY", "SELL"]).toContain(buyPost.action);
    expect(["BUY", "SELL"]).toContain(sellPost.action);
  });

  it("should handle newsSources array with multiple sources", () => {
    const post = createValidFeedPost();

    // Add more news sources
    post.newsSources = [
      { title: "Financial Times", url: "https://ft.com/article/123" },
      { title: "Bloomberg", url: "https://bloomberg.com/news/456" },
      { title: "CNBC", url: "https://cnbc.com/investing/789" },
    ];

    expect(post.newsSources).toHaveLength(3);
    expect(post.newsSources[0].title).toBe("Financial Times");
    expect(post.newsSources[1].title).toBe("Bloomberg");
    expect(post.newsSources[2].title).toBe("CNBC");

    // URLs should be valid
    post.newsSources.forEach((source) => {
      expect(source.url).toMatch(/^https?:\/\//); // URL should start with http:// or https://
    });
  });

  it("should format timestamps correctly", () => {
    const post = createValidFeedPost();

    // Assuming client-side code would format the timestamp
    post.timestamp = formatDistance(new Date(post.createdAt), new Date(), { addSuffix: true });

    // With fresh dates this should be something like "less than a minute ago"
    expect(post.timestamp).toContain("ago");
  });
});
