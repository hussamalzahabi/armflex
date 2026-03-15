import axios from 'axios';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import AppDialog from '@/Components/AppDialog';
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
    const { flash = {} } = usePage().props;
    const toast = useRef(null);
    const finishHelpOverlay = useRef(null);
    const [exerciseRows, setExerciseRows] = useState(workout.exercises);
    const exerciseRowsRef = useRef(workout.exercises);
    const [savingSetIds, setSavingSetIds] = useState([]);
    const savingSetIdsRef = useRef([]);
    const [dirtySetIds, setDirtySetIds] = useState([]);
    const dirtySetIdsRef = useRef([]);
    const [saveErrorsBySetId, setSaveErrorsBySetId] = useState({});
    const pendingSavePromisesRef = useRef(new Map());
    const [isFinishing, setIsFinishing] = useState(false);
    const [isReopening, setIsReopening] = useState(false);
    const [showFinishDialog, setShowFinishDialog] = useState(false);
    const [showReopenDialog, setShowReopenDialog] = useState(false);
    const [isMobileLayout, setIsMobileLayout] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
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

    useEffect(() => {
        if (!flash.personal_records || flash.personal_records.length === 0) {
            return;
        }

        const detail = flash.personal_records.map((record) => record.summary).join(' • ');

        toast.current?.show({
            severity: 'success',
            summary: flash.personal_records.length === 1 ? 'New personal record' : 'New personal records',
            detail,
            life: 5000,
        });
    }, [flash.personal_records]);

    useEffect(() => {
        setExerciseRows(workout.exercises);
        exerciseRowsRef.current = workout.exercises;
        setDirtySetIds([]);
        dirtySetIdsRef.current = [];
        setSavingSetIds([]);
        savingSetIdsRef.current = [];
        setSaveErrorsBySetId({});
    }, [workout.exercises]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const updateViewport = () => setIsMobileLayout(window.innerWidth < 768);

        updateViewport();
        window.addEventListener('resize', updateViewport);

        return () => window.removeEventListener('resize', updateViewport);
    }, []);

    const syncSavingSetIds = (updater) => {
        const nextIds = typeof updater === 'function' ? updater(savingSetIdsRef.current) : updater;
        savingSetIdsRef.current = nextIds;
        setSavingSetIds(nextIds);
    };

    const syncDirtySetIds = (updater) => {
        const nextIds = typeof updater === 'function' ? updater(dirtySetIdsRef.current) : updater;
        dirtySetIdsRef.current = nextIds;
        setDirtySetIds(nextIds);
    };

    const updateSetField = (exerciseId, setId, field, value) => {
        const nextRows = exerciseRowsRef.current.map((exercise) =>
            exercise.id !== exerciseId
                ? exercise
                : {
                      ...exercise,
                      sets: exercise.sets.map((set) => (set.id !== setId ? set : { ...set, [field]: value })),
                  },
        );

        exerciseRowsRef.current = nextRows;
        setExerciseRows(nextRows);

        setSaveErrorsBySetId((currentErrors) => {
            if (!currentErrors[setId]) {
                return currentErrors;
            }

            const nextErrors = { ...currentErrors };
            delete nextErrors[setId];

            return nextErrors;
        });

        syncDirtySetIds((currentIds) => [...new Set([...currentIds, setId])]);
    };

    const findSetPayload = (setId) => {
        for (const exercise of exerciseRowsRef.current) {
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

    const areSetPayloadsEqual = (left, right) =>
        (left?.reps ?? null) === (right?.reps ?? null)
        && (left?.weight ?? null) === (right?.weight ?? null)
        && (left?.duration_seconds ?? null) === (right?.duration_seconds ?? null);

    const persistSet = async (setId) => {
        if (isCompleted) {
            return true;
        }

        const existingPromise = pendingSavePromisesRef.current.get(setId);
        if (existingPromise) {
            return existingPromise;
        }

        const payload = findSetPayload(setId);
        if (!payload) {
            return true;
        }

        syncSavingSetIds((currentIds) => [...new Set([...currentIds, setId])]);

        const savePromise = (async () => {
            let payload = findSetPayload(setId);

            if (!payload) {
                return true;
            }

            try {
                while (payload) {
                    await axios.patch(`/workout-sets/${setId}`, payload);

                    setSaveErrorsBySetId((currentErrors) => {
                        if (!currentErrors[setId]) {
                            return currentErrors;
                        }

                        const nextErrors = { ...currentErrors };
                        delete nextErrors[setId];

                        return nextErrors;
                    });

                    const latestPayload = findSetPayload(setId);

                    if (areSetPayloadsEqual(latestPayload, payload)) {
                        syncDirtySetIds((currentIds) => currentIds.filter((currentId) => currentId !== setId));

                        return true;
                    }

                    payload = latestPayload;
                }

                return true;
            } catch (error) {
                const validationErrors = error.response?.data?.errors ?? {};
                const firstValidationError = Object.values(validationErrors)[0];
                const detail =
                    (Array.isArray(firstValidationError) ? firstValidationError[0] : firstValidationError)
                    ?? error.response?.data?.message
                    ?? 'The set could not be saved.';

                setSaveErrorsBySetId((currentErrors) => ({
                    ...currentErrors,
                    [setId]: detail,
                }));

                toast.current?.show({
                    severity: 'error',
                    summary: 'Set Save Failed',
                    detail,
                    life: 4000,
                });

                return false;
            } finally {
                pendingSavePromisesRef.current.delete(setId);
                syncSavingSetIds((currentIds) => currentIds.filter((currentId) => currentId !== setId));
            }
        })();

        pendingSavePromisesRef.current.set(setId, savePromise);

        return savePromise;
    };

    const persistDirtySetsBeforeCompletion = async () => {
        if (!hasLoggedPerformance) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Add Results First',
                detail: 'Log at least one set result before finishing the workout.',
                life: 4000,
            });

            return false;
        }

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
            await new Promise((resolve) => setTimeout(resolve, 0));
        }

        const pendingSaves = Array.from(pendingSavePromisesRef.current.values());
        if (pendingSaves.length > 0) {
            const pendingResults = await Promise.all(pendingSaves);

            if (pendingResults.some((didSave) => !didSave)) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Finish Blocked',
                    detail: 'Fix the set save errors before finishing the workout.',
                    life: 4500,
                });

                return false;
            }
        }

        const setsToPersist = [...new Set(dirtySetIdsRef.current)];

        if (setsToPersist.length > 0) {
            const saveResults = await Promise.all(setsToPersist.map((setId) => persistSet(setId)));

            if (saveResults.some((didSave) => !didSave)) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Finish Blocked',
                    detail: 'Fix the set save errors before finishing the workout.',
                    life: 4500,
                });

                return false;
            }
        }

        return true;
    };

    const finishWorkout = async () => {
        const isReadyToFinish = await persistDirtySetsBeforeCompletion();

        if (!isReadyToFinish) {
            return;
        }

        setIsFinishing(true);

        router.post(
            `/workouts/${workout.id}/finish`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowFinishDialog(false);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Workout Saved',
                        detail: 'Workout marked as completed and added to your history.',
                        life: 3500,
                    });
                },
                onError: (errors) => {
                    setShowFinishDialog(false);
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

    const reopenWorkout = () => {
        setIsReopening(true);

        router.post(
            `/workouts/${workout.id}/reopen`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowReopenDialog(false);
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Workout Reopened',
                        detail: 'Workout unlocked for editing.',
                        life: 3500,
                    });
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];

                    toast.current?.show({
                        severity: 'error',
                        summary: 'Reopen Failed',
                        detail: Array.isArray(firstError) ? firstError[0] : firstError ?? 'The workout could not be reopened.',
                        life: 4500,
                    });
                },
                onFinish: () => setIsReopening(false),
            }
        );
    };

    const finishDialogFooter = (
        <div className="flex justify-end gap-2">
            <Button label="Cancel" text onClick={() => setShowFinishDialog(false)} disabled={isFinishing} />
            <Button label="Finish Workout" icon="pi pi-check" onClick={finishWorkout} loading={isFinishing} />
        </div>
    );

    const reopenDialogFooter = (
        <div className="flex justify-end gap-2">
            <Button label="Cancel" text onClick={() => setShowReopenDialog(false)} disabled={isReopening} />
            <Button label="Reopen Workout" icon="pi pi-refresh" onClick={reopenWorkout} loading={isReopening} />
        </div>
    );

    const renderExerciseRows = () => (
        <>
            {exerciseRows.map((exerciseRow) => (
                <article key={exerciseRow.id} className={`rounded-3xl p-3 md:p-4 shadow-sm ${exerciseCardClass}`}>
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
                                <h4 className="!m-0">
                                    <Link
                                        href={`/exercises/${exerciseRow.exercise.slug}`}
                                        className={`text-xl font-semibold no-underline transition hover:underline ${
                                            isDark ? 'text-slate-100 hover:text-indigo-200' : 'text-slate-900 hover:text-indigo-700'
                                        }`}
                                    >
                                        {exerciseRow.exercise.name}
                                    </Link>
                                </h4>
                                <div className={`mt-1 flex flex-wrap items-center gap-1 text-sm ${subtitleClass}`}>
                                    <span>{humanizeSlug(exerciseRow.exercise.difficulty_level)}</span>
                                    <span>•</span>
                                    <span>
                                        Target {exerciseRow.prescription.sets} x {exerciseRow.prescription.reps}
                                    </span>
                                    <span>•</span>
                                    <Link
                                        href={`/exercises/${exerciseRow.exercise.slug}`}
                                        className={`font-medium no-underline transition hover:underline ${
                                            isDark ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-700'
                                        }`}
                                    >
                                        View details
                                    </Link>
                                </div>
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

                    <div className="mt-3 grid gap-2.5 md:mt-4 md:gap-3">
                        {exerciseRow.sets.map((set) => {
                            const isSaving = savingSetIds.includes(set.id);
                            const saveError = saveErrorsBySetId[set.id];

                            return (
                                <div key={set.id} className={`rounded-2xl border p-2.5 md:p-3 ${inputPanelClass}`}>
                                    <div className="mb-2.5 flex items-center justify-between gap-3 md:mb-3">
                                        <p className="!m-0 text-sm font-semibold">Set {set.set_number}</p>
                                        <span className={`text-xs ${saveError ? 'text-amber-400' : subtitleClass}`}>
                                            {isSaving ? 'Saving...' : saveError ? 'Save failed' : dirtySetIds.includes(set.id) ? 'Unsaved changes' : 'Saved when edited'}
                                        </span>
                                    </div>

                                    <div className="grid gap-2.5 md:grid-cols-3 md:gap-3">
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

                                        <div className={`flex min-h-12 items-center rounded-xl border px-3 py-3 text-sm ${inputPanelClass}`}>
                                            Target {exerciseRow.prescription.reps}
                                        </div>
                                    </div>

                                    {saveError && <p className="mt-2 !mb-0 text-xs text-amber-400">{saveError}</p>}
                                </div>
                            );
                        })}
                    </div>
                </article>
            ))}
        </>
    );

    return (
        <>
            <Head title={`Workout Day ${workout.program_day.day_number}`} />
            <Toast ref={toast} />
            <AppDialog
                visible={showFinishDialog}
                onHide={() => setShowFinishDialog(false)}
                header="Finish workout?"
                closable={!isFinishing}
                dismissableMask={!isFinishing}
                className="w-full max-w-lg"
                footer={finishDialogFooter}
            >
                <p className={`!m-0 text-sm leading-relaxed ${subtitleClass}`}>
                    Make sure all sets are recorded. Completed workouts cannot be edited.
                </p>
            </AppDialog>
            <AppDialog
                visible={showReopenDialog}
                onHide={() => setShowReopenDialog(false)}
                header="Reopen workout?"
                closable={!isReopening}
                dismissableMask={!isReopening}
                className="w-full max-w-lg"
                footer={reopenDialogFooter}
            >
                <p className={`!m-0 text-sm leading-relaxed ${subtitleClass}`}>
                    This will unlock the workout for editing and may affect personal records, streaks, and progress tracking.
                </p>
            </AppDialog>
            {finishDisabledReason && <Tooltip target=".finish-workout-trigger" content={finishDisabledReason} position="top" />}
            <AppLayout title={`Workout Day ${workout.program_day.day_number}`} breadcrumb={breadcrumbItems}>
                <div className="w-full lg:max-w-[1100px] lg:mr-auto">
                    <Card className={`!rounded-3xl !border-0 ${pageSurfaceClass}`}>
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

                    <Card className={`workout-log-card mt-2 !rounded-3xl !border-0 ${pageSurfaceClass}`}>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-5">
                            <div className="max-w-2xl space-y-1.5">
                                <p className={`!m-0 text-sm font-semibold ${headlineClass}`}>
                                    Log reps, weight, or duration. Changes save automatically.
                                </p>
                                {isCompleted ? (
                                    <Message severity="success" text="This workout is completed. Values are now locked." className="mt-3 w-full" />
                                ) : (
                                    <p className={`!m-0 pt-1 text-sm leading-relaxed ${subtitleClass}`}>
                                        Optional fields can stay empty until you&apos;re ready to finish the workout.
                                    </p>
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
                                {isCompleted ? (
                                    <Button
                                        label="Reopen Workout"
                                        icon="pi pi-refresh"
                                        onClick={() => setShowReopenDialog(true)}
                                        loading={isReopening}
                                    />
                                ) : (
                                    <div className="flex flex-col items-start gap-1">
                                        <div className="flex items-center gap-2 md:gap-2">
                                            <span className={finishDisabledReason ? 'finish-workout-trigger inline-flex cursor-not-allowed' : 'inline-flex'}>
                                                <Button
                                                    label="Finish Workout"
                                                    icon="pi pi-check"
                                                    disabled={!hasLoggedPerformance || savingSetIds.length > 0}
                                                    loading={isFinishing}
                                                    onClick={() => setShowFinishDialog(true)}
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
                                                        <i className="pi pi-info-circle text-sm" aria-hidden="true" />
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
                                )}
                            </div>
                        </div>
                        {!isMobileLayout && <div className="mt-4 space-y-4">{renderExerciseRows()}</div>}
                    </Card>

                    {isMobileLayout && <div className="mt-4 space-y-3">{renderExerciseRows()}</div>}
                </div>
            </AppLayout>
        </>
    );
};

export default WorkoutsShow;
