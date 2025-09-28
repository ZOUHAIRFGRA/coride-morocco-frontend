import { FeedPost, GetAllPostsResponse, PostsEdge, PostsPageInfo } from "@/redux/investment";

describe("Investment API Types", () => {
  // Create mock data
  const mockNewsSource = {
    title: "Financial Times",
    url: "https://ft.com/article/123",
  };

  const mockDate = new Date();
  const mockCreatedAt = mockDate.toISOString();

  const createMockFeedPost = (id: string, ticker: string, confidence: number, action: string): FeedPost => ({
    id,
    confidence,
    analysis: `Analysis for ${ticker} with ${confidence}% confidence`,
    action,
    createdAt: mockCreatedAt,
    updatedAt: mockCreatedAt,
    ticker,
    newsSources: [mockNewsSource],
    handle: "@financial_analyst",
    likes: 42,
    comments: 7,
  });

  // Test Posts Response structure
  it("should properly structure a GetAllPostsResponse", () => {
    // Create mock posts
    const mockPosts: FeedPost[] = [createMockFeedPost("post-1", "AAPL", 85, "BUY"), createMockFeedPost("post-2", "MSFT", 65, "SELL")];

    // Create mock page info
    const mockPageInfo: PostsPageInfo = {
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: "cursor-post-1",
      endCursor: "cursor-post-2",
    };

    // Create mock edges
    const mockEdges: PostsEdge[] = mockPosts.map((post) => ({
      cursor: `cursor-${post.id}`,
      node: post,
    }));

    // Create mock response
    const mockResponse: GetAllPostsResponse = {
      allPosts: {
        edges: mockEdges,
        pageInfo: mockPageInfo,
      },
    };

    // Verify structure
    expect(mockResponse.allPosts.edges.length).toBe(2);
    expect(mockResponse.allPosts.edges[0].node.id).toBe("post-1");
    expect(mockResponse.allPosts.edges[1].node.id).toBe("post-2");

    // Verify node data is preserved
    const firstPost = mockResponse.allPosts.edges[0].node;
    expect(firstPost.ticker).toBe("AAPL");
    expect(firstPost.confidence).toBe(85);
    expect(firstPost.action).toBe("BUY");

    // Verify pageInfo
    expect(mockResponse.allPosts.pageInfo.hasNextPage).toBe(true);
    expect(mockResponse.allPosts.pageInfo.hasPreviousPage).toBe(false);
  });

  it("should work with pagination parameters", () => {
    // Define pagination parameters type structure
    interface PaginationParams {
      first?: number | null;
      after?: string | null;
      last?: number | null;
      before?: string | null;
      offset?: number | null;
      _queryId?: string;
    }

    // Test forward pagination
    const forwardPagination: PaginationParams = {
      first: 10,
      after: "cursor-post-5",
      _queryId: "forward-pagination",
    };

    // Test backward pagination
    const backwardPagination: PaginationParams = {
      last: 10,
      before: "cursor-post-15",
      _queryId: "backward-pagination",
    };

    // Verify structure validity
    expect(forwardPagination.first).toBe(10);
    expect(forwardPagination.after).toBe("cursor-post-5");
    expect(backwardPagination.last).toBe(10);
    expect(backwardPagination.before).toBe("cursor-post-15");
  });

  it("should support building complex feed structures", () => {
    // Create a more complex feed with multiple posts
    const feedPosts: FeedPost[] = [
      createMockFeedPost("post-1", "AAPL", 85, "BUY"),
      createMockFeedPost("post-2", "MSFT", 65, "SELL"),
      createMockFeedPost("post-3", "TSLA", 92, "BUY"),
      createMockFeedPost("post-4", "AMZN", 45, "SELL"),
      createMockFeedPost("post-5", "GOOGL", 78, "BUY"),
    ];

    // Group posts by action type
    const buyPosts = feedPosts.filter((post) => post.action === "BUY");
    const sellPosts = feedPosts.filter((post) => post.action === "SELL");

    // Group posts by confidence level
    const highConfidencePosts = feedPosts.filter((post) => post.confidence > 80);
    const mediumConfidencePosts = feedPosts.filter((post) => post.confidence > 60 && post.confidence <= 80);
    const lowConfidencePosts = feedPosts.filter((post) => post.confidence <= 60);

    // Verify groupings
    expect(buyPosts.length).toBe(3);
    expect(sellPosts.length).toBe(2);
    expect(highConfidencePosts.length).toBe(2);
    expect(mediumConfidencePosts.length).toBe(2);
    expect(lowConfidencePosts.length).toBe(1);

    // Verify that we can sort posts by confidence
    const sortedByConfidence = [...feedPosts].sort((a, b) => b.confidence - a.confidence);
    expect(sortedByConfidence[0].ticker).toBe("TSLA");
    expect(sortedByConfidence[1].ticker).toBe("AAPL");
  });
});
