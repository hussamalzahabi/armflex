import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import AppBreadcrumb from '@/Components/AppBreadcrumb';
import OnboardingChecklistCard from '@/Components/OnboardingChecklistCard';
import AppLayout from '@/Layouts/AppLayout';
import { useTheme } from '@/hooks/useTheme';

const Home = ({ title, onboardingChecklist }) => {
    const { auth } = usePage().props;
    const { isDark } = useTheme();

    const logout = () => {
        router.post('/logout');
    };
    const dashboardBreadcrumb = [{ label: 'Dashboard' }];

    return (
        <>
            <Head title={title} />
            <AppLayout title="Dashboard">
                <div className="w-full lg:max-w-[1240px] lg:mr-auto">
                    <AppBreadcrumb items={dashboardBreadcrumb} />
                    <Card
                        className={`w-full rounded-b-3xl !rounded-t-none !border-0 shadow-xl ${
                            isDark
                                ? 'bg-slate-800 shadow-black/20'
                                : 'bg-white shadow-slate-200/70'
                        }`}
                    >
                        <p>
                            You are signed in as <span className="font-semibold">{auth.user.name}</span> ({auth.user.email}).
                        </p>
                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            <Link href="/programs" className="w-full sm:w-auto">
                                <Button label="Program Studio" className="w-full sm:w-auto sm:min-w-44" />
                            </Link>
                            <Link href="/profile" className="w-full sm:w-auto">
                                <Button label="Training profile" className="w-full sm:w-auto sm:min-w-44" />
                            </Link>
                            <Button label="Logout" severity="secondary" onClick={logout} className="w-full sm:w-auto sm:min-w-44" />
                        </div>
                    </Card>

                    <div className="mt-3">
                        <OnboardingChecklistCard checklist={onboardingChecklist} />
                    </div>
                </div>
            </AppLayout>
        </>
    );
};

export default Home;
