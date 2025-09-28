import { createApi } from "@reduxjs/toolkit/query/react";
import { baseGraphQLQuery } from "../baseApi";
import { GET_USER, UPDATE_USER } from "./userQueries";
import { UpdateUserInput, UpdateUserResponse, UserProfileResponse } from "./userTypes";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseGraphQLQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserProfileResponse, void>({
      query: () => ({
        document: GET_USER,
      }),
      transformResponse: (response: UserProfileResponse) => response,
      providesTags: ["User"],
    }),

    updateUserProfile: builder.mutation<UpdateUserResponse, UpdateUserInput>({
      query: (input) => ({
        document: UPDATE_USER,
        variables: { input },
      }),
      transformResponse: (response: { updateUser: UpdateUserResponse }) => response.updateUser,
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useGetUserProfileQuery, useUpdateUserProfileMutation } = userApi;
