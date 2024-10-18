import { router, useLocalSearchParams, useNavigation, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View, Dimensions } from "react-native";

const { width } = Dimensions.get('screen');

interface C_Data {
    letter: string;
    pressed: boolean;
    highlighted: boolean;
    correct: boolean;
}

interface Pos {
    row: number;
    col: number;
}

interface Bottom_Data {
    word: string,
    pressed: boolean
}

export default function CrossWord() {
    const navigation = useNavigation();
    const { time, name, contact }: { time?: number, name?: string, contact?: string } = useLocalSearchParams();
    const initialCrosswordData: C_Data[][] = Array(10).fill(null).map(() =>
        Array(10).fill(null).map(() => ({
            letter: '',
            pressed: false,
            highlighted: false,
            correct: false,
        }))
    );
    const crossWordDataRef = useRef<C_Data[][]>(initialCrosswordData);
    const bottomWordsRef = useRef<Bottom_Data[]>([]);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const [render, setRender] = useState<boolean>(false);
    const [selectedCells, setSelectedCells] = useState<Pos[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<number>(0);
    const [direction, setDirection] = useState<boolean | null>(null);
    const [gameStarted, setGameStarted] = useState<boolean>(false); // Tracks game state
    const resetTime = 1000;
    const gameDuration = time ? time * 1000 : 30000;
    const [remainingTime, setRemainingTime] = useState<number>(gameDuration / 1000);

    // Sort words by length, descending
    const sortedAnswers = [
        "DEO", "CARIENT", "BIKE", "CAR", "TYRE", "BLAZE", "MILEAGE", "FUEL", "JOURNEY", "OIL"
    ].sort((a, b) => b.length - a.length);

    const startGame = () => {
        setGameStarted(true);

        const countdownInterval = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval); // Stop at 0
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const resetGridPresses = (rowIndex: number, colIndex: number) => {
        crossWordDataRef.current = crossWordDataRef.current.map(row => row.map((cell) => ({ ...cell, pressed: false, highlighted: false })));
        setDirection(null);
        confirmAnswers([...selectedCells, { row: rowIndex, col: colIndex }]);
        setSelectedCells([]);
    }

    const handleCellPress = (rowIndex: number, colIndex: number) => {
        const clearAndReset = () => {
            if (timer) clearTimeout(timer);
            resetGridPresses(rowIndex, colIndex);
        }
        let current_direction: boolean | null = direction;
        // check if lastSelected exists
        const length = selectedCells.length;
        if (length > 0) {
            const lastCell = selectedCells[length - 1];

            // if pressing the same cell, do nothing
            if (lastCell.row === rowIndex && lastCell.col === colIndex)
                return;

            // if two cells have been selected, determine the direction (horizontal or vertical)
            if (length === 1) {
                if (lastCell.row === rowIndex) {
                    setDirection(false);
                    current_direction = false;
                } else if (lastCell.col === colIndex) {
                    setDirection(true);
                    current_direction = true;
                } else
                    clearAndReset();
            } else {
                // if direction is already set, validate future selections
                if ((current_direction === false && lastCell.row !== rowIndex) ||
                    (current_direction === true && lastCell.col !== colIndex)
                ) {
                    clearAndReset();
                    current_direction = null;
                }
            }
        }

        // make current cell as pressed
        crossWordDataRef.current[rowIndex][colIndex].pressed = true;

        // for all cells
        for (let i = 0; i < crossWordDataRef.current.length; ++i) {
            for (let j = 0; j < crossWordDataRef.current[0].length; ++j) {
                // in case current direction is null, have both current column and row be highlighted
                // otherwise if it's false, have only the row highlighted
                // else if it's true, have only the column highlighted
                crossWordDataRef.current[i][j].highlighted =
                    (current_direction == null && (i == rowIndex || j == colIndex)) ||
                    (current_direction == false && i == rowIndex) ||
                    (current_direction == true && j == colIndex);
            }
        }
        setSelectedCells(prev => [...prev, { row: rowIndex, col: colIndex }]);

        // clear previous timer
        if (timer) { clearTimeout(timer); }

        // create new timer
        setTimer(setTimeout(() => resetGridPresses(rowIndex, colIndex), resetTime));
    };

    // Helper function to check if the word can fit without breaking other words on the grid
    const canPlaceWord = (grid: C_Data[][], word: string, row: number, col: number, isHorizontal: boolean) => {
        if (isHorizontal) {
            if (col + word.length > grid[0].length) return false; // Ensure word fits horizontally
            for (let i = 0; i < word.length; i++) {
                if (grid[row][col + i].letter && grid[row][col + i].letter !== word[i]) return false; // Check for conflicts
            }
        } else {
            if (row + word.length > grid.length) return false; // Ensure word fits vertically
            for (let i = 0; i < word.length; i++) {
                if (grid[row + i][col].letter && grid[row + i][col].letter !== word[i]) return false; // Check for conflicts
            }
        }
        return true;
    };

    // Place the word on the grid
    const placeWord = (grid: C_Data[][], word: string, row: number, col: number, isHorizontal: boolean) => {
        if (isHorizontal) {
            for (let i = 0; i < word.length; i++) {
                grid[row][col + i].letter = word[i]; // Place the letter on the grid horizontally
            }
        } else {
            for (let i = 0; i < word.length; i++) {
                grid[row + i][col].letter = word[i]; // Place the letter on the grid vertically
            }
        }
        // return grid;
    };

    // Helper function to generate a random letter
    const getRandomLetter = () => {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    };

    const placeAnswers = (answers: string[]) => {
        // Place each word randomly in the grid
        for (const word of answers) {
            let placed = false;

            while (!placed) {
                const isHorizontal = Math.random() < 0.5; // Randomly choose orientation
                const row = Math.floor(Math.random() * crossWordDataRef.current.length);
                const col = Math.floor(Math.random() * crossWordDataRef.current[0].length);

                if (canPlaceWord(crossWordDataRef.current, word, row, col, isHorizontal)) {
                    placeWord(crossWordDataRef.current, word, row, col, isHorizontal);
                    placed = true; // Mark the word as placed
                }
            }
        }

        // Fill empty cells with random letters
        crossWordDataRef.current = crossWordDataRef.current.map(row =>
            row.map(cell => {
                if (!cell.letter) {
                    return { ...cell, letter: getRandomLetter() };
                }
                return cell;
            })
        );

        setRender(prev => !prev);
    };

    // Called to check if a user has reached an answer
    const confirmAnswers = (selectedCells: Pos[]) => {
        // Form a string of selected words
        const combinedString = selectedCells.map(cell => crossWordDataRef.current[cell.row][cell.col].letter).join('')
        // If the string is in answers then make its correct as true
        if (sortedAnswers.includes(combinedString)) {
            selectedCells.map(cell => crossWordDataRef.current[cell.row][cell.col].correct = true);
            const index = bottomWordsRef.current.findIndex(item => item.word === combinedString);
            if (index !== -1) bottomWordsRef.current[index].pressed = true;
            const selected_answers: number = selectedAnswers + 1;
            setSelectedAnswers(selected_answers);
            if (selected_answers === sortedAnswers.length) {
                setGameStarted(false);
                if (name && contact)
                    router.replace(`/winner?name=${name}&contact=${contact}`);
                else
                    router.replace('/winner');
            }
        }
    }

    // The moment component mounts, load the data
    useEffect(() => {
        const bottomDataArray: Bottom_Data[] = sortedAnswers.map(answer => ({
            word: answer,
            pressed: false,
        }))
        bottomWordsRef.current = bottomDataArray;
        placeAnswers(sortedAnswers);
    }, []);

    useEffect(() => {
        return () => {
            // Reset the timer
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [timer]);

    useEffect(() => {
        if (remainingTime == 0) {
            router.replace('/looser')
            setGameStarted(false);
        }
    }, [remainingTime]);

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/images/PSO_LOGO-01.png')} 
                style={styles.logoImage}
            />
            
            {!gameStarted ?
                <Pressable
                    onPress={startGame}
                    style={styles.startButton}>
                    <Image source={require('../assets/images/Start.png')}/>
                </Pressable>
            :
                <Text style={styles.timer}>{remainingTime}</Text>
            }
            <Image
                source={require('../assets/images/MOTOR_OIL.png')} 
                style={styles.motorOilImage}
            />
            <View style={styles.crosswordContainer}>
                {crossWordDataRef.current && crossWordDataRef.current.map((row, rowIndex) => (
                    <View 
                        key={rowIndex}
                        style={styles.rowContainer}
                    >
                    {row.map((cell, colIndex) => (
                        <Pressable 
                            key={colIndex} 
                            onPress={() => gameStarted ? handleCellPress(rowIndex, colIndex) : null } 
                            style={[
                                styles.cell,
                                { backgroundColor: '#c18500' },
                                cell.correct ? styles.bgColorLightGreen : cell.pressed ? styles.bgColorLightOrange : cell.highlighted ? styles.bgColorLightBlue : { backgroundColor: '#c18500' }
                            ]}
                        >
                        <Text style={styles.cellText}>{cell.letter}</Text>
                        </Pressable>
                    ))}
                    </View>
                ))}
            </View>
            <View style={styles.wordsContainer}>
                {bottomWordsRef.current.map((word, index) => (
                    <Text key={index} style={[styles.wordText, word.pressed ? styles.colorGreen : styles.colorWhite]}>{word.word}</Text>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 50,
        backgroundColor: 'black',
        height: '100%',
        position: 'relative',
    },
    timer: {
        position: 'absolute',
        top: '15%',
        color: 'white',
        fontSize: 50,
        fontWeight: '600',
    },
    logoImage: {
        position: 'absolute',
        top: '3%',
        left: '3%',
        width: 108,
        height: 108,
    },
    startButton: {
        position: 'absolute',
        top: '10%',
    },
    progressBar: {
        height: 25,
        backgroundColor: 'green',
        position: 'absolute',
        top: '20%',
        left: 0,
    },
    motorOilImage: {
        position: 'absolute',
        top: '5%',
        right: '5%'
    },
    crosswordContainer: {
        marginTop: 300,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    cell: {
        width: 70,
        height: 70,
        alignItems: 'center',
        borderWidth: 2,
    },
    borderGreen: {
        borderColor: 'green',
    },
    borderOrange: {
        borderColor: 'orange',
    },
    borderBlue: {
        borderColor: 'blue',
    },
    borderBlack: {
        borderColor: 'black',
    },
    bgColorLightGreen: {
        backgroundColor: '#54b54a',
    },
    bgColorLightBlue: {
        backgroundColor: '#4372d7',
    },
    bgColorLightOrange: {
        backgroundColor: '#f0b73c',
    },
    colorGreen: {
        color: 'green',
    },
    colorWhite: {
        color: 'white',
    },
    cellText: {
        fontFamily: 'Picaflor-Bold',
        fontSize: 48,
        color: 'white',
    },
    wordsContainer: {
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        maxHeight: '15%',
        alignItems: 'flex-start',
        margin: 20,
        width: '100%',
    },
    wordText: {
        fontSize: 30,
        fontFamily: 'Poppins-Medium',
        fontWeight: '600',
        color: 'white',
        marginRight: 200,
    },
});
