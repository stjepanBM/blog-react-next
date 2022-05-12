import { auth, googleAuthProvider } from "../lib/firebase";
import { doc, writeBatch, getDoc, getFirestore } from 'firebase/firestore';
import { signInWithPopup, signInAnonymously, signOut } from 'firebase/auth'
import { UserContext } from "../lib/context";
import Metatags from "../components/Metatags";

import { useContext, useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';

export default function Enter(props)
{
    const { user, username } = useContext(UserContext);

    return (
        <main>
            <Metatags title="Enter" description="Sign up for this app!" />
            {user ?
                !username ? <UsernameForm /> : <SignOutButton />
                : <SignInButton />
            }
        </main>
    );
}

function SignInButton()
{
    const signInWithGoogle = async () =>
    {
        await signInWithPopup(auth, googleAuthProvider)
    };

    return (
        <>
            <button className="btn-google" onClick={signInWithGoogle}>
                <img src={'/google.png'} width="30px" /> Sign in with Google
            </button>
            <button onClick={() => signInAnonymously(auth)}>
                Sign in Anonymously
            </button>
        </>
    );
}

function SignOutButton()
{
    return <button onClick={() => signOut(auth)}>Sign Out</button>;
}

function UsernameForm()
{
    const [formValue, setFormValue] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user, username } = useContext(UserContext);


    const onSubmit = async (e) =>
    {
        e.preventDefault();

        const userDoc = doc(getFirestore(), 'users', user.uid);
        const usernameDoc = doc(getFirestore(), 'usernames', formValue);

        // Commit both docs together as a batch write.
        const batch = writeBatch(getFirestore());
        batch.set(userDoc, { username: formValue, photoURL: user.photoURL, displayName: user.displayName });
        batch.set(usernameDoc, { uid: user.uid });

        await batch.commit();
    }

    const onChange = (e) =>
    {
        const val = e.target.value.toLowerCase();
        const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

        if (val.length < 3)
        {
            setFormValue(val);
            setLoading(false);
            setIsValid(false);
        }

        if (re.test(val))
        {
            setFormValue(val);
            setLoading(true);
            setIsValid(false);
        }
    };

    useEffect(() =>
    {
        checkUsername(formValue);
    }, [formValue]);

    const checkUsername = useCallback(
        debounce(async (username) =>
        {
            if (username.length >= 3)
            {
                const ref = doc(getFirestore(), 'usernames', username);
                const snap = await getDoc(ref);
                console.log('Firestore read executed!', snap.exists());
                setIsValid(!snap.exists());
                setLoading(false);
            }
        }, 500),
        []
    );


    return (
        !username && (
            <section>
                <h3>Choose username</h3>

                <form onSubmit={onSubmit}>

                    <input name="username" placeholder="username" value={formValue} onChange={onChange} />
                    <UsernameMessage username={formValue} isValid={isValid} loading={loading} />
                    <button type="submit" className="btn-green" disabled={!isValid}>
                        Choose
                    </button>

                    <h3>Debug State</h3>
                    <div>
                        Username: {formValue}
                        <br />
                        Loading: {loading.toString()}
                        <br />
                        Username Valid: {isValid.toString()}
                    </div>
                </form>

            </section>
        )
    );
}

function UsernameMessage({ username, isValid, loading })
{
    if (loading)
    {
        return <p>Checking...</p>;
    } else if (isValid)
    {
        return <p className="text-success">{username} is available!</p>;
    } else if (username && !isValid)
    {
        return <p className="text-danger">That username is taken!</p>;
    } else
    {
        return <p></p>;
    }
}