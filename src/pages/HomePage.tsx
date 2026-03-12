import { useEffect, useState } from "react";
import { useAuth } from "../Auth";
import "./HomePage.css";

const HomePage: React.FC = () => {
    const [localUid, setLocalUid] = useState<string>("");
    const { uid, authUid } = useAuth();

    useEffect(() => {
        if (uid !== null) {
            setLocalUid(uid);
        }
    }, [uid]);

    const textOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalUid(e.target.value);
    }

    const handleOnClick = () => {
        console.log(localUid);
        authUid(localUid);
    };

    return (
        <div className="container home-page">
            <div className="page-header">
                <h1 className="text-gradient">
                    Bienvenue au jeu Audio Puzzle
                </h1>
                <p>
                    Le but : découvrir les sons cachés dans un puzzle.
                </p>
            </div>

            <div className="glass-panel auth-form">
                <div className="input-group">
                    <label>Votre UID:</label>
                    <input
                        type="text"
                        value={localUid}
                        onChange={textOnChange}
                        placeholder="Entrez votre identifiant..."
                        required
                    />
                </div>

                <button className="btn-primary" onClick={handleOnClick}>
                    Enregistrer UID
                </button>
            </div>
        </div>
    );
}

export default HomePage;