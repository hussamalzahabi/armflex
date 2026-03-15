import { Card } from 'primereact/card';
import { useTheme } from '@/hooks/useTheme';

const formatDate = (isoValue) => {
    if (!isoValue) {
        return '-';
    }

    return new Intl.DateTimeFormat('en-CA', {
        month: 'short',
        day: 'numeric',
    }).format(new Date(isoValue));
};

const PersonalRecordsCard = ({ summary }) => {
    const { isDark } = useTheme();

    if (!summary) {
        return null;
    }

    const surfaceClass = isDark ? 'bg-slate-800 shadow-black/20' : 'bg-white shadow-slate-200/70';
    const titleClass = isDark ? 'text-slate-50' : 'text-slate-900';
    const subtitleClass = isDark ? 'text-slate-300' : 'text-slate-600';
    const accentClass = isDark ? 'text-amber-200' : 'text-amber-700';
    const detailLabel = (record) => (record.record_type === 'duration' ? 'Best hold' : 'Best lift');

    return (
        <Card className={`w-full rounded-3xl !border-0 shadow-xl ${surfaceClass}`}>
            <div className="space-y-4">
                <div className="space-y-1">
                    <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${accentClass}`}>Personal Records</p>
                    <h3 className={`text-2xl font-semibold tracking-tight ${titleClass}`}>Your best lifts so far</h3>
                    <p className={`max-w-2xl text-sm leading-relaxed ${subtitleClass}`}>{summary.message}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,220px),1fr]">
                    <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-slate-700 bg-slate-900/55' : 'border-slate-200 bg-slate-50'}`}>
                        <p className={`!m-0 text-xs font-semibold uppercase tracking-[0.14em] ${subtitleClass}`}>Total records</p>
                        <p className={`mt-2 text-3xl font-semibold ${titleClass}`}>{summary.total_count}</p>
                        <p className={`!m-0 text-sm ${subtitleClass}`}>tracked exercises</p>
                    </div>

                    <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-slate-700 bg-slate-900/55' : 'border-slate-200 bg-slate-50'}`}>
                        {summary.latest_records.length === 0 ? (
                            <p className={`!m-0 text-sm leading-relaxed ${subtitleClass}`}>
                                Finish a workout with logged results to set your first record.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                <p className={`!m-0 text-xs font-semibold uppercase tracking-[0.14em] ${subtitleClass}`}>Latest records</p>
                                <div className="mt-3 space-y-2">
                                    {summary.latest_records.map((record) => (
                                        <div
                                            key={record.id}
                                            className={`flex flex-col gap-3 rounded-xl px-4 py-3 sm:flex-row sm:items-start sm:justify-between ${
                                                isDark ? 'bg-slate-900/70' : 'bg-white'
                                            }`}
                                        >
                                            <div className="space-y-1.5">
                                                <p className={`!m-0 text-sm font-semibold ${titleClass}`}>{record.exercise_name}</p>
                                                <div className="space-y-0.5">
                                                    <p className={`!m-0 text-xs font-medium uppercase tracking-[0.12em] ${subtitleClass}`}>
                                                        {detailLabel(record)}
                                                    </p>
                                                    <p className={`!m-0 text-sm ${subtitleClass}`}>{record.value_label}</p>
                                                </div>
                                            </div>
                                            <p className={`!m-0 text-xs font-medium ${subtitleClass}`}>Set on {formatDate(record.achieved_at)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default PersonalRecordsCard;
