import type { GroupScore, Sound, Difficulty, PuzzleGrid, SoundCell, StudentResponse } from "../types";

const BASE_URL = import.meta.env.VITE_API_SERVEUR.endsWith('/') 
    ? import.meta.env.VITE_API_SERVEUR.slice(0, -1) 
    : import.meta.env.VITE_API_SERVEUR;

export const getGroupScores = async (uid: string): Promise<GroupScore[]> => {
    try {
        const response = await fetch(`${BASE_URL}/api/revealed-pieces/${uid}`);
        const data = await response.json();
        return data.revealedPieces;
    } catch (error) {
        console.error("Error fetching group scores:", error);
        throw error;
    }
};

export const getSoundDetails = async (uid: string, puzzleId: number): Promise<Sound[]> => {
    try {
        const response = await fetch(`${BASE_URL}/api/sound-ids?uid=${uid}&puzzleId=${puzzleId}`);
        const data = await response.json();

        return data.soundDetails.map((sound: any) => ({
            id: sound.soundId,
            name: sound.name,
            instrument: sound.instrument,
            fileUrl: sound.fileUrl
        }));
    } catch (error) {
        console.error("Error fetching puzzle data:", error);
        throw error;
    }
};

export const guessSound = async (
    uid: string,
    difficulty: Difficulty,
    row: number,
    col: number,
    guessedSoundId: number | null
): Promise<any> => {
    try {
        const response = await fetch(`${BASE_URL}/api/guess`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uid: uid,
                difficulty: difficulty,
                l: row,
                c: col,
                guessedSoundId: guessedSoundId,
            })
        });
        return await response.json();
    } catch (error) {
        console.error("Error guessing sound:", error);
        throw error;
    }
};

export const getPuzzleGrid = async (uid: string, group: string, difficulty: string): Promise<PuzzleGrid | null> => {
    try {
        const response = await fetch(`${BASE_URL}/api/puzzle?uid=${uid}&group=${group}&difficulty=${difficulty}`);
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
};

export const getStudentNames = async (uid: string): Promise<{ ok: boolean; students: { name: string; group: string }[] }> => {
    try {
        const response = await fetch(`${BASE_URL}/api/studentsName/${uid}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching student names:", error);
        throw error;
    }
};

export const getStudent = async (uid: string, name: string): Promise<StudentResponse> => {
    try {
        const response = await fetch(`${BASE_URL}/api/student/${uid}?name=${encodeURIComponent(name)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching student:", error);
        throw error;
    }
};
