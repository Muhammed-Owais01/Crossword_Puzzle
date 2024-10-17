import { useLoadAssets } from "@/hooks/useLoadAssets";
import { Stack } from "expo-router";

export default function RootLayout() {
    const { isLoaded } = useLoadAssets();

    if (!isLoaded)
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
        </Stack>
    );
}
