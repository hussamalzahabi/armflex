import { Head, router } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import OnboardingChecklistCard from '@/Components/OnboardingChecklistCard';
import PersonalRecordsCard from '@/Components/PersonalRecordsCard';
import TrainingAnalyticsCard from '@/Components/TrainingAnalyticsCard';
import TrainingStreakCard from '@/Components/TrainingStreakCard';
import AppLayout from '@/Layouts/AppLayout';
import { useTheme } from '@/hooks/useTheme';

const Home = ({ title, onboardingChecklist, trainingStreak, dashboardAnalytics, personalRecordsSummary, dashboardHero }) => {
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
    const dashboardCards = [
        onboardingChecklist
            ? {
                  key: 'onboarding',
                  render: (className) => <OnboardingChecklistCard checklist={onboardingChecklist} className={className} />,
              }
            : null,
        trainingStreak
            ? {
                  key: 'streak',
                  render: (className) => <TrainingStreakCard streak={trainingStreak} className={className} />,
              }
            : null,
        dashboardAnalytics
            ? {
                  key: 'analytics',
                  render: (className) => <TrainingAnalyticsCard analytics={dashboardAnalytics} className={className} />,
              }
            : null,
        personalRecordsSummary
            ? {
                  key: 'records',
                  render: (className) => <PersonalRecordsCard summary={personalRecordsSummary} className={className} />,
              }
            : null,
    ].filter(Boolean);

    return (
        <>
            <Head title={title} />
            <AppLayout title="Dashboard" breadcrumb={dashboardBreadcrumb}>
                <div className="w-full lg:max-w-[1240px] lg:mr-auto">
                    <Card
                        className={`w-full !rounded-3xl !border-0 shadow-xl ${
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

                    {dashboardCards.map((card) => (
                        <div key={card.key} className="mt-3">
                            {card.render('')}
                        </div>
                    ))}
                </div>
            </AppLayout>
        </>
    );
};

export default Home;
