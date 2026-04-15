import React from "react";
import { User as UserIcon } from "lucide-react";
import { IMAGE_BASE_URL } from "@/configs/env";

/**
 * UserAvatar Component
 * @param {Object} user - The user object containing name and profile_picture_url
 * @param {string} size - Size variant: 'sm', 'md', 'lg', 'xl'
 * @param {string} className - Additional CSS classes
 */
const UserAvatar = ({ user, size = "md", className = "" }) => {
  const name = user?.name || user?.email || "User";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-xl",
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  // If we have a profile picture URL, show the image
  if (user?.profile_picture_url) {
    const fullUrl = user.profile_picture_url.startsWith("http")
      ? user.profile_picture_url
      : `${IMAGE_BASE_URL}${user.profile_picture_url}`;

    return (
      <div
        className={`${currentSizeClass} rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 ${className}`}
      >
        <img
          src={fullUrl}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback if image fails to load
            e.target.onerror = null;
            e.target.style.display = "none";
            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-red-100 text-red-600 font-bold">${initials}</div>`;
          }}
        />
      </div>
    );
  }

  // Fallback to initials or generic user icon
  return (
    <div
      className={`${currentSizeClass} rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold flex-shrink-0 border border-red-200 ${className}`}
    >
      {initials || <UserIcon size={size === "sm" ? 14 : 18} />}
    </div>
  );
};

export default UserAvatar;
