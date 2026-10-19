'use client';

import { useState } from 'react';

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md';
}

export function UserAvatar({ name, src, size = 'md' }: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';

  if (!src || imageFailed) {
    return (
      <div className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full border border-[#99F6E4] bg-[#E6F4F1] font-semibold text-[#0F766E]`} aria-label={name}>
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setImageFailed(true)}
      className={`${sizeClass} shrink-0 rounded-full border border-[#CBD5E1] object-cover`}
    />
  );
}
