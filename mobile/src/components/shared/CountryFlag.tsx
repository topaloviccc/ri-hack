import { Image } from '@/components/ui/Image';

export type CountryFlagProps = {
  code: string;
  name?: string;
  uri?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = { sm: 'h-4 w-6', md: 'h-6 w-8', lg: 'h-16 w-24' };

/** Country API supplies the URL; code-only records use the same hosted flag convention. */
export function CountryFlag({ code, name, uri, size = 'sm' }: CountryFlagProps) {
  if (!/^[A-Za-z]{2}$/.test(code)) return null;
  const imageUri = uri || `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
  return (
    <Image
      uri={imageUri}
      className={sizes[size]}
      contentFit="contain"
      accessibilityLabel={`${name ?? code.toUpperCase()} flag`}
    />
  );
}
