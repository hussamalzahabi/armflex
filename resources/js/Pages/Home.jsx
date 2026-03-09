import { Head, Link, usePage, router } from '@inertiajs/react';
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
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <Link href="/profile" className="w-full sm:w-auto">
                            <Button label="Training profile" className="w-full sm:min-w-44" />
                        </Link>
                        <Button label="Logout" severity="secondary" onClick={logout} className="w-full sm:min-w-44" />
                    </div>
                </Card>
            </main>
        </>
    );
};

export default Home;
