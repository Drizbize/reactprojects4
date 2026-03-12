import { useEffect, useRef, useState } from "react";
import "./PuzzlePage.css";

import type { Sound, PuzzleGrid, Group, Difficulty } from "../types";
import { useAuth } from "../Auth";
import { getSoundDetails, guessSound, getPuzzleGrid } from "../API/api";

const PuzzlePage: React.FC = () => {
    const { uid } = useAuth();

    const GROUPS: Group[] = ["A", "B", "C", "D"];
    const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

    const [group, setGroup] = useState<Group>(GROUPS[0]);
    const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES[0]);
    const [selectedSoundId, setSelectSoundId] = useState<number | null>(null);
    const [lastListened, setLastListened] = useState<{ row: number, col: number } | null>(null);
    const [lastListenedSidebarId, setLastListenedSidebarId] = useState<number | null>(null);

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

            try {
                const grid = await getPuzzleGrid(uid, group, difficulty);
                if (grid === null) {
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
        if (!puzzleGrid || !uid) {
            console.log("Puzzle grid not loaded yet.");
            return;
        }

        setSounds([]); // Clear the sound list before fetching new IDs

        const fetchSoundDetails = async () => {
            try {
                if (puzzleGrid?.puzzleId === undefined) return;
                const soundDetails = await getSoundDetails(uid, puzzleGrid.puzzleId);

                setSounds(soundDetails);
            } catch (error) {
                // Error already logged in API
            }
        };

        fetchSoundDetails();
    }, [puzzleGrid, uid]);

    const audio = useRef<HTMLAudioElement | null>(null);

    const audioPlay = (sound: Sound) => {
        audioStop();
        const baseUrl = import.meta.env.VITE_API_SERVEUR.endsWith('/') 
            ? import.meta.env.VITE_API_SERVEUR 
            : `${import.meta.env.VITE_API_SERVEUR}/`;
            
        const newAudio = new Audio(`${baseUrl}${sound.fileUrl}`);
        audio.current = newAudio;

        newAudio.play().catch(error => {
            if (error.name !== "AbortError") {
                console.error("Audio playback error:", error);
            }
        });
    };

    const audioStop = () => {
        if (audio.current) {
            audio.current.pause();
            audio.current = null;
        }
    };

    const guessSelected = (tableSoundId: number, row: number, col: number) => {
        if (!uid) return;
        guessSound(uid, difficulty, row, col, selectedSoundId)
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
                else {
                    setFlashMessage({ text: "Incorrect!", isCorrect: false });
                    setTimeout(() => setFlashMessage(null), 3000);
                }
            })
    };

    return (
        <div className="container puzzle-container">
            {flashMessage && (
                <div className={`flash-message ${flashMessage.isCorrect ? 'success' : 'error'}`}>
                    {flashMessage.text}
                </div>
            )}

            <div className="page-header">
                <h1 className="text-gradient">
                    Musical Puzzle
                </h1>
                <p>Listen, identify, and reveal the hidden sounds</p>
            </div>

            <div className="puzzle-controls">
                <select value={group} onChange={handleOnGroupChange}>
                    {GROUPS.map((grp) => (
                        <option key={grp} value={grp}>Group {grp}</option>
                    ))}
                </select>

                <select value={difficulty} onChange={handleOnDifficultyChange}>
                    {DIFFICULTIES.map((diff) => (
                        <option key={diff} value={diff}>{diff}</option>
                    ))}
                </select>
            </div>

            <div className="puzzle-layout">
                <div className="sounds-list">
                    {/* Scroll menu */}
                    {sounds.map((sound, index) => (
                        <div 
                            key={`${sound.id}-${sound.name}-${index}`} 
                            className={`hover-card sound-card ${lastListenedSidebarId === sound.id ? 'last-listened' : ''}`}
                        >
                            <div className="sound-info">
                                <span className="sound-instrument">{sound.instrument}</span>
                                <span>{sound.name}</span>
                            </div>
                            <div className="sound-actions">
                                <div className="playback-controls">
                                    <button 
                                        className="btn-secondary btn-icon" 
                                        onClick={() => {
                                            audioPlay(sound);
                                            setLastListenedSidebarId(sound.id);
                                        }}
                                    >
                                        ▶️
                                    </button>
                                    <button className="btn-secondary btn-icon" onClick={audioStop}>⏹️</button>
                                </div>
                                <button
                                    className={selectedSoundId === sound.id ? "btn-select" : "btn-secondary btn-select"}
                                    onClick={() => setSelectSoundId(selectedSoundId === sound.id ? null : sound.id)}
                                >
                                    {selectedSoundId === sound.id ? "Selected" : "Select"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="puzzle-grid-wrapper">
                    {/* Puzzle grid */}
                    {puzzleGrid ? (
                        <table className="puzzle-table">
                            <tbody>
                                {puzzleGrid.cells.map((row, rowIndex) => (
                                    <tr key={`row-${rowIndex}`}>
                                        {row.map((cell, colIndex) => (
                                            <td key={`cell-${rowIndex}-${colIndex}`} className="puzzle-cell">
                                                <div className={`cell-content ${cell.isRevealed ? 'cell-revealed' : 'cell-hidden'} ${lastListened?.row === rowIndex && lastListened?.col === colIndex ? 'last-listened' : ''}`}>
                                                    <div className="cell-buttons">
                                                        <div className="playback-controls">
                                                            <button 
                                                                className="btn-secondary btn-icon" 
                                                                onClick={() => {
                                                                    audioPlay(cell.sound);
                                                                    setLastListened({ row: rowIndex, col: colIndex });
                                                                }}
                                                            >
                                                                ▶️
                                                            </button>
                                                            <button className="btn-secondary btn-icon" onClick={audioStop}>
                                                                ⏹️
                                                            </button>
                                                        </div>

                                                        {(selectedSoundId !== null && !cell.isRevealed) && (
                                                            <button className="btn-sm" onClick={() => guessSelected(cell.sound.id, rowIndex, colIndex)}>
                                                                Guess
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex-center" style={{ padding: '3rem' }}>
                            <p className="text-muted">Loading puzzle...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PuzzlePage;