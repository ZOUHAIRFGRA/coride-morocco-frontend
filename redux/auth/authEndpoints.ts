import { createApi } from "@reduxjs/toolkit/query/react";
import { baseGraphQLQuery } from "../baseApi";
import { CREATE_USER_MUTATION, GET_OTP_MUTATION, REFRESH_TOKEN_MUTATION, VERIFY_OTP_MUTATION } from "./authQueries";
import { CreateUserInput, CreateUserResponse, OtpInput, OtpResponse, RefreshTokenResponse, VerifyOtpDataResponse, VerifyOtpInput } from "./authTypes";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseGraphQLQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    createUser: builder.mutation<CreateUserResponse, CreateUserInput>({
      query: (input) => ({
        document: CREATE_USER_MUTATION,
        variables: { input },
      }),
      transformResponse: (response: { createUser: CreateUserResponse }) => response.createUser,
    }),

    login: builder.mutation<OtpResponse, OtpInput>({
      query: ({ email }) => ({
        document: GET_OTP_MUTATION,
        variables: {
          input: { email },
        },
      }),
      transformResponse: (response: { getOtp: OtpResponse }) => response.getOtp,
    }),

    verifyOtp: builder.mutation<VerifyOtpDataResponse, VerifyOtpInput>({
      query: ({ otp, email }) => ({
        document: VERIFY_OTP_MUTATION,
        variables: { input: { otp, email } },
      }),
      transformResponse: (response: { verifyOtp: VerifyOtpDataResponse }) => response.verifyOtp,
      invalidatesTags: ["User"],
    }),

    refreshToken: builder.mutation<RefreshTokenResponse, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        document: REFRESH_TOKEN_MUTATION,
        variables: { refreshToken },
      }),
      transformResponse: (response: { refreshToken: RefreshTokenResponse }) => response.refreshToken,
    }),
  }),
});

export const { useCreateUserMutation, useLoginMutation, useVerifyOtpMutation, useRefreshTokenMutation } = authApi;
