import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import * as SplashScreen from 'expo-splash-screen';
import '../global.css';
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

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

export default function Index() {
  const initialCrosswordData: C_Data[][] = Array(10).fill(null).map(() =>
    Array(10).fill(null).map(() => ({
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
  const [loaded, error] = useFonts({
    'Big-Noodle-Titling': require('../assets/fonts/big_noodle_titling.ttf'),
  });
  const resetTime = 2000;

  // Sort words by length, descending
  const sortedAnswers = ["OWAIS", "ABSER", "ALI", "FASIH"].sort((a, b) => b.length - a.length);

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
    if (timer) {clearTimeout(timer);}

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

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View 
    className="flex flex-col items-center justify-center pl-5 pr-5 bg-black h-[100%]">
    {crossWordDataRef.current && crossWordDataRef.current.map((row, rowIndex) => (
      <View 
        key={rowIndex} 
        className="flex flex-row justify-center w-full gap-[2px]" 
      >
        {row.map((cell, colIndex) => (
          <Pressable 
            key={colIndex} 
            onPress={() => handleCellPress(rowIndex, colIndex)} 
            className={`w-[10%] h-[60] justify-center items-center border-[3px] bg-[#c18500]
              ${cell.correct ? 'border-green-500' : cell.pressed ? 'border-orange-300' : cell.highlighted ? 'border-blue-400' : 'border-black'}`}
          >
            <Text className="font-['Big-Noodle-Titling'] text-[40px] text-white">{cell.letter}</Text>
          </Pressable>
        ))}
      </View>
    ))}
  </View>
  );
}
