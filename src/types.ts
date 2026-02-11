export type AuthContextType = {
    uid: string | null;
    authUid: (uid: string) => void;
    deconnecter: () => void;
};

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

export type Group = "A" | "B" | "C" | "D";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type GroupScore = {
    group: Group;
    count: number;
}