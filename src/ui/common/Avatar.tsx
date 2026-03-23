import { cva, type VariantProps } from 'class-variance-authority';
import DefaultAvatar from '../icons/DefaultAvatar';
import { cn } from '../utils/cn';

const avatarVariants = cva('rounded-full flex items-center justify-center text-white overflow-hidden', {
  variants: {
    gender: {
      male: 'bg-linear-to-br from-sky-400 to-sky-500',
      female: 'bg-linear-to-br from-rose-400 to-rose-500',
      other: 'bg-linear-to-br from-stone-400 to-stone-500',
    },
  },
  defaultVariants: { gender: 'other' },
});

type AvatarVariants = VariantProps<typeof avatarVariants>;

interface AvatarProps extends AvatarVariants {
  avatarUrl?: string | null;
  fullName?: string;
  className?: string;
}

export default function Avatar({ gender, avatarUrl, fullName, className }: AvatarProps) {
  return (
    <div className={cn(avatarVariants({ gender }), className)}>
      {avatarUrl ? <img src={avatarUrl} alt={fullName ?? ''} className="h-full w-full object-cover" /> : <DefaultAvatar gender={gender ?? undefined} />}
    </div>
  );
}

export { avatarVariants };
