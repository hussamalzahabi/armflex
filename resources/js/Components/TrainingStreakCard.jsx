import { router } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { useTheme } from '@/hooks/useTheme';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const parseDate = (value) => {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
};

const toDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const addDays = (date, amount) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + amount);

    return nextDate;
};

const startOfWeek = (date) => addDays(date, -date.getDay());

const endOfWeek = (date) => addDays(date, 6 - date.getDay());

const formatMonth = (date) =>
    date.toLocaleDateString('en-CA', {
        month: 'short',
    });

const buildWeeks = (days) => {
    if (!Array.isArray(days) || days.length === 0) {
        return [];
    }

    const firstDate = parseDate(days[0].date);
    const lastDate = parseDate(days[days.length - 1].date);
    const gridStart = startOfWeek(firstDate);
    const gridEnd = endOfWeek(lastDate);
    const activityByDate = new Map(days.map((day) => [day.date, day]));
    const weeks = [];
    let cursor = gridStart;

    while (cursor <= gridEnd) {
        const week = [];

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const dateString = toDateString(cursor);
            const activityDay = activityByDate.get(dateString);

            week.push(
                activityDay ?? {
                    date: dateString,
                    active: false,
                    workout_count: 0,
                    outsideRange: true,
                }
            );

            cursor = addDays(cursor, 1);
        }

        weeks.push(week);
    }

    return weeks;
};

const buildMonthLabels = (weeks) => {
    return weeks.map((week) => {
        const monthStartDay = week.find((day) => !day.outsideRange && parseDate(day.date).getDate() === 1);

        if (!monthStartDay) {
            return '';
        }

        return formatMonth(parseDate(monthStartDay.date));
    });
};

const TrainingStreakCard = ({ streak }) => {
    const { isDark } = useTheme();

    if (!streak) {
        return null;
    }

    const surfaceClass = isDark ? 'bg-slate-800 shadow-black/20' : 'bg-white shadow-slate-200/70';
    const titleClass = isDark ? 'text-slate-50' : 'text-slate-900';
    const subtitleClass = isDark ? 'text-slate-300' : 'text-slate-600';
    const accentClass = isDark ? 'text-emerald-200' : 'text-emerald-700';
    const weeks = buildWeeks(streak.activity_days);
    const monthLabels = buildMonthLabels(weeks);
    const yearOptions = (streak.year_options ?? []).map((year) => ({ label: String(year), value: year }));

    const squareClass = (day) => {
        if (day.outsideRange) {
            return isDark ? 'border-slate-800/40 bg-slate-900/25' : 'border-slate-100 bg-slate-50';
        }

        if (day.workout_count >= 3) {
            return isDark ? 'border-emerald-200/60 bg-emerald-300' : 'border-emerald-600 bg-emerald-500';
        }

        if (day.workout_count === 2) {
            return isDark ? 'border-emerald-300/50 bg-emerald-400/80' : 'border-emerald-500 bg-emerald-400';
        }

        if (day.workout_count === 1) {
            return isDark ? 'border-emerald-400/40 bg-emerald-500/55' : 'border-emerald-400 bg-emerald-300';
        }

        return isDark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-100';
    };

    const labelClass = isDark ? 'text-slate-400' : 'text-slate-500';

    const titleForDay = (day) => {
        if (day.outsideRange) {
            return `${day.date} — outside visible range`;
        }

        const workoutLabel =
            day.workout_count === 0
                ? '0 workouts'
                : day.workout_count === 1
                  ? '1 workout'
                  : day.workout_count === 2
                    ? '2 workouts'
                    : '3+ workouts';

        return `${day.date} — ${workoutLabel}`;
    };

    const handleYearChange = (event) => {
        router.get(
            '/',
            { streak_year: event.value },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <Card className={`w-full rounded-3xl !border-0 shadow-xl ${surfaceClass}`}>
            <div className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${accentClass}`}>Training Streak</p>
                        <h3 className={`text-2xl font-semibold tracking-tight ${titleClass}`}>Consistency at a glance</h3>
                        <p className={`max-w-2xl text-sm leading-relaxed ${subtitleClass}`}>{streak.message}</p>
                    </div>

                    <div className="w-full sm:w-40 lg:w-36">
                        <Dropdown
                            value={streak.selected_year}
                            options={yearOptions}
                            onChange={handleYearChange}
                            placeholder="Year"
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-slate-700 bg-slate-900/55' : 'border-slate-200 bg-slate-50'}`}>
                        <p className={`!m-0 text-xs font-semibold uppercase tracking-[0.14em] ${subtitleClass}`}>Current streak</p>
                        <p className={`mt-2 text-3xl font-semibold ${titleClass}`}>{streak.current_streak}</p>
                        <p className={`!m-0 text-sm ${subtitleClass}`}>days</p>
                    </div>
                    <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-slate-700 bg-slate-900/55' : 'border-slate-200 bg-slate-50'}`}>
                        <p className={`!m-0 text-xs font-semibold uppercase tracking-[0.14em] ${subtitleClass}`}>Longest streak</p>
                        <p className={`mt-2 text-3xl font-semibold ${titleClass}`}>{streak.longest_streak}</p>
                        <p className={`!m-0 text-sm ${subtitleClass}`}>days</p>
                    </div>
                </div>

                <div className="space-y-5 pb-3">
                    <p className={`!m-0 text-xs font-semibold uppercase tracking-[0.14em] ${subtitleClass}`}>
                        Activity in {streak.selected_year}
                    </p>
                    <div className="overflow-x-auto pt-1 pb-2">
                        <div className="min-w-fit" aria-label="Training activity grid">
                            <div className="mb-4 ml-10 flex gap-1.5">
                                {monthLabels.map((label, monthIndex) => (
                                    <div key={`month-${monthIndex}`} className={`w-5 text-xs font-medium ${labelClass}`}>
                                        {label}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className="grid grid-rows-7 gap-1.5 pt-0.5">
                                    {WEEKDAY_LABELS.map((label) => (
                                        <div key={label} className={`flex h-5 items-center text-xs font-medium ${labelClass}`}>
                                            {label}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-1.5">
                                    {weeks.map((week, weekIndex) => (
                                        <div key={`week-${weekIndex}`} className="grid grid-rows-7 gap-1.5">
                                            {week.map((day) => (
                                                <div
                                                    key={day.date}
                                                    className={`h-5 w-5 rounded-[5px] border ${squareClass(day)}`}
                                                    title={titleForDay(day)}
                                                    aria-label={`${day.date} ${day.active ? 'active' : 'inactive'}`}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default TrainingStreakCard;
