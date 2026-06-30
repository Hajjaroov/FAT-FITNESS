export type UserRole = "OWNER" | "ADMIN" | "MODERATOR" | "USER";

export type UserStatus =
  | "PENDING_EMAIL_VERIFICATION"
  | "ACTIVE"
  | "BANNED"
  | "DELETED";

export type CurrentUser = {
  userId: string;
  email: string;
  displayName: string;
  countryRegionCode: string;
  status: UserStatus;
  roles: UserRole[];
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  hasAvatar: boolean;
  emailNotificationsPm: boolean;
};

export type RegisterRequest = {
  displayName: string;
  email: string;
  countryRegionCode: string;
  password: string;
  confirmPassword: string;
  acceptedCommunityRules: boolean;
  acceptedPrivacyPolicy: boolean;
};

export type RegisterResponse = {
  userId: string;
  email: string;
  status: UserStatus;
  message: string;
};

export type VerifyEmailResponse = {
  userId: string;
  email: string;
  status: UserStatus;
  emailVerifiedAt: string | null;
  message: string;
};

export type LoginRequest = {
  email: string;
  password: string;
  clientType: "WEB";
  deviceLabel: string;
};

export type TokenResponse = {
  tokenType: "Bearer";
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string | null;
  refreshTokenExpiresAt: string;
};

export type LoginResponse = TokenResponse & {
  userId: string;
  email: string;
  displayName: string;
  roles: UserRole[];
};

export type LogoutResponse = {
  message: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export type UpdateProfileRequest = {
  displayName: string;
  countryRegionCode: string;
};

export type UpdateProfileResponse = {
  displayName: string;
  countryRegionCode: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordResponse = {
  message: string;
};

export type RevokeAllSessionsResponse = {
  message: string;
};

export type UpdateNotificationPreferencesRequest = {
  emailNotificationsPm: boolean;
};

export type UpdateNotificationPreferencesResponse = {
  emailNotificationsPm: boolean;
};
