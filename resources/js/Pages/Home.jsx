import { Head, usePage, router } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

const Home = ({ title }) => {
    const { auth } = usePage().props;

    const logout = () => {
        router.post('/logout');
    };

    return (
        <>
            <Head title={title} />
            <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
                <Card title="Dashboard" className="w-full max-w-xl">
                    <p className="text-slate-700">
                        You are signed in as <span className="font-semibold">{auth.user.name}</span> ({auth.user.email}).
                    </p>
                    <Button label="Logout" severity="secondary" className="mt-5" onClick={logout} />
                </Card>
            </main>
        </>
    );
};

export default Home;
