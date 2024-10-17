import CrossWord from '@/components/CrossWord';
import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native'

export default function CrossWordIndex() {
    return (
        <CrossWord />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
