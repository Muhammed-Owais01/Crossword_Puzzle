import { Audio } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, ImageBackground, Pressable, Text, View, StyleSheet, Alert } from "react-native";
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('screen');

export default function WinnerScreen() {
    const { name, contact }: { name?: string, contact?: string } = useLocalSearchParams();
    const [sound, setSound] = useState<Audio.Sound>();

    useEffect(() => {

        // Function to load and play the sound
        async function playSound() {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/audio/confetti_sound.mp3')
            );
            setSound(sound);
            await sound.playAsync();
        }

        playSound(); // Play sound on component mount

        if (name && contact)
            updateWinner();

        return () => {
            // Unload sound when component unmounts to avoid memory leaks and stop the sound
            if (sound) {
                sound.stopAsync();
                sound.unloadAsync();
            }
        };
    }, []);

    const updateWinner = async () => {
        try {
            const filePath = `${FileSystem.documentDirectory}players_data.csv`;
            const content = await FileSystem.readAsStringAsync(filePath);

            const csvRecords = content.trim().split('\n');
            const header = csvRecords[0];
            const dataRows = csvRecords.slice(1).reverse();

            const fields = dataRows[0].split(',');
            fields[4] = '1';
            dataRows[0] = fields.join(',');

            const newContent = [header, ...dataRows.reverse()].join('\n') + '\n';
            console.log(newContent);
            await FileSystem.writeAsStringAsync(filePath, newContent);

            console.log('success');
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/images/winner_screen.png')}
                style={styles.backgroundImage}
                resizeMode='contain'
            >
                <View style={styles.centeredView}>
                    <Pressable onPress={() => router.navigate('/')}>
                        <Text style={styles.button}>HOME</Text>
                    </Pressable>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    backgroundImage: {
        width: width,
        height: height,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '80%',
    },
    text: {
        fontSize: 37,
        color: 'white',
    },
    button: {
        padding: 10,
        fontSize: 40,
        color: 'white',
        letterSpacing: 5,
    },
});
