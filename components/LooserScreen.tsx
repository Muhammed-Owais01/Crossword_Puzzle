import { router } from "expo-router";
import { Dimensions, ImageBackground, Pressable, Text, View, StyleSheet } from "react-native";

const { width, height } = Dimensions.get('screen');

export default function LoserScreen() {
    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/images/loose_screen.png')}
                style={styles.backgroundImage}
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center', 
        marginTop: 220
    },
    text: {
        fontSize: 37,
        color: 'white',
    },
});
