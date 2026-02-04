import { useState } from "react";

const HomePage: React.FC<{ userUID: string, setUserUID: (uid: string) => void }> = ({ userUID, setUserUID }) => {

    const [uid, setUid] = useState<string>(userUID);
    
    const handleOnClick = () => {
        setUserUID(uid);
    }

    const textOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUid(e.target.value);
    }
    
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
                    <input type="text" value={uid} onChange={textOnChange} name="UserUID" required/>
                </label>
            </div>

            <button onClick={handleOnClick}>
                Enregister UID
            </button>
        </>
    );
}

export default HomePage;