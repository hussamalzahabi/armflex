import { Head, Link } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import AppBreadcrumb from '@/Components/AppBreadcrumb';
import AppLayout from '@/Layouts/AppLayout';
import { useTheme } from '@/hooks/useTheme';

const humanizeSlug = (value) => {
    if (!value) {
        return '-';
    }

    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const formatDate = (isoValue) => {
    if (!isoValue) {
        return '-';
    }

    return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(isoValue));
};

const WorkoutsIndex = ({ workouts = [] }) => {
    const { isDark } = useTheme();
    const activeWorkouts = workouts.filter((workout) => !workout.is_completed);
    const completedWorkouts = workouts.filter((workout) => workout.is_completed);
    const breadcrumbItems = [{ label: 'Dashboard', href: '/' }, { label: 'Workouts' }];
    const pageSurfaceClass = isDark ? 'programs-surface-dark' : 'programs-surface-light';
    const headlineClass = isDark ? 'text-slate-100' : 'text-slate-900';
    const subtitleClass = isDark ? 'text-slate-300' : 'text-slate-600';
    const mobileCardClass = isDark ? 'border border-slate-700 bg-slate-900/45' : 'border border-slate-200 bg-slate-50';

    const statusBody = (rowData) => (
        <Tag
            value={rowData.is_completed ? 'Completed' : 'In progress'}
            className={`!border-0 !text-xs !font-semibold ${
                rowData.is_completed
                    ? isDark
                        ? '!bg-emerald-500/25 !text-emerald-100'
                        : '!bg-emerald-100 !text-emerald-700'
                    : isDark
                      ? '!bg-amber-500/25 !text-amber-100'
                      : '!bg-amber-100 !text-amber-700'
            }`}
            rounded
        />
    );

    const actionBody = (rowData) => (
        <Link
            href={`/workouts/${rowData.id}`}
            className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium no-underline ${
                isDark ? 'bg-slate-700 text-slate-50 hover:bg-slate-600' : 'bg-slate-900 text-white hover:bg-slate-700'
            }`}
        >
            {rowData.is_completed ? 'Review' : 'Continue'}
        </Link>
    );

    return (
        <>
            <Head title="Workouts" />
            <AppLayout title="Workouts">
                <div className="w-full lg:max-w-[1240px] lg:mr-auto">
                    <AppBreadcrumb items={breadcrumbItems} />

                    <Card className={`!rounded-t-none !rounded-b-none !border-0 ${pageSurfaceClass}`}>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-2">
                                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-indigo-200' : 'text-indigo-700'}`}>
                                    Workout History
                                </p>
                                <h3 className={`text-2xl font-semibold tracking-tight ${headlineClass}`}>Review completed sessions and continue open ones</h3>
                                <p className={`max-w-2xl text-sm ${subtitleClass}`}>
                                    Workouts are your real performance data. Programs stay as templates, while each session records what you actually did.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Chip label={`Total: ${workouts.length}`} className={isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'} />
                                <Chip label={`In progress: ${activeWorkouts.length}`} className={isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'} />
                                <Chip label={`Completed: ${completedWorkouts.length}`} className={isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'} />
                            </div>
                        </div>
                    </Card>

                    <Card className={`program-history-card mt-2 !rounded-t-none !border-0 ${pageSurfaceClass}`}>
                        {workouts.length === 0 ? (
                            <Message severity="info" text="No workouts yet. Start one from your Programs page." className="w-full" />
                        ) : (
                            <>
                                <div className="hidden md:block">
                                    <DataTable value={workouts} dataKey="id" rows={8} paginator className="programs-table">
                                        <Column field="program.name" header="Program" />
                                        <Column
                                            header="Day"
                                            body={(rowData) => <span className="font-medium">Day {rowData.day_number}</span>}
                                            style={{ width: '8rem' }}
                                        />
                                        <Column
                                            header="Status"
                                            body={statusBody}
                                            style={{ width: '10rem' }}
                                        />
                                        <Column
                                            header="Started"
                                            body={(rowData) => <span>{formatDate(rowData.started_at)}</span>}
                                        />
                                        <Column
                                            header="Volume"
                                            body={(rowData) => (
                                                <span>
                                                    {rowData.exercise_count} exercises / {rowData.set_count} sets
                                                </span>
                                            )}
                                        />
                                        <Column
                                            header="Action"
                                            body={actionBody}
                                            style={{ width: '9rem' }}
                                        />
                                    </DataTable>
                                </div>

                                <div className="space-y-3 md:hidden">
                                    {workouts.map((workout) => (
                                        <article key={workout.id} className={`rounded-2xl p-4 shadow-sm ${mobileCardClass}`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${subtitleClass}`}>Workout</p>
                                                    <h4 className="mt-1 text-lg font-semibold">{workout.program.name}</h4>
                                                    <p className={`mt-1 text-sm ${subtitleClass}`}>Day {workout.day_number} • {formatDate(workout.started_at)}</p>
                                                </div>
                                                {statusBody(workout)}
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <Chip label={`${humanizeSlug(workout.program.style)} style`} className={isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'} />
                                                <Chip label={`${workout.exercise_count} exercises`} className={isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'} />
                                                <Chip label={`${workout.set_count} sets`} className={isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'} />
                                            </div>

                                            <div className="mt-4">{actionBody(workout)}</div>
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            </AppLayout>
        </>
    );
};

export default WorkoutsIndex;
