import { gql } from "graphql-tag";

// Query to get OTP
export const GET_OTP_MUTATION = gql`
  mutation GetOtp($input: OtpInput!) {
    getOtp(input: $input) {
      internalId
      success
      message
      clientMutationId
    }
  }
`;

// Mutation to create a new user
export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserMutationInput!) {
    createUser(input: $input) {
      success
      message
    }
  }
`;

// Query to verify OTP
export const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOtp($input: VerifyOtpInput!) {
    verifyOtp(input: $input) {
      internalId
      success
      message
      clientMutationId
      tokenAuth {
        accessToken
        refreshToken
      }
    }
  }
`;

// Query to refresh token
export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      payload
      refreshExpiresIn
      token
      refreshToken
    }
  }
`;
