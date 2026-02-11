import { use, useEffect, useRef, useState } from "react";

import type { AuthContextType, Sound, SoundCell, PuzzleGrid, Group, Difficulty } from "../types";
import { useAuth } from "../Auth";

const PuzzlePage: React.FC= () => {
    const {uid} = useAuth();

    const GROUPS: Group[] = ["A", "B", "C", "D"];
    const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

    const [group, setGroup] = useState<Group>(GROUPS[0]);
    const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES[0]);
    const [selectedSoundId, selectSoundId] = useState<number | null>(null);

    const handleOnGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setGroup(e.target.value as Group);
    }

    const handleOnDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDifficulty(e.target.value as Difficulty);
    }

    const [sounds, setSounds] = useState<Sound[]>([]);
    const [puzzleGrid, setPuzzleGrid] = useState<PuzzleGrid | null>(null);

    useEffect(() => {
        const fetchPuzzleData = async () => {
            try {
                const response = await fetch(`https://api.puzzle.codenestedu.fr/api/puzzle?uid=${uid}&group=${group}&difficulty=${difficulty}`);
                const data = await response.json();

                let sounds:SoundCell[][] = [];
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

                    if (sounds.at(cell.l) === undefined)
                    {
                        sounds[cell.l] = [];
                    }

                    sounds[cell.l][cell.c] = soundCell;
                });

                setPuzzleGrid(
                    {
                        puzzleId: data.puzzleId,
                        cells: sounds
                    }
                );
                console.log("Fetched puzzle data:", data);
            } catch (error) {
                console.error("Error fetching puzzle data:", error);
            }
        };

        console.log("userUID:", uid, "Group:", group, "Difficulty:", difficulty);

        if (uid !== null) {
            fetchPuzzleData();
        }
    }, [group, difficulty]);

    useEffect(() => {
        if (!puzzleGrid)
        {
            console.log("Puzzle grid not loaded yet.");
            return;
        }
        try {
            const response = fetch(`https://api.puzzle.codenestedu.fr/api/sound-ids?uid=${uid}&puzzleId=${puzzleGrid?.puzzleId}`);
            response.then(res => res.json())
            .then(data => {
                data.soundDetails.map((sound: any) => {
                    setSounds((prevSounds) => [
                        ...prevSounds,
                        {
                            id: sound.soundId,
                            name: sound.name,
                            instrument: sound.instrument,
                            fileUrl: sound.fileUrl
                        }
                    ]);
                })
            });
        } catch (error) {
            console.error("Error fetching puzzle data:", error);
        }
    }, [puzzleGrid]);

    const audio = useRef<HTMLAudioElement | null>(null);

    const audioPlay = (sound: Sound) => {
        audioStop();
        audio.current = new Audio(`https://api.puzzle.codenestedu.fr/${sound.fileUrl}`);
        audio.current.play();
    };

    const audioStop = () => {
        if (audio !== null && audio.current !== null) {
            audio.current?.pause();
        }
    };

    const guessSelected = (tableSoundId: number, row: number, col: number) => {
        // post method /api/guess
        fetch(`https://api.puzzle.codenestedu.fr/api/guess`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uid: uid,
                difficulty: difficulty,
                l: row,
                c: col,
                guessedSoundId: selectedSoundId,
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Guess response:", data);
            if (data.correct) {
                setPuzzleGrid((prevGrid) => {
                    if (!prevGrid) 
                        return prevGrid;

                    const updatedCells = prevGrid.cells.map((row) =>
                        row.map((cell) => {
                            if (cell.sound.id === tableSoundId) {
                                return { ...cell, isRevealed: true };
                            }
                            return cell;
                        })
                    );

                    return { ...prevGrid, cells: updatedCells };
                });
                selectSoundId(null);
            }
        })
    };

    return (
        <>
            <h1>
                Musical Puzzle
            </h1>
            
            <div>
                <select value={group} onChange={handleOnGroupChange}>
                    {GROUPS.map((grp) => (
                        <option key={grp} value={grp}>{grp}</option>
                    ))}
                </select>

                <select value={difficulty} onChange={handleOnDifficultyChange}>
                    {DIFFICULTIES.map((diff) => (
                        <option key={diff} value={diff}>{diff}</option>
                    ))}
                </select>
            </div>
            
            <div>
                <div>
                    {/* Scroll menu */}
                    {sounds.map((sound, index) => (
                        <div key={`${sound.id}-${sound.name}-${index}`}>
                            {sound.instrument} {sound.name}
                            <button onClick={() => audioPlay(sound)}>Play</button>
                            <button onClick={audioStop}>Stop</button>
                            <button onClick={() => selectSoundId(sound.id)}>Select</button>
                        </div>
                    ))}
                </div>
                <div>
                    {/* Puzzle grid */}
                    {puzzleGrid ? (
                        <table>
                            <tbody>
                                {puzzleGrid.cells.map((row, rowIndex) => (
                                    <tr key={`row-${rowIndex}`}>
                                        {row.map((cell, colIndex) => (
                                            <td key={`cell-${rowIndex}-${colIndex}`} style={{ border: '1px solid black', padding: '10px' }}>
                                                <div>
                                                    <button onClick={() => audioPlay(cell.sound)}>
                                                        Play
                                                    </button>
                                                    <button onClick={audioStop}>
                                                        Stop
                                                    </button>

                                                    {(selectedSoundId !== null && cell.isRevealed === false) && (
                                                        <button onClick={() => guessSelected(cell.sound.id, rowIndex, colIndex)}>
                                                            Select
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Loading puzzle...</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default PuzzlePage;