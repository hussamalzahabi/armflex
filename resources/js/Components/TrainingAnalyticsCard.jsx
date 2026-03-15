import { Card } from 'primereact/card';
import { useTheme } from '@/hooks/useTheme';

const formatDate = (isoValue) => {
    if (!isoValue) {
        return '';
    }

    return new Intl.DateTimeFormat('en-CA', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(isoValue));
};

const summaryCards = [
    {
        key: 'workouts_completed',
        label: 'Workouts Completed',
        description: 'Total finished sessions',
    },
    {
        key: 'sets_logged',
        label: 'Total Sets',
        description: 'Logged sets across completed workouts',
    },
    {
        key: 'exercises_logged',
        label: 'Exercises Logged',
        description: 'Exercise entries with recorded results',
    },
    {
        key: 'personal_records',
        label: 'Personal Records',
        description: 'Tracked best performances',
    },
];

const TrainingAnalyticsCard = ({ analytics, className = '' }) => {
    const { isDark } = useTheme();

    if (!analytics) {
        return null;
    }

    const surfaceClass = isDark ? 'bg-slate-800 shadow-black/20' : 'bg-white shadow-slate-200/70';
    const titleClass = isDark ? 'text-slate-50' : 'text-slate-900';
    const subtitleClass = isDark ? 'text-slate-300' : 'text-slate-600';
    const accentClass = isDark ? 'text-sky-200' : 'text-sky-700';

    return (
        <Card className={`w-full rounded-3xl !border-0 shadow-xl ${surfaceClass} ${className}`}>
            <div className="space-y-5">
                <div className="space-y-1">
                    <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${accentClass}`}>Training Analytics</p>
                    <h3 className={`text-2xl font-semibold tracking-tight ${titleClass}`}>Your training activity at a glance</h3>
                    <p className={`max-w-2xl text-sm leading-relaxed ${subtitleClass}`}>
                        Simple counts and activity patterns from your completed workouts.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <div
                            key={card.key}
                            className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-slate-700 bg-slate-900/55' : 'border-slate-200 bg-slate-50'}`}
                        >
                            <p className={`!m-0 text-xs font-semibold uppercase tracking-[0.14em] ${subtitleClass}`}>{card.label}</p>
                            <p className={`mt-2 text-3xl font-semibold ${titleClass}`}>{analytics.totals[card.key]}</p>
                            <p className={`!m-0 text-sm ${subtitleClass}`}>{card.description}</p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,260px),minmax(0,1fr),minmax(0,320px)]">
                    <div className={`rounded-2xl border px-4 py-4 ${isDark ? 'border-slate-700 bg-slate-900/55' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <p className={`!m-0 text-xs font-semibold uppercase tracking-[0.14em] ${subtitleClass}`}>This Week</p>
                                <p className={`!m-0 text-sm ${subtitleClass}`}>{analytics.this_week.week_label}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <span className={`text-sm ${subtitleClass}`}>Workouts</span>
                                    <span className={`text-lg font-semibold ${titleClass}`}>{analytics.this_week.workouts_completed}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className={`text-sm ${subtitleClass}`}>Sets</span>
                                    <span className={`text-lg font-semibold ${titleClass}`}>{analytics.this_week.sets_logged}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-2xl border px-4 py-4 ${isDark ? 'border-slate-700 bg-slate-900/55' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="space-y-3">
                            <p className={`!m-0 text-xs font-semibold uppercase tracking-[0.14em] ${subtitleClass}`}>Category Distribution</p>

                            {analytics.category_distribution.length === 0 ? (
                                <p className={`!m-0 text-sm leading-relaxed ${subtitleClass}`}>
                                    Complete workouts with logged results to see where your training volume is landing.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {analytics.category_distribution.map((category) => (
                                        <div key={category.name} className="space-y-1.5">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className={`text-sm font-medium ${titleClass}`}>{category.name}</span>
                                                <span className={`text-sm ${subtitleClass}`}>{category.count}</span>
                                            </div>
                                            <div className={`h-2.5 overflow-hidden rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                                <div
                                                    className={`h-full rounded-full ${isDark ? 'bg-sky-300' : 'bg-sky-500'}`}
                                                    style={{ width: `${category.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`rounded-2xl border px-4 py-4 ${isDark ? 'border-slate-700 bg-slate-900/55' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="space-y-3">
                            <p className={`!m-0 text-xs font-semibold uppercase tracking-[0.14em] ${subtitleClass}`}>Recent Activity</p>

                            {analytics.recent_workout ? (
                                <div className="space-y-1">
                                    <p className={`!m-0 text-sm ${subtitleClass}`}>Last Workout</p>
                                    <p className={`!m-0 text-lg font-semibold ${titleClass}`}>{formatDate(analytics.recent_workout.completed_at)}</p>
                                    <p className={`!m-0 text-sm font-medium ${titleClass}`}>{analytics.recent_workout.subtitle}</p>
                                </div>
                            ) : (
                                <p className={`!m-0 text-sm leading-relaxed ${subtitleClass}`}>
                                    No workouts completed yet.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default TrainingAnalyticsCard;
