import { getUserWithUsername, postToJSON, firestore } from '../../lib/firebase';
import { query, collection, where, getDocs, limit, orderBy, getFirestore } from 'firebase/firestore';
import UserProfile from '../../components/UserProfile'
import Metatags from '../../components/Metatags'
import PostFeed from '../../components/PostFeed'

export async function getServerSideProps({ query: urlQuery })
{
    const { username } = urlQuery;

    const userDoc = await getUserWithUsername(username);


    if (!userDoc)
    {
        return {
            notFound: true,
        };
    }


    let user = null;
    let posts = null;

    if (userDoc)
    {
        user = userDoc.data();

        const postsQuery = query(
            collection(getFirestore(), userDoc.ref.path, 'posts'),
            where('published', '==', true),
            orderBy('createdAt', 'desc'),
            limit(5)
        );

        posts = (await getDocs(postsQuery)).docs.map(postToJSON);
    }

    return {
        props: { user, posts },
    };
}


export default function UserProfilePage({ user, posts })
{
    return (
        <main>
            <Metatags title={user.username} description={`${user.username}'s public profile`} />
            <UserProfile user={user} />
            <PostFeed posts={posts} />
        </main>
    )
}