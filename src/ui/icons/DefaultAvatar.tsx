import { Gender } from '../../members/types';

export const AVATAR_VERSION = 'v2';

interface DefaultAvatarProps {
  gender?: string;
  size?: number;
}

export default function DefaultAvatar({ gender, size = 64 }: DefaultAvatarProps) {
  if (gender === Gender.enum.male) {
    return <img src={`/avatar/${AVATAR_VERSION}/male.svg`} alt="Male avatar" className="h-full w-full object-cover" width={size} height={size} />;
  }

  return (
    <img
      src={`/avatar/${AVATAR_VERSION}/female.svg`}
      alt={gender === Gender.enum.female ? 'Female avatar' : 'Default avatar'}
      className="h-full w-full object-cover"
      width={size}
      height={size}
    />
  );
}
