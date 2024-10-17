import { Audio } from "expo-av";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, ImageBackground, Pressable, Text, View, StyleSheet } from "react-native";

const { width, height } = Dimensions.get('screen');

export default function WinnerScreen() {
    const [sound, setSound] = useState<Audio.Sound>();

    useEffect(() => {
        // Function to load and play the sound
        async function playSound() {
            console.log('Loading Sound');
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/audio/confetti_sound.mp3')
            );
            setSound(sound);

            console.log('Playing Sound');
            await sound.playAsync();
        }

        playSound(); // Play sound on component mount

        return () => {
            // Unload sound when component unmounts to avoid memory leaks
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/images/winner_screen.png')}
                style={styles.backgroundImage}
                resizeMode='contain'
            >
                <View style={styles.centeredView}>
                    <Pressable onPress={() => router.navigate('/')}>
                        <Text style={styles.text}>Home</Text>
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
        position: 'absolute',
        bottom: '20%',
        left: '44%'
    },
    text: {
        fontSize: 37,
        color: 'white',
    },
});
