import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import '../global.css';

interface C_Data {
  letter: string;
  pressed: boolean;
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
  const resetTime = 2000;

  // Sort words by length, descending
  const sortedAnswers = ["OWAIS", "ALI", "ABSER", "FASIH"].sort((a, b) => b.length - a.length);

  const handleCellPress = (rowIndex: number, colIndex: number) => {
    // Set true pressed on the rowIndex and colIndex in array
    const newCrosswordData = crosswordData.map((row, i) =>
      row.map((cell, j) => (i === rowIndex && j === colIndex ? { ...cell, pressed: true } : cell))
    );
    setCrosswordData(newCrosswordData);

    // Everytime there is a press reset timer
    if (timer) clearTimeout(timer);

    const newTimer = setTimeout(() => {
      setCrosswordData((prev) => prev.map(row => row.map((cell) => ({ ...cell, pressed: false }))));
    }, resetTime);

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
        newGrid[row][col + i].letter = word[i]; // Place the letter on the grid horizontally
      }
    } else {
      for (let i = 0; i < word.length; i++) {
        newGrid[row + i][col].letter = word[i]; // Place the letter on the grid vertically
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

    // Place the first word (longest) in the middle, horizontally by default
    const firstWord = answers[0];
    newCrosswordData = placeWord(newCrosswordData, firstWord, Math.floor(newCrosswordData.length / 2), 1, true);

    // Loop over remaining words to place them
    for (let i = 1; i < answers.length; i++) {
      const word = answers[i];
      let placed = false;

      // Loop over the current grid to find possible intersections
      outerLoop: for (let row = 0; row < newCrosswordData.length; row++) {
        for (let col = 0; col < newCrosswordData[0].length; col++) {
          const gridCell = newCrosswordData[row][col];

          // Check if this grid cell can be used for intersection
          if (gridCell.letter && word.includes(gridCell.letter)) {
            // Try placing horizontally at intersection
            const indexInWord = word.indexOf(gridCell.letter);
            if (canPlaceWord(newCrosswordData, word, row, col - indexInWord, true)) {
              newCrosswordData = placeWord(newCrosswordData, word, row, col - indexInWord, true);
              placed = true;
              break outerLoop;
            }
            // Try placing vertically at intersection
            if (canPlaceWord(newCrosswordData, word, row - indexInWord, col, false)) {
              newCrosswordData = placeWord(newCrosswordData, word, row - indexInWord, col, false);
              placed = true;
              break outerLoop;
            }
          }
        }
      }

      if (!placed) {
        console.log(`Could not place the word: ${word}`);
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
