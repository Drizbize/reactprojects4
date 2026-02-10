import React, { useState, useEffect } from "react";
import type { GroupScore } from "../types";

const GroupsPage: React.FC<{ userUID: string }> = ({ userUID }) => {
    const [groupScores, setGroupScores] = useState<GroupScore[]>([]);

    useEffect(() => {
        const fetchGroupScores = async () => {
            try {
                const response = await fetch(`https://api.puzzle.codenestedu.fr/api/revealed-pieces/${userUID}`);
                const data = await response.json();
                setGroupScores(data.groupScores);
            } catch (error) {
                console.error("Error fetching group scores:", error);
            }
        };

        fetchGroupScores();
    }, []);

    return (
        <>
            <h2>Group Scores</h2>
            <table>
                <thead>
                    <tr>
                        <th>Group</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {groupScores.map((groupScore) => (
                        <tr key={groupScore.group}>
                            <td>{groupScore.group}</td>
                            <td>{groupScore.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

export default GroupsPage;