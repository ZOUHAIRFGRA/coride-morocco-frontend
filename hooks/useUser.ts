// Legacy useUser hook - now just re-exports from useUserProfile for backward compatibility
// This maintains compatibility with existing components that import useUser from hooks

export { useUserProfile as useUser } from './useUserProfile';