import { use, useEffect, useState } from "react";

import type { Sound, SoundCell, PuzzleGrid } from "../types";

const PuzzlePage: React.FC<{ userUID: string }> = ({ userUID }) => {
    const GROUPS: string[] = ["A", "B", "C", "D"];
    const DIFFICULTIES: string[] = ["EASY", "MEDIUM", "HARD"];

    const [group, setGroup] = useState<string>(GROUPS[0]);
    const [difficulty, setDifficulty] = useState<string>(DIFFICULTIES[0]);

    const handleOnGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setGroup(e.target.value);
    }

    const handleOnDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDifficulty(e.target.value);
    }

    const [sounds, setSounds] = useState<Sound[]>([]);
    const [puzzleGrid, setPuzzleGrid] = useState<PuzzleGrid | null>(null);

    useEffect(() => {
        const fetchPuzzleData = async () => {
            try {
                const response = await fetch(`https://api.puzzle.codenestedu.fr/api/puzzle?uid=${userUID}&group=${group}&difficulty=${difficulty}`);
                const data = await response.json();

                setPuzzleGrid(
                    {
                        puzzleId: data.puzzleId,
                        cells: data.cells.map((cell: any) => ({
                            isRevealed: cell.isRevealed,
                            sound: {
                                id: cell.sound.id,
                                name: cell.sound.name,
                                instrument: cell.sound.instrument,
                                fileUrl: cell.sound.filePath
                            }
                        }))
                    }
                );
            } catch (error) {
                console.error("Error fetching puzzle data:", error);
            }
        };

        if (userUID) {
            fetchPuzzleData();
        }
    }, [group, difficulty]);

    useEffect(() => {
        try
        {
            const response = fetch(`https://api.puzzle.codenestedu.fr/api/sound-ids?uid=${userUID}&puzzleId=${puzzleGrid?.puzzleId}`);
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
    }, []);

    return (
        <>
            <h1>
                Musical Puzzle
            </h1>
            
            <div>
                <select value={group} onChange={handleOnGroupChange}>
                    {GROUPS.map((grp) => (
                        <option value={grp}>{grp}</option>
                    ))}
                </select>

                <select value={difficulty} onChange={handleOnDifficultyChange}>
                    {DIFFICULTIES.map((diff) => (
                        <option value={diff}>{diff}</option>
                    ))}
                </select>
            </div>
            
            <div>
                <div>
                    {/* Scroll menu */}
                    {sounds.map((sound) => (
                        <div key={sound.id}>
                            <p>{sound.name}</p>
                            <audio controls>
                                <source src={sound.fileUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    ))}
                </div>
                <div>
                    {/* Puzzle grid */}
                    {puzzleGrid ? (
                        <table>
                            <tbody>
                                {puzzleGrid.cells.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, colIndex) => (
                                            <td key={colIndex} style={{ border: '1px solid black', padding: '10px' }}>
                                                {cell.isRevealed ? (
                                                    <div>
                                                        <p>{cell.sound.name}</p>
                                                        <audio controls>
                                                            <source src={cell.sound.fileUrl} type="audio/mpeg" />
                                                            Your browser does not support the audio element.
                                                        </audio>
                                                    </div>
                                                ) : (
                                                    <p>Hidden</p>
                                                )}
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