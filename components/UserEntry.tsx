import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import Options from './Options';

const { width, height } = Dimensions.get('screen')

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
                <View
                    style={[
                        {
                            width: '100%',
                            height: '60%'
                        },
                        styles.imageContainer
                    ]}
                >
                    <Image
                        source={require('../assets/images/PSO_LOGO-01.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>
                <View
                    style={[
                        {
                            width: '100%',
                            height: '40%'
                        },
                        styles.imageContainer
                    ]}
                >
                    <Image
                        source={require('../assets/images/MOTOR_OIL.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>
                <View 
                    style={[
                        {
                            width: '100%',
                            height: '70%',
                        },
                        styles.imageContainer
                    ]}
                >
                    <Image
                        source={require('../assets/images/word_search.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>
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
                <View style={styles.inputContainer}>
                    <Pressable onPress={handlePressPlay}>
                        <Text style={styles.button}>PLAY</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    logoContainer: {
        width: '100%',
        height: '20%',
    },
    imageContainer: {
        marginTop: 30
    },
    image: {
        width: '100%',
        height: '100%',
    },
    inputContainer: {
        width: '100%',
        alignItems: 'center',
    },
    input: {
        fontSize: 35,
        fontWeight: '700',
        width: width * 0.8,
        height: height * 0.06,
        margin: '3%',
        paddingHorizontal: '2%',
        borderRadius: 15,
        backgroundColor: 'white',
        color: 'black',
    },
    button: {
        padding: 10,
        fontSize: 40,
        color: 'white',
        alignSelf: 'center',
        letterSpacing: 5,
    },
});
