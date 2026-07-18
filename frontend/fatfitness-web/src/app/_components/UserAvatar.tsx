import Image from "next/image";
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
  if (hasAvatar && userId) {
    return (
      // Backend-served avatar stays a plain <img>: the API already serves it with
      // ETag revalidation, and the Next optimizer would proxy-cache it on top.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`${apiBaseUrl}/api/avatars/${userId}`}
        alt={displayName}
        width={size}
        height={size}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <Image
      src="/photos/logo/profile-500.jpg"
      alt={displayName}
      width={size}
      height={size}
      className={`shrink-0 rounded-full object-cover ${className}`}
    />
  );
}
