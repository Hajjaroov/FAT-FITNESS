import { apiBaseUrl } from "@/lib/config";

type UserAvatarProps = {
  displayName: string;
  userId?: string;
  hasAvatar?: boolean;
  size?: number;
  className?: string;
};

export function UserAvatar({
  displayName,
  userId,
  hasAvatar,
  size = 32,
  className = "",
}: UserAvatarProps) {
  const src =
    hasAvatar && userId
      ? `${apiBaseUrl}/api/avatars/${userId}`
      : "/photos/logo/profile-500.jpg";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={displayName}
      width={size}
      height={size}
      className={`shrink-0 rounded-full object-cover ${className}`}
    />
  );
}
