import React, { useState, useEffect } from "react";
import "./GroupsPage.css";
import type { GroupScore } from "../types";
import { useAuth } from "../Auth";
import { getGroupScores } from "../API/api";

const GroupsPage: React.FC = () => {
    const { uid } = useAuth();
    const [groupScores, setGroupScores] = useState<GroupScore[]>([]);

    useEffect(() => {
        const fetchGroupScores = async (userId: string) => {
            try {
                const revealedPieces = await getGroupScores(userId);
                setGroupScores(revealedPieces);
            } catch (error) {
                // Error already logged in API
            }
        };

        if (uid)
            fetchGroupScores(uid);
    }, [uid]);

    return (
        <div className="container groups-container">
            <div className="page-header">
                <h1 className="text-gradient">Leaderboard</h1>
                <p>View the number of sounds found by each group</p>
            </div>

            <div className="groups-panel">
                {groupScores.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Group</th>
                                <th>Score (Revealed Sounds)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupScores.map((groupScore) => (
                                <tr key={groupScore.group}>
                                    <td style={{ fontWeight: '600' }}>Group {groupScore.group}</td>
                                    <td>
                                        <span className="badge badge-purple">{groupScore.count}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex-center" style={{ padding: '2rem' }}>
                        <p className="text-muted">Loading scores...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GroupsPage;