import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

export function useLoadAssets() {
    const [fontSuccess, fontError] = useFonts({
        'Picaflor-Bold': require('../assets/fonts/Picaflor-Bold.otf'),
      });

    useEffect(() => {
        if (fontError) throw fontError;
    }, [fontError]);

    useEffect(() => {
        if (fontSuccess) SplashScreen.hideAsync();
    }, [fontSuccess]);

    return { isLoaded: fontSuccess };
}