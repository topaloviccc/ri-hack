import { Linking } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CoverImageCredit } from './CoverImageCredit';
import type { CoverImage } from '@/features/courses/types';

const image: CoverImage = {
  url: 'https://upload.wikimedia.org/castle.jpg',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Castle.jpg',
  author: 'Example Photographer', license: 'CC BY-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  caption: 'Trsat Castle in Rijeka', width: 1280, height: 850,
};

it('shows real attribution and opens source/license without triggering the enclosing card', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  const stopPropagation = jest.fn();
  await render(<CoverImageCredit image={image} />);
  expect(screen.getByText('Trsat Castle in Rijeka')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('link', { name: /Photo by Example Photographer/ }), { stopPropagation });
  expect(open).toHaveBeenCalledWith(image.sourceUrl);
  await fireEvent.press(screen.getByRole('link', { name: 'Image license: CC BY-SA 4.0' }), { stopPropagation });
  expect(open).toHaveBeenCalledWith(image.licenseUrl);
  expect(stopPropagation).toHaveBeenCalledTimes(2);
  open.mockRestore();
});

it('does not invent credits when no image has been retrieved', async () => {
  await render(<CoverImageCredit image={null} />);
  expect(screen.queryByRole('link')).toBeNull();
});
