import { StyleSheet } from "react-native";
import LoserScreen from "@/components/LooserScreen";

export default function LoserModal() {
    return (
        <LoserScreen />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});