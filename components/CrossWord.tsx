import { useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

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

export default function CrossWord() {
    const navigation = useNavigation();
    const initialCrosswordData: C_Data[][] = Array(9).fill(null).map(() =>
        Array(7).fill(null).map(() => ({
            letter: '',
            pressed: false,
            highlighted: false,
            correct: false,
        }))
    );
    const crossWordDataRef = useRef<C_Data[][]>(initialCrosswordData);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const [render, setRender] = useState<boolean>(false);
    const [selectedCells, setSelectedCells] = useState<Pos[]>([]);
    const [direction, setDirection] = useState<boolean | null>(null);
    const resetTime = 2000;

    // Sort words by length, descending
    const sortedAnswers = ["CROSS", "WORD", "GAME", "DEMO"].sort((a, b) => b.length - a.length);

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
            selectedCells.map(cell => crossWordDataRef.current[cell.row][cell.col].correct = true)
        }
    }

    // The moment component mounts, load the data
    useEffect(() => {
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

    // useEffect(() => {
    //     navigation.addListener('beforeRemove', e => e.preventDefault());
    // }, []);

    return (
        <View style={styles.container}>
        <Image
            source={require('../assets/images/PSO_LOGO-01.png')} 
            style={styles.logoImage}
        />
        <Pressable style={styles.startButton}>
            <Image source={require('../assets/images/Start.png')}/>
        </Pressable>
        <Image
            source={require('../assets/images/MOTOR_OIL.png')} 
            style={styles.motorOilImage}
        />
        {crossWordDataRef.current && crossWordDataRef.current.map((row, rowIndex) => (
            <View 
                key={rowIndex}
                style={styles.rowContainer}
            >
            {row.map((cell, colIndex) => (
                <Pressable 
                    key={colIndex} 
                    onPress={() => handleCellPress(rowIndex, colIndex)} 
                    style={[
                        styles.cell,
                        { backgroundColor: '#c18500' },
                        cell.correct ? styles.borderGreen : cell.pressed ? styles.borderOrange : cell.highlighted ? styles.borderBlue : styles.borderBlack
                    ]}
                >
                <Text style={styles.cellText}>{cell.letter}</Text>
                </Pressable>
            ))}
            </View>
        ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '5%',
        backgroundColor: 'black',
        height: '100%',
        position: 'relative',
    },
    logoImage: {
        position: 'absolute',
        top: '3%',
        left: '3%',
        width: 144, // 36 * 4 = 144px
        height: 144,
    },
    startButton: {
        position: 'absolute',
        top: '8%',
    },
    motorOilImage: {
        position: 'absolute',
        top: '5%',
        right: '5%',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        gap: 2,
    },
    cell: {
        width: '10%',
        height: 75,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
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
    cellText: {
        fontFamily: 'Picaflor-Bold',
        fontSize: 48,
        color: 'white',
    },
});
