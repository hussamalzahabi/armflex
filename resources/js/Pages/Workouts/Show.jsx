import axios from 'axios';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
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

const WorkoutsShow = ({ workout }) => {
    const { isDark } = useTheme();
    const toast = useRef(null);
    const finishHelpOverlay = useRef(null);
    const [exerciseRows, setExerciseRows] = useState(workout.exercises);
    const [savingSetIds, setSavingSetIds] = useState([]);
    const [isFinishing, setIsFinishing] = useState(false);
    const isCompleted = Boolean(workout.completed_at);
    const breadcrumbItems = [
        { label: 'Dashboard', href: '/' },
        { label: 'Workouts', href: '/workouts' },
        { label: `Day ${workout.program_day.day_number}` },
    ];
    const pageSurfaceClass = isDark ? 'programs-surface-dark' : 'programs-surface-light';
    const headlineClass = isDark ? 'text-slate-100' : 'text-slate-900';
    const subtitleClass = isDark ? 'text-slate-300' : 'text-slate-600';
    const exerciseCardClass = isDark ? 'border border-slate-700 bg-slate-900/55' : 'border border-slate-200 bg-slate-50';
    const inputPanelClass = isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200';

    const totalSets = useMemo(
        () => exerciseRows.reduce((carry, exercise) => carry + exercise.sets.length, 0),
        [exerciseRows]
    );
    const hasLoggedPerformance = useMemo(
        () =>
            exerciseRows.some((exercise) =>
                exercise.sets.some((set) => set.reps !== null || set.weight !== null || set.duration_seconds !== null)
            ),
        [exerciseRows]
    );
    const finishDisabledReason = !isCompleted && !hasLoggedPerformance ? 'Log at least one set result before finishing the workout.' : '';

    const updateSetField = (exerciseId, setId, field, value) => {
        setExerciseRows((currentRows) =>
            currentRows.map((exercise) =>
                exercise.id !== exerciseId
                    ? exercise
                    : {
                          ...exercise,
                          sets: exercise.sets.map((set) => (set.id !== setId ? set : { ...set, [field]: value })),
                      }
            )
        );
    };

    const findSetPayload = (setId) => {
        for (const exercise of exerciseRows) {
            const targetSet = exercise.sets.find((set) => set.id === setId);

            if (targetSet) {
                return {
                    reps: targetSet.reps ?? null,
                    weight: targetSet.weight ?? null,
                    duration_seconds: targetSet.duration_seconds ?? null,
                };
            }
        }

        return null;
    };

    const persistSet = async (setId) => {
        if (isCompleted) {
            return;
        }

        const payload = findSetPayload(setId);
        if (!payload) {
            return;
        }

        setSavingSetIds((currentIds) => [...new Set([...currentIds, setId])]);

        try {
            await axios.patch(`/workout-sets/${setId}`, payload);
        } catch (error) {
            const detail = error.response?.data?.message ?? 'The set could not be saved.';

            toast.current?.show({
                severity: 'error',
                summary: 'Set Save Failed',
                detail,
                life: 4000,
            });
        } finally {
            setSavingSetIds((currentIds) => currentIds.filter((currentId) => currentId !== setId));
        }
    };

    const finishWorkout = () => {
        if (!hasLoggedPerformance) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Add Results First',
                detail: 'Log at least one set result before finishing the workout.',
                life: 4000,
            });

            return;
        }

        setIsFinishing(true);

        router.post(
            `/workouts/${workout.id}/finish`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Workout Saved',
                        detail: 'Workout marked as completed and added to your history.',
                        life: 3500,
                    });
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];

                    toast.current?.show({
                        severity: 'error',
                        summary: 'Finish Failed',
                        detail: Array.isArray(firstError) ? firstError[0] : firstError ?? 'The workout could not be finished.',
                        life: 4500,
                    });
                },
                onFinish: () => setIsFinishing(false),
            }
        );
    };

    return (
        <>
            <Head title={`Workout Day ${workout.program_day.day_number}`} />
            <Toast ref={toast} />
            {finishDisabledReason && <Tooltip target=".finish-workout-trigger" content={finishDisabledReason} position="top" />}
            <AppLayout title={`Workout Day ${workout.program_day.day_number}`}>
                <div className="w-full lg:max-w-[1100px] lg:mr-auto">
                    <AppBreadcrumb items={breadcrumbItems} />

                    <Card className={`!rounded-t-none !rounded-b-none !border-0 ${pageSurfaceClass}`}>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-indigo-200' : 'text-indigo-700'}`}>
                                    Workout Session
                                </p>
                                <h3 className={`text-2xl font-semibold tracking-tight ${headlineClass}`}>
                                    {workout.program.name} — Day {workout.program_day.day_number}
                                </h3>
                                <p className={`max-w-2xl text-sm ${subtitleClass}`}>
                                    Log the work you actually perform. Programs stay as templates; this session is your real training record.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Chip label={`${exerciseRows.length} exercises`} className={isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'} />
                                <Chip label={`${totalSets} sets`} className={isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'} />
                                <Chip
                                    label={isCompleted ? `Completed ${formatDate(workout.completed_at)}` : `Started ${formatDate(workout.started_at)}`}
                                    className={isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className={`mt-2 !rounded-t-none !border-0 ${pageSurfaceClass}`}>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-1">
                                <p className={`!m-0 text-sm ${subtitleClass}`}>Fill in reps, weight, or duration. Set values save when the field loses focus.</p>
                                {isCompleted ? (
                                    <Message severity="success" text="This workout is completed. Values are now locked." className="w-full" />
                                ) : (
                                    <Message severity="info" text="You can leave optional fields empty and return later before finishing." className="w-full" />
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Link
                                    href="/workouts"
                                    className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium no-underline ${
                                        isDark ? 'bg-slate-700 text-slate-50 hover:bg-slate-600' : 'bg-slate-900 text-white hover:bg-slate-700'
                                    }`}
                                >
                                    View History
                                </Link>
                                <div className="flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-2 md:gap-2">
                                        <span className={finishDisabledReason ? 'finish-workout-trigger inline-flex cursor-not-allowed' : 'inline-flex'}>
                                            <Button
                                                label={isCompleted ? 'Workout Completed' : 'Finish Workout'}
                                                icon={isCompleted ? 'pi pi-check-circle' : 'pi pi-check'}
                                                disabled={isCompleted || !hasLoggedPerformance}
                                                loading={isFinishing}
                                                onClick={finishWorkout}
                                            />
                                        </span>

                                        {finishDisabledReason && (
                                            <>
                                                <button
                                                    type="button"
                                                    className={`inline-flex h-9 w-9 -ml-1 items-center justify-center rounded-lg border text-[0.7rem] font-semibold leading-none md:hidden ${
                                                        isDark
                                                            ? 'border-slate-600 bg-slate-800 text-slate-200'
                                                            : 'border-slate-300 bg-slate-100 text-slate-700'
                                                    }`}
                                                    aria-label="Why Finish Workout is disabled"
                                                    onClick={(event) => finishHelpOverlay.current?.toggle(event)}
                                                >
                                                    <span aria-hidden="true">i</span>
                                                </button>
                                                <OverlayPanel
                                                    ref={finishHelpOverlay}
                                                    dismissable
                                                    showCloseIcon
                                                    className={`app-overlay-panel max-w-xs ${
                                                        isDark ? 'app-overlay-panel-dark' : 'app-overlay-panel-light'
                                                    }`}
                                                >
                                                    <p
                                                        className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                                                            isDark ? 'text-slate-400' : 'text-slate-500'
                                                        }`}
                                                    >
                                                        Finish Workout
                                                    </p>
                                                    <p className={`!m-0 text-sm leading-relaxed ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                                                        {finishDisabledReason}
                                                    </p>
                                                </OverlayPanel>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {exerciseRows.map((exerciseRow) => (
                                <article key={exerciseRow.id} className={`rounded-3xl p-4 shadow-sm ${exerciseCardClass}`}>
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className={`!m-0 text-xs font-semibold uppercase tracking-[0.14em] ${subtitleClass}`}>
                                                    Exercise #{exerciseRow.order_index}
                                                </p>
                                                <Tag
                                                    value={exerciseRow.exercise.category?.name ?? 'Uncategorized'}
                                                    className={`!border-0 !text-xs !font-semibold ${
                                                        isDark ? '!bg-blue-500/25 !text-blue-100' : '!bg-blue-100 !text-blue-700'
                                                    }`}
                                                    rounded
                                                />
                                            </div>

                                            <div>
                                                <h4 className={`!m-0 text-xl font-semibold ${headlineClass}`}>{exerciseRow.exercise.name}</h4>
                                                <p className={`mt-1 text-sm ${subtitleClass}`}>
                                                    {humanizeSlug(exerciseRow.exercise.difficulty_level)} • Target {exerciseRow.prescription.sets} x{' '}
                                                    {exerciseRow.prescription.reps}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5">
                                                {exerciseRow.exercise.equipments.map((equipment) => (
                                                    <Chip
                                                        key={equipment.id}
                                                        label={equipment.name}
                                                        className={`programs-equipment-chip !text-xs ${isDark ? 'programs-equipment-chip-dark' : 'programs-equipment-chip-light'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3">
                                        {exerciseRow.sets.map((set) => {
                                            const isSaving = savingSetIds.includes(set.id);

                                            return (
                                                <div key={set.id} className={`rounded-2xl border p-3 ${inputPanelClass}`}>
                                                    <div className="mb-3 flex items-center justify-between gap-3">
                                                        <p className="!m-0 text-sm font-semibold">Set {set.set_number}</p>
                                                        <span className={`text-xs ${subtitleClass}`}>{isSaving ? 'Saving...' : 'Saved when edited'}</span>
                                                    </div>

                                                    <div className="grid gap-3 md:grid-cols-3">
                                                        {exerciseRow.prescription.is_duration_based ? (
                                                            <InputNumber
                                                                inputId={`duration-${set.id}`}
                                                                className="w-full"
                                                                value={set.duration_seconds}
                                                                onValueChange={(event) =>
                                                                    updateSetField(exerciseRow.id, set.id, 'duration_seconds', event.value ?? null)
                                                                }
                                                                onBlur={() => persistSet(set.id)}
                                                                useGrouping={false}
                                                                min={0}
                                                                disabled={isCompleted}
                                                                placeholder="Duration (sec)"
                                                                suffix=" sec"
                                                            />
                                                        ) : (
                                                            <InputNumber
                                                                inputId={`reps-${set.id}`}
                                                                className="w-full"
                                                                value={set.reps}
                                                                onValueChange={(event) => updateSetField(exerciseRow.id, set.id, 'reps', event.value ?? null)}
                                                                onBlur={() => persistSet(set.id)}
                                                                useGrouping={false}
                                                                min={0}
                                                                disabled={isCompleted}
                                                                placeholder="Reps"
                                                            />
                                                        )}

                                                        <InputNumber
                                                            inputId={`weight-${set.id}`}
                                                            className="w-full"
                                                            value={set.weight}
                                                            onValueChange={(event) => updateSetField(exerciseRow.id, set.id, 'weight', event.value ?? null)}
                                                            onBlur={() => persistSet(set.id)}
                                                            useGrouping={false}
                                                            min={0}
                                                            minFractionDigits={0}
                                                            maxFractionDigits={2}
                                                            disabled={isCompleted}
                                                            placeholder="Weight"
                                                        />

                                                        {exerciseRow.prescription.is_duration_based ? (
                                                            <div className={`flex min-h-12 items-center rounded-xl border px-3 py-3 text-sm ${inputPanelClass}`}>
                                                                Target {exerciseRow.prescription.reps}
                                                            </div>
                                                        ) : (
                                                            <div className={`flex min-h-12 items-center rounded-xl border px-3 py-3 text-sm ${inputPanelClass}`}>
                                                                Target {exerciseRow.prescription.reps}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    );
};

export default WorkoutsShow;
