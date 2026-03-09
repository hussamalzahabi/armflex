import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import AppLayout from '@/Layouts/AppLayout';
import { useTheme } from '@/hooks/useTheme';

const Home = ({ title }) => {
    const { auth } = usePage().props;
    const { isDark } = useTheme();

    const logout = () => {
        router.post('/logout');
    };

    return (
        <>
            <Head title={title} />
            <AppLayout title="Dashboard">
                <Card
                    className={`w-full rounded-3xl shadow-xl ${
                        isDark
                            ? 'border border-slate-700 bg-slate-800 shadow-black/20'
                            : 'border border-slate-200 bg-white shadow-slate-200/70'
                    }`}
                >
                    <p>
                        You are signed in as <span className="font-semibold">{auth.user.name}</span> ({auth.user.email}).
                    </p>
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <Link href="/profile" className="w-full sm:w-auto">
                            <Button label="Training profile" className="w-full sm:min-w-44" />
                        </Link>
                        <Button label="Logout" severity="secondary" onClick={logout} className="w-full sm:min-w-44" />
                    </div>
                </Card>
            </AppLayout>
        </>
    );
};

export default Home;
