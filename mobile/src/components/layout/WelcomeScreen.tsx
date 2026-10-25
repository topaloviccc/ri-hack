import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useThemeColors } from '@/lib/theme';

const GLOBE_GRADIENT = ['#4386c5', '#f39a57'] as const;
const EARTH_ICON_SIZE = 72;
const EARTH_GRADIENT_STOPS = [
  '#4386c5',
  '#4f87bf',
  '#5b87b9',
  '#6788b4',
  '#7388ae',
  '#7f89a8',
  '#8b89a2',
  '#978a9d',
  '#a38a97',
  '#af8b91',
  '#bb8c8b',
  '#c78d82',
  '#d38e7a',
  '#df9071',
  '#eb9664',
  '#f39a57',
] as const;
const EARTH_SLICE_WIDTH = EARTH_ICON_SIZE / EARTH_GRADIENT_STOPS.length;

type WelcomeScreenProps = {
  onContinue: () => void;
};

function GradientEarthOutline() {
  return (
    <View
      accessibilityLabel="Out There globe logo"
      style={{ width: EARTH_ICON_SIZE, height: EARTH_ICON_SIZE }}
    >
      {EARTH_GRADIENT_STOPS.map((color, index) => {
        const left = index * EARTH_SLICE_WIDTH;
        return (
          <View
            key={color}
            style={{
              position: 'absolute',
              left,
              top: 0,
              width: EARTH_SLICE_WIDTH,
              height: EARTH_ICON_SIZE,
              overflow: 'hidden',
            }}
          >
            <Ionicons
              accessible={false}
              name="earth-outline"
              size={EARTH_ICON_SIZE}
              color={color}
              style={{
                position: 'absolute',
                left: -left,
                top: 0,
                width: EARTH_ICON_SIZE,
                height: EARTH_ICON_SIZE,
                textAlign: 'center',
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [opacity] = useState(() => new Animated.Value(1));
  const [translateY] = useState(() => new Animated.Value(0));
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleContinue = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -8, duration: 220, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onContinue();
    });
  };

  return (
    <Animated.View
      accessibilityLabel="Welcome to Out There"
      className="absolute inset-0 z-50 bg-background"
      style={[
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <View className="flex-1 items-center justify-center px-8">
        <View
          accessibilityLabel="Out There globe logo"
          className="mb-9 h-28 w-28 items-center justify-center"
        >
          <LinearGradient
            colors={GLOBE_GRADIENT}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              width: 104,
              height: 104,
              borderRadius: 52,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              className="h-[98px] w-[98px] items-center justify-center rounded-full"
              style={{ backgroundColor: colors.background }}
            >
              <GradientEarthOutline />
            </View>
          </LinearGradient>
        </View>

        <Text variant="title" className="text-center text-5xl tracking-tight">
          Out There
        </Text>
        <View className="my-5 h-1 w-12 rounded-full bg-secondary" />
        <Text
          variant="body"
          className="w-full text-center text-lg leading-8 text-muted"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.78}
        >
          Not just you, the knowledge too
        </Text>

        <Button
          label="Start learning"
          icon={<Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />}
          onPress={handleContinue}
          className="mt-12 min-h-14 self-center px-7"
        />
      </View>
    </Animated.View>
  );
}
