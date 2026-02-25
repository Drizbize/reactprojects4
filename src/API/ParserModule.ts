import type { PuzzleGrid, Sound, SoundCell } from "../types";

const getPuzzleGrid = async (uid: string, group: string, difficulty: string): Promise<PuzzleGrid | null> => {
    try {
        const response = await fetch(`https://api.puzzle.codenestedu.fr/api/puzzle?uid=${uid}&group=${group}&difficulty=${difficulty}`);
        const data = await response.json();

        if (data.error) {
            return {
                puzzleId: -1,
                cells: []
            };
        }

        let grid: PuzzleGrid = {
            puzzleId: data.puzzleId,
            cells: []
        };

        let sounds: SoundCell[][] = [];
        data.cells.forEach((cell: any) => {
            let sound: Sound = {
                id: cell.sound.id,
                name: cell.sound.name,
                instrument: cell.sound.instrument,
                fileUrl: cell.sound.filePath
            };

            let soundCell: SoundCell = {
                isRevealed: cell.revealed,
                sound: sound
            };

            if (sounds.at(cell.l) === undefined) {
                sounds[cell.l] = [];
            }

            sounds[cell.l][cell.c] = soundCell;
        });

        grid.cells = sounds;
        return grid;
    } catch (error) {
        console.error("Failed to fetch puzzle:", error);
        return null;
    }
}

export default getPuzzleGrid;