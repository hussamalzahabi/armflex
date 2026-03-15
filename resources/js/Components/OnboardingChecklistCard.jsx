import { Link } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { useTheme } from '@/hooks/useTheme';

const OnboardingChecklistCard = ({ checklist, className = '' }) => {
    const { isDark } = useTheme();

    if (!checklist) {
        return null;
    }

    const surfaceClass = isDark ? 'bg-slate-800 shadow-black/20' : 'bg-white shadow-slate-200/70';
    const titleClass = isDark ? 'text-slate-50' : 'text-slate-900';
    const subtitleClass = isDark ? 'text-slate-300' : 'text-slate-600';
    const progressClass = isDark ? 'text-indigo-200' : 'text-indigo-700';

    if (checklist.all_completed) {
        return (
            <Card className={`w-full rounded-3xl !border-0 shadow-xl ${surfaceClass} ${className}`}>
                <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${progressClass}`}>Onboarding Complete</p>
                            <h3 className={`text-2xl font-semibold tracking-tight ${titleClass}`}>You&apos;re ready to train</h3>
                            <p className={`max-w-2xl text-sm leading-relaxed ${subtitleClass}`}>
                                Your training system is fully set up. Start your next workout or generate a new program anytime.
                            </p>
                        </div>
                        <p className={`text-sm font-semibold ${progressClass}`}>
                            Progress: {checklist.completed_count} / {checklist.total_count} steps completed
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/programs"
                            className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium no-underline ${
                                isDark ? 'bg-slate-700 text-slate-50 hover:bg-slate-600' : 'bg-slate-900 text-white hover:bg-slate-700'
                            }`}
                        >
                            Start workout
                        </Link>
                        <Link
                            href="/programs"
                            className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium no-underline ${
                                isDark ? 'bg-slate-900 text-slate-50 hover:bg-slate-800' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                            }`}
                        >
                            View programs
                        </Link>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className={`w-full rounded-3xl !border-0 shadow-xl ${surfaceClass} ${className}`}>
            <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${progressClass}`}>Getting Started</p>
                        <h3 className={`text-2xl font-semibold tracking-tight ${titleClass}`}>Get started with your training</h3>
                        <p className={`max-w-2xl text-sm leading-relaxed ${subtitleClass}`}>
                            Follow these steps to set up your training system and start logging workouts.
                        </p>
                    </div>
                    <p className={`text-sm font-semibold ${progressClass}`}>
                        Progress: {checklist.completed_count} / {checklist.total_count} steps completed
                    </p>
                </div>

                <div className="space-y-3">
                    {checklist.items.map((item, index) => (
                        <div
                            key={item.key}
                            className={`flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                                isDark ? 'border-slate-700 bg-slate-900/55' : 'border-slate-200 bg-slate-50'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <span
                                    className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                                        item.completed
                                            ? isDark
                                                ? 'bg-emerald-500/20 text-emerald-200'
                                                : 'bg-emerald-100 text-emerald-700'
                                            : isDark
                                              ? 'bg-slate-700 text-slate-200'
                                              : 'bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    {item.completed ? '✓' : index + 1}
                                </span>
                                <div className="space-y-1">
                                    <p className={`!m-0 text-sm font-medium ${titleClass}`}>{item.label}</p>
                                    <p className={`!m-0 text-xs leading-relaxed ${subtitleClass}`}>
                                        {item.completed ? `✓ ${item.completed_label}` : item.description}
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={item.action_url}
                                className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium no-underline ${
                                    item.completed
                                        ? isDark
                                            ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        : isDark
                                          ? 'bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
                                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                }`}
                            >
                                {item.completed ? 'Open' : item.action_label}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default OnboardingChecklistCard;
