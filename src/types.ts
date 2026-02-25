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

export type Person = {
    name: string;
    group: string;
}

export type CellPuzzleElement = {
    puzzleId: number,
    sound: Sound
}

export type Student = {
    personIdentity: Person;
    correctPlaced: number;
    attempts: 0;
    lastAttemptAt: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
    banished: boolean;
    banishedAt: Date | null;
    reveals: [];

    groupRevealsCount: number
}