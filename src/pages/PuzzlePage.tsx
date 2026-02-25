import { useEffect, useRef, useState } from "react";

import type { Sound, SoundCell, PuzzleGrid, Group, Difficulty } from "../types";
import { useAuth } from "../Auth";
import getPuzzleGrid from "../API/ParserModule";

const PuzzlePage: React.FC= () => {
    const {uid} = useAuth();

    const GROUPS: Group[] = ["A", "B", "C", "D"];
    const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

    const [group, setGroup] = useState<Group>(GROUPS[0]);
    const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES[0]);
    const [selectedSoundId, setSelectSoundId] = useState<number | null>(null);

    const handleOnGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setGroup(e.target.value as Group);
    }

    const handleOnDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDifficulty(e.target.value as Difficulty);
    }

    const [sounds, setSounds] = useState<Sound[]>([]);
    const [puzzleGrid, setPuzzleGrid] = useState<PuzzleGrid | null>(null);
    const [flashMessage, setFlashMessage] = useState<{ text: string; isCorrect: boolean } | null>(null);

    useEffect(() => {
        const loadPuzzle = async () => {
            if (!uid)
                return;

            try
            {
                const grid = await getPuzzleGrid(uid, group, difficulty);
                if (grid === null)
                {
                    throw Error("Grid is null");
                }
                setPuzzleGrid(grid);
                
                console.log("Fetched puzzle data:", grid);
            } catch (error) {
                console.error("Error fetching puzzle data:", error);
            }
        };

        loadPuzzle();

    }, [uid, group, difficulty]);

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
                setFlashMessage({ text: "Correct!", isCorrect: true });
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
                setSelectSoundId(null);
                setTimeout(() => setFlashMessage(null), 3000);
            }
            else
            {
                setFlashMessage({ text: "Incorrect!", isCorrect: false });
                setTimeout(() => setFlashMessage(null), 3000);
            }
        })
    };

    return (
        <>
            {flashMessage && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '20px 40px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: flashMessage.isCorrect ? 'green' : 'red',
                    borderRadius: '8px',
                    zIndex: 1000
                }}>
                    {flashMessage.text}
                </div>
            )}
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
                            <button onClick={() => setSelectSoundId(sound.id)}>Select</button>
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
                                            <td key={`cell-${rowIndex}-${colIndex}`}
                                                style= { cell.isRevealed === false ? { border: '2px solid black', padding: '10px' } : { border: '2px solid green', padding: '10px' }}>
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