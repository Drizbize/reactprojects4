export type Sound = {
    id: number;
    name: string;
    instrument: string;
    fileUrl: string;
}

export type SoundCell = {
    //x: number;
    //y: number;
    isRevealed: boolean;
    sound: Sound;
}

export type PuzzleGrid = {
    puzzleId: number;
    cells: SoundCell[][];
};

export type GroupScore = {
    group: "A" | "B" | "C" | "D";
    score: number;
}