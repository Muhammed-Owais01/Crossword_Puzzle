import { Stack } from "expo-router";

export default function CrossWordLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ headerShown: false, }}
            />
        </Stack>
    );
}
