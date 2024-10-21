import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Dimensions, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import Options from './Options';

const { width, height } = Dimensions.get('window')

export default function UserEntry() {
    const [name, setName] = useState<string>('');
    const [contact, setContact] = useState<string>('');
    const [time, setTime] = useState<number>(30);

    const handlePressPlay = () => {
        if (!name.length || !contact.length) {
            Alert.alert(
                'Missing info',
                'Name and/or Contact info not provided. Do you still want to play?',
                [
                    {
                        text: 'No',
                        style: 'cancel'
                    },
                    {
                        text: 'Yes',
                        style: 'destructive',
                        onPress: () => router.navigate(`/crossword?time=${time}`)
                    }
                ]
            );
            return;
        }

        writeCsv()
        .then(() => {
            router.navigate(`/crossword?time=${time}&name=${name}&contact=${contact}`);
            setName('');
            setContact('');
        })
        .catch(console.log);
    };

    const writeCsv = async () => {
        const directoryUri = FileSystem.documentDirectory;
        const fileUri = directoryUri + `players_data.csv`;

        let content: string = '';
        try {
            // if file exists
            content = await FileSystem.readAsStringAsync(fileUri);
        } catch (error: any) {
            // if file doesn't exist
            content = `name,contact,time,date,win\n`;
        } finally {
            content += `${name.replace(',', ' ')},${contact.replace(',', ' ')},${time},${new Date().toISOString()},0\n`;
            console.log(content);
            await FileSystem.writeAsStringAsync(fileUri, content);
        }
    }

    return (
        <View style={styles.container}>
            <Options time={time} setTime={setTime} />
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/images/PSO_LOGO-01.png')}
                    style={[styles.image, styles.psoLogo]}
                    resizeMode="contain"
                />
                <Image
                    source={require('../assets/images/MOTOR_OIL.png')}
                    style={[styles.image, styles.motorOilLogo]}
                    resizeMode="contain"
                />
                <Image
                    source={require('../assets/images/word_search.png')}
                    style={[styles.image, styles.wordSearchLogo]}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    placeholder="Name:"
                    placeholderTextColor="black"
                />
                <TextInput
                    value={contact}
                    onChangeText={setContact}
                    style={styles.input}
                    keyboardType='numeric'
                    placeholder="Contact:"
                    placeholderTextColor="black"
                />
                <Pressable onPress={handlePressPlay}>
                    <Text style={styles.button}>PLAY</Text>
                </Pressable>
            </View>
            <Text
                style={styles.promo}
            >
                Powered by www.getsmartapps.com
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    promo: {
        color: 'gray',
        fontSize: height * 0.013,
        position: 'absolute',
        bottom: height * 0.005,
        alignSelf: 'center',
    },
    logoContainer: {
        flex: 7/4,
        alignItems: 'center',
        justifyContent: 'flex-end',
        // backgroundColor: 'gray',
    },
    image: {
    },
    psoLogo: {
        height: height * 0.12,
        width: width * 0.2
    },
    motorOilLogo: {
        marginTop: height * 0.02,
        height: height * 0.1,
        width: width * 0.6
    },
    wordSearchLogo: {
        width: width * 0.7,
        height: height * 0.2
    },
    inputContainer: {
        flex: 1,
        // backgroundColor: 'darkgray',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    input: {
        fontSize: height * 0.03,
        fontWeight: '700',
        width: width * 0.8,
        height: height * 0.06,
        paddingHorizontal: width * 0.025,
        borderRadius: height/width * 12,
        backgroundColor: 'white',
        color: 'black',
    },
    button: {
        padding: height * 0.01,
        fontSize: height * 0.04,
        color: 'white',
        alignSelf: 'center',
        letterSpacing: width * 0.01,
    },
});
