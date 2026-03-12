import React, { useState, useEffect } from "react";
import "./StudentInfoPage.css";
import type { Student, StudentResponse } from "../types";
import { getStudent, getStudentNames } from "../API/api";
import { useAuth } from "../Auth";

type StudentBasic = {
    name: string;
    group: string;
};

// Represents a loaded student with full details
type StudentDetailsData = {
    student: Student;
    groupRevealsCount: number;
};

const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString();
};

const StudentInfoPage: React.FC = () => {
    const { uid: ourUid } = useAuth();
    const [filterText, setFilterText] = useState("");
    const [studentList, setStudentList] = useState<StudentBasic[]>([]);

    // Cache for loaded student details
    const [studentDetailsCache, setStudentDetailsCache] = useState<Record<string, StudentDetailsData>>({});
    const [selectedName, setSelectedName] = useState<string | null>(null);

    const [loadingList, setLoadingList] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchList = async () => {
            if (!ourUid) return;
            setLoadingList(true);
            setError(null);
            try {
                const data = await getStudentNames(ourUid);
                if (data.ok && data.students) {
                    setStudentList(data.students);
                } else {
                    setError("Failed to load students list.");
                }
            } catch {
                setError("Error fetching students list.");
            } finally {
                setLoadingList(false);
            }
        };

        fetchList();
    }, [ourUid]);

    // 2. Fetch details when a student is clicked
    const handleSelectStudent = async (student: StudentBasic) => {
        if (!ourUid) return;

        setSelectedName(student.name);

        // If already cached, no need to fetch
        if (studentDetailsCache[student.name]) return;

        setLoadingDetails(true);
        setError(null);

        try {
            const data: StudentResponse = await getStudent(ourUid, student.name);
            if (data.ok && data.student) {
                setStudentDetailsCache((prev) => ({
                    ...prev,
                    [student.name]: {
                        student: data.student,
                        groupRevealsCount: data.groupRevealsCount
                    }
                }));
            } else {
                setError(`Failed to load details for ${student.name}.`);
            }
        } catch {
            setError(`Error fetching details for ${student.name}.`);
        } finally {
            setLoadingDetails(false);
        }
    };

    const filteredStudents = studentList.filter((s) =>
        s.name.toLowerCase().includes(filterText.toLowerCase())
    );

    const selectedDetails = selectedName ? studentDetailsCache[selectedName] : null;

    return (
        <div className="container students-container">
            <div className="page-header">
                <h1 className="text-gradient">Student Details</h1>
                <p>Browse the list of students and view their progress</p>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <div className="student-filter">
                <input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Search by student name..."
                />
            </div>

            {loadingList && <div className="loading-spinner">Loading students...</div>}

            {!loadingList && studentList.length === 0 && (
                <div className="empty-state">
                    <p>No students found.</p>
                </div>
            )}

            {filteredStudents.length > 0 && (
                <div className="student-list" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '2rem' }}>
                    {filteredStudents.map((student) => {
                        const isSelected = selectedName === student.name;
                        // Determine status if details are cached
                        const cached = studentDetailsCache[student.name];

                        return (
                            <div
                                key={student.name}
                                className={`hover-card ${isSelected ? " active" : ""}`}
                                onClick={() => handleSelectStudent(student)}
                            >
                                <div className="student-card-info">
                                    <div className="student-card-name">{student.name}</div>
                                    <div className="student-card-meta">
                                        {cached ? (
                                            <>
                                                <span>{cached.student.attempts} attempts</span>
                                                <span>{cached.student.correctPlaced} correct</span>
                                            </>
                                        ) : (
                                            <span>Click to load stats</span>
                                        )}
                                    </div>
                                </div>
                                <span className="badge badge-purple">Group {student.group}</span>
                                {cached?.student.banished && (
                                    <span className="badge badge-error">Banished</span>
                                )}
                                {cached && !cached.student.banished && (
                                    <span className="badge badge-success">Active</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detail Panel */}
            {loadingDetails && (
                <div className="loading-spinner">Loading student details...</div>
            )}

            {!loadingDetails && selectedDetails && (
                <div className="student-detail glass-panel">
                    <div className="student-detail-header">
                        <h2 className="text-gradient">{selectedDetails.student.name}</h2>
                        <span className="badge badge-purple">Group {selectedDetails.student.group}</span>
                        {selectedDetails.student.banished ? (
                            <span className="badge badge-error">Banished</span>
                        ) : (
                            <span className="badge badge-success">Active</span>
                        )}
                    </div>

                    <div className="detail-stats">
                        <div className="stat-card">
                            <div className="stat-value">{selectedDetails.student.correctPlaced}</div>
                            <div className="stat-label">Correct Placed</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{selectedDetails.student.attempts}</div>
                            <div className="stat-label">Attempts</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{selectedDetails.groupRevealsCount}</div>
                            <div className="stat-label">Group Reveals</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{selectedDetails.student.reveals.length}</div>
                            <div className="stat-label">Personal Reveals</div>
                        </div>
                    </div>

                    <div className="timestamps">
                        <span><strong>Last Attempt:</strong> {formatDate(selectedDetails.student.lastAttemptAt)}</span>
                        <span><strong>Created:</strong> {formatDate(selectedDetails.student.createdAt)}</span>
                        <span><strong>Updated:</strong> {formatDate(selectedDetails.student.updatedAt)}</span>
                        {selectedDetails.student.banished && (
                            <span><strong>Banished At:</strong> {formatDate(selectedDetails.student.banishedAt)}</span>
                        )}
                    </div>

                    {/* Reveals */}
                    {selectedDetails.student.reveals.length > 0 && (
                        <div className="reveals-section">
                            <h3>Reveals ({selectedDetails.student.reveals.length})</h3>
                            <div className="reveals-grid">
                                {selectedDetails.student.reveals.map((reveal, i) => (
                                    <div className="reveal-card" key={i}>
                                        <div className="reveal-cell-pos">
                                            Puzzle {reveal.cell.puzzleId} — Cell [{reveal.cell.l}, {reveal.cell.c}]
                                        </div>
                                        <div className="reveal-sound">
                                            🎵 {reveal.cell.sound.name} ({reveal.cell.sound.instrument})
                                        </div>
                                        <div className="reveal-date">{formatDate(reveal.createdAt)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedDetails.student.reveals.length === 0 && (
                        <p style={{ color: 'var(--text-muted)' }}>No reveals yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentInfoPage;
