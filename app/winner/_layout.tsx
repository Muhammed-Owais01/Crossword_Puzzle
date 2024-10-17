import { Stack } from "expo-router";

export default function Winner() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ headerShown: false, }}
            />
        </Stack>
    );
}
