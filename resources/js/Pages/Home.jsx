import { Head, router } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import AppBreadcrumb from '@/Components/AppBreadcrumb';
import OnboardingChecklistCard from '@/Components/OnboardingChecklistCard';
import PersonalRecordsCard from '@/Components/PersonalRecordsCard';
import TrainingStreakCard from '@/Components/TrainingStreakCard';
import AppLayout from '@/Layouts/AppLayout';
import { useTheme } from '@/hooks/useTheme';

const Home = ({ title, onboardingChecklist, trainingStreak, personalRecordsSummary, dashboardHero }) => {
    const { isDark } = useTheme();

    const startWorkout = () => {
        const target = dashboardHero?.start_workout_target;

        if (!target) {
            router.visit('/programs');

            return;
        }

        if (target.kind === 'start_program_day') {
            router.post(
                '/workouts/start',
                {
                    program_id: target.program_id,
                    program_day_id: target.program_day_id,
                },
                {
                    preserveScroll: true,
                }
            );

            return;
        }

        router.visit(target.url);
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
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-2">
                                <p className={`mb-0 text-[11px] font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>
                                    Dashboard
                                </p>
                                <div className="space-y-1">
                                    <h2 className={`m-0 text-3xl font-semibold tracking-tight ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                                        {dashboardHero?.title ?? 'Welcome back'}
                                    </h2>
                                    <p className={`m-0 text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {dashboardHero?.subtitle ?? 'Ready for today’s training?'}
                                    </p>
                                </div>
                            </div>

                            <div className="w-full md:w-auto">
                                <Button
                                    label="Start Workout"
                                    onClick={startWorkout}
                                    className="w-full md:w-auto md:min-w-48"
                                />
                            </div>
                        </div>
                    </Card>

                    <div className="mt-3">
                        <OnboardingChecklistCard checklist={onboardingChecklist} />
                    </div>

                    <div className="mt-3">
                        <TrainingStreakCard streak={trainingStreak} />
                    </div>

                    <div className="mt-3">
                        <PersonalRecordsCard summary={personalRecordsSummary} />
                    </div>
                </div>
            </AppLayout>
        </>
    );
};

export default Home;
