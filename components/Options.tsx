import { AntDesign, Entypo, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, View, Modal, Pressable, Text, TextInput, Alert, Dimensions, Keyboard, TouchableWithoutFeedback } from "react-native";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const { width, height } = Dimensions.get('window');

type OptionsProps = {
    time: number,
    setTime: (time: number) => void
}

export default function Options({ time, setTime }: OptionsProps) {
    const [visible, setVisible] = useState<boolean>(false);
    const [input, setInput] = useState<string>('');
    const [error, setError] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const handleAuthentication = () => {
        if (input === 'wysi727') {
            setError(false);
            setIsAuthenticated(true);
        } else {
            setError(true);
        }
    };

    const handleClose = () => {
        setError(false);
        setIsAuthenticated(false);
        setInput('');
        setVisible(false);
    };

    const handleExport = async () => {
        try {
            const fileUri = `${FileSystem.documentDirectory}players_data.csv`;
            const data_info = await FileSystem.getInfoAsync(fileUri);
            if (!data_info.exists) {
                Alert.alert('Error', 'No file to export');
                return;
            }

            const perms = await Sharing.isAvailableAsync();
            if (!perms) {
                Alert.alert('Warning', 'Sharing is not allowed.');
                return;
            }

            await Sharing.shareAsync(fileUri);
        } catch (error) {
            console.error('Error moving file:', error);
            Alert.alert('Error', 'An error occurred while saving the file.');
        }
    };

    const handleCleanData = () => {
        const cleanData = async () => {
            try {
                const fileUri = `${FileSystem.documentDirectory}players_data.csv`;
                const data_info = await FileSystem.getInfoAsync(fileUri);
                if (!data_info.exists) {
                    Alert.alert('Warning', 'Data already wiped.');
                    return;
                }
                await FileSystem.deleteAsync(fileUri);
            } catch (error: any) {
                Alert.alert('Error', 'An error occurred when cleaning data');
                console.log(error);
            }
        };

        Alert.alert('Wiping all data', 'Are you sure you want to remove all player data?', [
            { text: 'Yes', style: 'destructive', onPress: cleanData },
            { text: 'Cancel', style: 'default' }
        ]);
    };

    return (
        <>
            <Modal visible={visible} transparent onRequestClose={handleClose}>
                <TouchableWithoutFeedback onPress={handleClose} accessible={false}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View>
                                <View style={styles.container}>
                                    <Pressable onPress={handleClose} style={styles.closeButton}>
                                        <View style={styles.closeButtonText} />
                                    </Pressable>

                                    {error && <Text style={styles.errorText}>Incorrect passcode</Text>}

                                    {isAuthenticated ? (
                                        <View style={styles.optionsContainer}>
                                            <View style={styles.timeOptions}>
                                                <Text style={{ color: 'white', fontSize: height * 0.024, fontFamily: 'Poppins-Medium', width: width * 0.2 }}>
                                                    Time: {time}s
                                                </Text>
                                                {([15, 30, 60] as const).map((t) => (
                                                    <Pressable
                                                        key={t}
                                                        onPress={() => setTime(t)}
                                                        style={[styles.timeOption, time === t ? null : styles.notSelected]}
                                                    >
                                                        <Text style={styles.timeOptionText}>{t}s</Text>
                                                    </Pressable>
                                                ))}
                                            </View>

                                            <View style={{ flexDirection: 'column' }}>
                                                <Pressable onPress={handleExport} style={styles.exportButton}>
                                                    <Text style={styles.exportButtonText}>Export</Text>
                                                </Pressable>
                                                <Pressable onPress={handleCleanData} style={styles.exportButton}>
                                                    <Text style={styles.exportButtonText}>Wipe data</Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                value={input}
                                                onChangeText={setInput}
                                                onBlur={() => setError(input !== 'wysi727')}
                                                style={styles.input}
                                                placeholder="Passcode:"
                                                placeholderTextColor="black"
                                            />
                                            <Pressable onPress={handleAuthentication}>
                                                <View style={{ borderRadius: width, backgroundColor: 'white' }}>
                                                    <MaterialIcons name="done" size={height * 0.05} color="black" />
                                                </View>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.info}>Press anywhere else to close</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <Pressable style={styles.icon} onPress={() => setVisible(true)}>
                <FontAwesome name="cog" size={height * 0.03} color="white" />
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        alignSelf: 'center',
        borderColor: 'white',
        borderWidth: height * 0.0016,
        width: width * 0.95,
        backgroundColor: 'black',
        borderRadius: height / width * 12,
        paddingVertical: height * 0.02,
        paddingHorizontal: width * 0.01,
        alignItems: 'center',
    },
    inputContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: height * 0.018,
        color: 'red',
        marginBottom: height * 0.01,
    },
    input: {
        elevation: 5,
        fontSize: height * 0.018,
        width: width * 0.8,
        marginRight: width * 0.01,
        paddingHorizontal: width * 0.02,
        paddingVertical: height * 0.01,
        borderRadius: height / width * 10,
        backgroundColor: 'white',
        color: 'black',
    },
    timeOptions: {
        justifyContent: 'space-around',
    },
    timeOption: {
        backgroundColor: 'white',
        paddingVertical: '10%',
        margin: '5%',
        borderRadius: height / width * 5,
    },
    timeOptionText: {
        fontSize: height * 0.02,
        color: 'black',
        fontWeight: '600',
        textAlign: 'center',
    },
    exportButton: {
        backgroundColor: 'white',
        paddingVertical: '10%',
        paddingHorizontal: '8%',
        borderRadius: height / width * 5,
        marginVertical: '5%',
        alignSelf: 'center',
    },
    exportButtonText: {
        fontSize: height * 0.022,
        color: 'black',
        fontWeight: '600',
        textAlign: 'center',
    },
    closeButton: {
        alignSelf: 'flex-end',
        elevation: 5,
    },
    closeButtonText: {
        backgroundColor: 'red',
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 10,
        width: '50%',
    },
    notSelected: {
        elevation: 5,
    },
    icon: {
        position: 'absolute',
        bottom: height * 0.01,
        left: width * 0.01,
        zIndex: 999,
    },
    info: {
        alignSelf: 'center',
        fontSize: height * 0.015,
        color: 'white'
    }
});
