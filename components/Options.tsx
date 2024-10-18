import { AntDesign, Entypo, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, View, Modal, Pressable, Text, TextInput, Alert } from "react-native";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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
    }

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
    }

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
                Alert.alert('Error', 'An occurred when cleaning data');
                console.log(error);
            }
        }

        Alert.alert('Wiping all data', 'Are you sure you want to remove all player data?', [
            {
                text: 'Yes',
                style: 'destructive',
                onPress: cleanData
            },
            {
                text: 'Cancel',
                style: 'default',
            }
        ])
    }

    return (
        <>
            <Modal
                visible={visible}
                onDismiss={handleClose}
                transparent={true}
            >
                <View style={styles.container}>
                    <Pressable onPress={handleClose} style={styles.closeButton}>
                        <AntDesign name="closecircleo" size={40} color="red" />
                    </Pressable>

                    {error && <Text style={{ fontSize: 20, color: 'red' }}>Incorrect passcode</Text>}

                    {isAuthenticated ?
                        <View style={styles.optionsContainer}>
                            <View style={styles.timeOptions}>
                                <Text style={{ color: 'white', fontSize: 24, fontFamily: 'Poppins-Medium', width: 120, }}>Time: {time}s</Text>
                                <Pressable
                                    onPress={() => setTime(15)}
                                    style={[styles.timeOption, time === 15 ? null : styles.notSelected]}
                                >
                                    <Text style={styles.timeOptionText}>15s</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setTime(30)}
                                    style={[styles.timeOption, time === 30 ? null : styles.notSelected]}
                                >
                                    <Text style={styles.timeOptionText}>30s</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setTime(60)}
                                    style={[styles.timeOption, time === 60 ? null : styles.notSelected]}
                                >
                                    <Text style={styles.timeOptionText}>60s</Text>
                                </Pressable>
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
                        :
                        <>
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <TextInput
                                    value={input}
                                    onChangeText={setInput}
                                    onBlur={() => {
                                        if (input !== 'wysi727') setError(true);
                                        else setError(false);
                                    }}
                                    style={styles.input}
                                    placeholder="Passcode:"
                                    placeholderTextColor="black"
                                />

                                <Pressable
                                    onPress={handleAuthentication}
                                >
                                    <View style={{ elevation: 5, borderRadius: 30, backgroundColor: 'white' }}>
                                        <MaterialIcons name="done" size={50} color="black" />
                                    </View>
                                </Pressable>
                            </View>
                        </>
                    }
                </View>
            </Modal>
            <Pressable style={styles.icon} onPress={() => setVisible(true)}>
                <View style={{ padding: 10 }}>
                    <Entypo name="dots-three-vertical" size={24} color="white" />
                </View>
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        borderColor: 'white',
        borderWidth: 2,
        width: '95%',
        backgroundColor: 'black',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        marginBottom: 10,
    },
    inputContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    input: {
        elevation: 5,
        fontSize: 18,
        width: '90%',
        marginRight: 10,
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 15,
        backgroundColor: 'white',
        color: 'black',
    },
    iconWrapper: {
        elevation: 5,
        borderRadius: 30,
        backgroundColor: 'white',
        padding: 5,
    },
    optionText: {
        fontSize: 18,
        marginBottom: 10,
    },
    timeOptions: {
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    timeOption: {
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 20,
        margin: 5,
        borderRadius: 10,
        elevation: 3,
    },
    timeOptionText: {
        fontSize: 22,
        color: 'black',
        fontWeight: '600',
        textAlign: 'center',
    },
    exportButton: {
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        elevation: 3,
        marginTop: 15,
        alignSelf: 'center',
    },
    exportButtonText: {
        fontSize: 22,
        color: 'black',
        fontWeight: '600',
        textAlign: 'center',
    },
    closeButton: {
        alignSelf: 'flex-end',
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 30,
        marginBottom: 10,
        marginRight: 10,
        elevation: 5,
    },
    closeButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
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
        top: 15,
        left: '2%',
    },
});
