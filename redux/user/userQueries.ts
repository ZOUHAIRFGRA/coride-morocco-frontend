import { gql } from "graphql-tag";

// Query to get user information
export const GET_USER = gql`
  query USER {
    user {
      city
      country
      dateJoined
      email
      firstName
      handle
      id
      isActive
      isPremium
      isStaff
      isSuperuser
      isVerified
      language {
        code
        name
        sortOrder
      }
      lastLogin
      lastName
      localizationIsOn
      notificationIsOn
      
      phone
      premiumSince
      profileImage
      state
      streetAddress
      userBio
      userUuid
      zipCode
    }
  }
`;

// Mutation to update user profile information
export const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserMutationInput!) {
    updateUser(input: $input) {
      internalId
      success
      message
      clientMutationId
    }
  }
`;
