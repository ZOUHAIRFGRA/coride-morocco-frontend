// Trajectory Tribes Type Definitions
// Phase 5: Community Features

// ==================== Core Models ====================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type TribeRole = 'member' | 'moderator' | 'admin';
export type MessageType = 'text' | 'image' | 'file' | 'announcement' | 'system';
export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface Tribe {
  id: number;
  name: string;
  description: string | null;
  route_start_name: string;
  route_end_name: string;
  route_start_coordinates: Coordinates;
  route_end_coordinates: Coordinates;
  is_public: boolean;
  max_members: number;
  requires_approval: boolean;
  member_count: number;
  message_count: number;
  user_role: TribeRole | null;
  user_is_member: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface TribeMember {
  user_id: number;
  first_name: string;
  last_name: string;
  profile_photo_url: string | null;
  role: TribeRole;
  joined_at: string;
  message_count: number;
  last_active_at: string | null;
  is_online?: boolean;
}

export interface TribeMessage {
  id: number;
  tribe_id: number;
  user_id: number;
  user_first_name: string;
  user_last_name: string;
  user_profile_photo: string | null;
  message_type: MessageType;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  is_announcement: boolean;
  is_pinned: boolean;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
}

export interface TribeJoinRequest {
  id: number;
  tribe_id: number;
  user_id: number;
  message: string | null;
  status: JoinRequestStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface TribeAnnouncement {
  id: number;
  tribe_id: number;
  user_id: number;
  title: string;
  content: string;
  is_pinned: boolean;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

// ==================== Request DTOs ====================

export interface CreateTribeRequest {
  name: string;
  description?: string;
  route_start_name: string;
  route_end_name: string;
  route_start_latitude: number;
  route_start_longitude: number;
  route_end_latitude: number;
  route_end_longitude: number;
  is_public?: boolean;
  max_members?: number;
  requires_approval?: boolean;
}

export interface UpdateTribeRequest {
  name?: string;
  description?: string;
  is_public?: boolean;
  max_members?: number;
  requires_approval?: boolean;
}

export interface JoinTribeRequest {
  message?: string;
}

export interface SendMessageRequest {
  content: string;
  message_type?: MessageType;
  is_announcement?: boolean;
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

export interface UpdateMemberRoleRequest {
  role: TribeRole;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  is_pinned?: boolean;
  expires_at?: string;
}

// ==================== Search & Filters ====================

export interface TribeSearchParams {
  query?: string;
  near_latitude?: number;
  near_longitude?: number;
  max_distance_km?: number;
  only_public?: boolean;
  has_space?: boolean;
  page?: number;
  page_size?: number;
}

export interface MessageQueryParams {
  page?: number;
  page_size?: number;
  before_id?: number;
}

export interface MemberQueryParams {
  page?: number;
  page_size?: number;
}

// ==================== Response DTOs ====================

export interface TribeListResponse {
  tribes: Tribe[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TribeMemberListResponse {
  members: TribeMember[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  online_count: number;
}

export interface TribeMessageListResponse {
  messages: TribeMessage[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface JoinTribeResponse {
  status: 'joined' | 'pending';
  message: string;
}

export interface TribeStatistics {
  total_members: number;
  active_members_24h: number;
  total_messages: number;
  messages_today: number;
  most_active_member: TribeMember | null;
}

// ==================== WebSocket Message Types ====================

export type WebSocketMessageType =
  | 'connection_established'
  | 'new_message'
  | 'member_joined'
  | 'member_left'
  | 'member_role_changed'
  | 'announcement'
  | 'typing_indicator'
  | 'message_deleted'
  | 'message_edited'
  | 'error';

export interface BaseWebSocketMessage {
  type: WebSocketMessageType;
  tribe_id: number;
  timestamp: number;
}

export interface ConnectionEstablishedMessage extends BaseWebSocketMessage {
  type: 'connection_established';
  message: string;
  user_id: number;
}

export interface NewMessageWebSocketMessage extends BaseWebSocketMessage {
  type: 'new_message';
  message: TribeMessage;
}

export interface MemberJoinedMessage extends BaseWebSocketMessage {
  type: 'member_joined';
  member: TribeMember;
}

export interface MemberLeftMessage extends BaseWebSocketMessage {
  type: 'member_left';
  user_id: number;
  user_name: string;
}

export interface MemberRoleChangedMessage extends BaseWebSocketMessage {
  type: 'member_role_changed';
  user_id: number;
  new_role: TribeRole;
  changed_by: number;
}

export interface AnnouncementMessage extends BaseWebSocketMessage {
  type: 'announcement';
  announcement: TribeAnnouncement;
}

export interface TypingIndicatorMessage extends BaseWebSocketMessage {
  type: 'typing_indicator';
  user_id: number;
  user_name: string;
  is_typing: boolean;
}

export interface MessageDeletedMessage extends BaseWebSocketMessage {
  type: 'message_deleted';
  message_id: number;
  deleted_by: number;
}

export interface MessageEditedMessage extends BaseWebSocketMessage {
  type: 'message_edited';
  message: TribeMessage;
}

export interface ErrorMessage extends BaseWebSocketMessage {
  type: 'error';
  error: string;
  error_code?: string;
}

export type TribeWebSocketMessage =
  | ConnectionEstablishedMessage
  | NewMessageWebSocketMessage
  | MemberJoinedMessage
  | MemberLeftMessage
  | MemberRoleChangedMessage
  | AnnouncementMessage
  | TypingIndicatorMessage
  | MessageDeletedMessage
  | MessageEditedMessage
  | ErrorMessage;

// ==================== Outgoing WebSocket Messages ====================

export interface TypingMessage {
  type: 'typing';
  is_typing: boolean;
}

export type OutgoingWebSocketMessage = TypingMessage;

// ==================== UI State Types ====================

export interface TribeUIState {
  selectedTribe: Tribe | null;
  messages: TribeMessage[];
  members: TribeMember[];
  typingUsers: Set<number>;
  isLoadingMessages: boolean;
  isLoadingMembers: boolean;
  hasMoreMessages: boolean;
  error: string | null;
}

export interface TribeFilters {
  searchQuery: string;
  onlyPublic: boolean;
  hasSpace: boolean;
  maxDistance: number;
  nearLocation: Coordinates | null;
}
