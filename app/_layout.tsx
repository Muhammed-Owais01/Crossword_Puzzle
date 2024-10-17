import { useLoadAssets } from "@/hooks/useLoadAssets";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import * as MediaLibrary from 'expo-media-library';

export default function RootLayout() {
    const { isLoaded } = useLoadAssets();
    const [granted, setGranted] = useState<boolean | null>(null);

    useEffect(() => {  
        (async () => {
            const perm = await MediaLibrary.requestPermissionsAsync();
            setGranted(perm.granted);
        })();
    }, []);

    if (!isLoaded || granted === false)
        return null;

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ headerShown: false, }}
            />
            <Stack.Screen
                name="crossword"
                options={{ headerShown: false, }}
            />
            <Stack.Screen 
                name="winner"
                options={{
                    presentation: 'modal',
                    headerShown: false
                }}
            />
            <Stack.Screen 
                name="looser"
                options={{
                    presentation: 'modal',
                    headerShown: false
                }}
            />
        </Stack>
    );
}
