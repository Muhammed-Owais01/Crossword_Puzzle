import { Dimensions, Image, View } from "react-native";

const { width, height } = Dimensions.get('screen')

export default function WinnerScreen() {
    return (
        <View>
            <Image
                source={require('../assets/images/winner_screen.png')}
                style={{ width: width, height: height }}
            />
        </View>
    )
}