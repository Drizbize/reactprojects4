import { useEffect, useState } from "react";
import { useAuth } from "../Auth";

const HomePage: React.FC = () => {
    const [localUid, setLocalUid] = useState<string>("");
    const {uid, authUid} = useAuth();

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
        <>
            <h1>
                Bienvenu au jeu Audio Puzzle
            </h1>
            <p>
                Le but: decouvrir les sons caches dans un puzzle...
            </p>

            <div>
                <label>
                    Votre UID:
                    <input type="text" value={localUid} onChange={textOnChange} required/>
                </label>
            </div>

            <button onClick={handleOnClick}>
                Enregister UID
            </button>
        </>
    );
}

export default HomePage;