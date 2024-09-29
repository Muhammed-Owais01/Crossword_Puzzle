import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import '../global.css';

interface C_Data {
  letter: string;
  pressed: boolean;
}

interface Pos {
  row: number;
  col: number;
}

export default function Index() {
  const initialCrosswordData: C_Data[][] = Array(9).fill(null).map(() =>
    Array(7).fill(null).map(() => ({
      letter: '',
      pressed: false,
    }))
  );

  const [crosswordData, setCrosswordData] = useState<C_Data[][]>(initialCrosswordData);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [lastSelected, setLastSelected] = useState<Pos | null>(null);
  const resetTime = 2000;

  // Sort words by length, descending
  const sortedAnswers = ["Owais", "Abser", "Ali", "Fasih"].sort((a, b) => b.length - a.length);

  const resetGridPresses = () => {
    setCrosswordData(prev => prev.map(row => row.map((cell) => ({ ...cell, pressed: false }))));
    setSelectedCount(0);
    setLastSelected(null);
  }

  const handleCellPress = (rowIndex: number, colIndex: number) => {
    // check if lastSelected exists
    if (lastSelected) {
      if (lastSelected.row == rowIndex && lastSelected.col == colIndex)
        return;
      if (Math.abs(lastSelected.row - rowIndex) > 1 || Math.abs(lastSelected.col - colIndex) > 1) {
        if (timer) {
          clearTimeout(timer);
          resetGridPresses();
        }
      }
    }

    // Set true pressed on the rowIndex and colIndex in array
    const newCrosswordData = crosswordData.map((row, i) =>
      row.map((cell, j) => (i === rowIndex && j === colIndex ? { ...cell, pressed: true } : cell))
    );
    setCrosswordData(newCrosswordData);
    setLastSelected({ row: rowIndex, col: colIndex });
    setSelectedCount(prev => prev + 1);

    // Everytime there is a press reset timer
    if (timer) clearTimeout(timer);

    const newTimer = setTimeout(resetGridPresses, resetTime);

    setTimer(newTimer);
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
    const newGrid = [...grid];
    if (isHorizontal) {
      for (let i = 0; i < word.length; i++) {
        newGrid[row][col + i]!.letter = word[i]; // Place the letter on the grid horizontally
      }
    } else {
      for (let i = 0; i < word.length; i++) {
        newGrid[row + i][col]!.letter = word[i]; // Place the letter on the grid vertically
      }
    }
    return newGrid;
  };

  // Helper function to generate a random letter
  const getRandomLetter = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  };

  const placeAnswers = (answers: string[]) => {
    let newCrosswordData = [...crosswordData];
  
    // Place each word randomly in the grid
    for (const word of answers) {
      let placed = false;
  
      while (!placed) {
        const isHorizontal = Math.random() < 0.5; // Randomly choose orientation
        const row = Math.floor(Math.random() * newCrosswordData.length);
        const col = Math.floor(Math.random() * newCrosswordData[0].length);

        if (canPlaceWord(newCrosswordData, word, row, col, isHorizontal)) {
          newCrosswordData = placeWord(newCrosswordData, word, row, col, isHorizontal);
          placed = true; // Mark the word as placed
        }
  
        /* No need to check if word is within bounds since that is already being checked in the canPlace
        // Determine placement based on orientation
        if (isHorizontal) {
          if (col + word.length <= newCrosswordData[0].length) {
            // Check if we can place the word horizontally
            if (canPlaceWord(newCrosswordData, word, row, col, true)) {
              newCrosswordData = placeWord(newCrosswordData, word, row, col, true);
              placed = true; // Mark the word as placed
            }
          }
        } else {
          if (row + word.length <= newCrosswordData.length) {
            // Check if we can place the word vertically
            if (canPlaceWord(newCrosswordData, word, row, col, false)) {
              newCrosswordData = placeWord(newCrosswordData, word, row, col, false);
              placed = true; // Mark the word as placed
            }
          }
        }
        */
      }
    }
  
    // Fill empty cells with random letters
    newCrosswordData = newCrosswordData.map(row =>
      row.map(cell => {
        if (!cell.letter) {
          return { ...cell, letter: getRandomLetter() };
        }
        return cell;
      })
    );
  
    setCrosswordData(newCrosswordData);
  };
  
  

  // The moment component mounts, load the data
  useEffect(() => {
    placeAnswers(sortedAnswers);
  }, []);

  useEffect(() => {
    return () => {
      // Reset the timer
      if (timer) clearTimeout(timer);
    };
  }, [timer]);

  return (
    <View className="flex flex-col items-center justify-center pt-8 pl-3 pr-3 bg-blue-400">
      {crosswordData && crosswordData.map((row, rowIndex) => (
        <View key={rowIndex} className="flex flex-row">
          {row.map((cell, colIndex) => (
            <Pressable 
              key={colIndex} 
              onPress={() => handleCellPress(rowIndex, colIndex)} 
              className={`mr-3 mb-3 w-[50px] h-[50px] flex items-center justify-center ${cell.pressed ? 'bg-green-400' : 'bg-white'}`}
            >
              <Text>{cell.letter}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
