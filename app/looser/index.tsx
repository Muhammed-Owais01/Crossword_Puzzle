import { StyleSheet } from "react-native";
import WinnerScreen from "@/components/WinnerScreen";

export default function WinnerModal() {
    return (
        <WinnerScreen />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});