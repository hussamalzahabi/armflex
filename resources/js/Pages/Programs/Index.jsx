import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import AppLayout from '@/Layouts/AppLayout';
import { useTheme } from '@/hooks/useTheme';

const styleColorMap = {
    toproll: {
        dark: '!bg-sky-500/25 !text-sky-100',
        light: '!bg-sky-100 !text-sky-700',
    },
    hook: {
        dark: '!bg-orange-500/25 !text-orange-100',
        light: '!bg-orange-100 !text-orange-700',
    },
    press: {
        dark: '!bg-rose-500/25 !text-rose-100',
        light: '!bg-rose-100 !text-rose-700',
    },
    mixed: {
        dark: '!bg-emerald-500/25 !text-emerald-100',
        light: '!bg-emerald-100 !text-emerald-700',
    },
};

const levelColorMap = {
    beginner: {
        dark: '!bg-emerald-500/25 !text-emerald-100',
        light: '!bg-emerald-100 !text-emerald-700',
    },
    intermediate: {
        dark: '!bg-cyan-500/25 !text-cyan-100',
        light: '!bg-cyan-100 !text-cyan-700',
    },
    advanced: {
        dark: '!bg-amber-500/30 !text-amber-100',
        light: '!bg-amber-100 !text-amber-700',
    },
    elite: {
        dark: '!bg-fuchsia-500/25 !text-fuchsia-100',
        light: '!bg-fuchsia-100 !text-fuchsia-700',
    },
};

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

const ProgramsIndex = ({ programs = [], profileSummary = null }) => {
    const toast = useRef(null);
    const { isDark } = useTheme();
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedProgramId, setSelectedProgramId] = useState(programs[0]?.id ?? null);
    const [startingWorkoutDayId, setStartingWorkoutDayId] = useState(null);

    const selectedProgram = useMemo(
        () => programs.find((program) => program.id === selectedProgramId) ?? programs[0] ?? null,
        [programs, selectedProgramId]
    );

    const totalExercisesInSelectedProgram = useMemo(() => {
        if (!selectedProgram) {
            return 0;
        }

        return selectedProgram.days.reduce((carry, day) => carry + day.exercises.length, 0);
    }, [selectedProgram]);

    useEffect(() => {
        if (programs.length > 0 && !selectedProgramId) {
            setSelectedProgramId(programs[0].id);
        }
    }, [programs, selectedProgramId]);

    const generateProgram = () => {
        setIsGenerating(true);

        router.post(
            '/programs/generate',
            {},
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const nextPrograms = Array.isArray(page.props?.programs) ? page.props.programs : [];
                    const didCreateNewProgram = nextPrograms.length > programs.length;

                    toast.current?.show({
                        severity: 'success',
                        summary: didCreateNewProgram ? 'Program Generated' : 'Program Reused',
                        detail: didCreateNewProgram
                            ? 'Program generated successfully.'
                            : 'An existing program already matches your current profile.',
                        life: 3500,
                    });
                },
                onError: (errorBag) => {
                    const firstErrorEntry = Object.entries(errorBag)[0];
                    if (!firstErrorEntry) {
                        return;
                    }

                    const [field, message] = firstErrorEntry;
                    const detail = Array.isArray(message) ? message[0] : message;

                    toast.current?.show({
                        severity: 'error',
                        summary: 'Generation Failed',
                        detail: `${humanizeSlug(field)}: ${detail}`,
                        life: 4500,
                    });
                },
                onFinish: () => setIsGenerating(false),
            }
        );
    };

    const dayStatusMeta = (day) => {
        if (day.active_workout_id) {
            return {
                message: `Workout started ${formatDate(day.active_workout_started_at)}`,
                actionLabel: 'Continue Workout',
                actionIcon: 'pi pi-play-circle',
            };
        }

        if (day.latest_completed_workout_at) {
            return {
                message: `Last completed ${formatDate(day.latest_completed_workout_at)}`,
                actionLabel: 'Start New Workout',
                actionIcon: 'pi pi-refresh',
            };
        }

        return {
            message: 'Use this day as the workout template when you are ready to train.',
            actionLabel: 'Start Workout',
            actionIcon: 'pi pi-bolt',
        };
    };

    const startWorkout = (programId, programDayId) => {
        setStartingWorkoutDayId(programDayId);

        router.post(
            '/workouts/start',
            {
                program_id: programId,
                program_day_id: programDayId,
            },
            {
                preserveScroll: true,
                onError: (errorBag) => {
                    const firstErrorEntry = Object.entries(errorBag)[0];
                    if (!firstErrorEntry) {
                        return;
                    }

                    const [field, message] = firstErrorEntry;
                    const detail = Array.isArray(message) ? message[0] : message;

                    toast.current?.show({
                        severity: 'error',
                        summary: 'Workout Could Not Start',
                        detail: `${humanizeSlug(field)}: ${detail}`,
                        life: 4500,
                    });
                },
                onFinish: () => setStartingWorkoutDayId(null),
            }
        );
    };

    const resolveStyleTagClass = (styleSlug) => {
        const mappedClasses = styleColorMap[styleSlug];

        if (!mappedClasses) {
            return isDark ? '!bg-slate-600 !text-slate-100' : '!bg-slate-200 !text-slate-700';
        }

        return isDark ? mappedClasses.dark : mappedClasses.light;
    };

    const resolveLevelTagClass = (levelSlug) => {
        const mappedClasses = levelColorMap[levelSlug];

        if (!mappedClasses) {
            return isDark ? '!bg-slate-600 !text-slate-100' : '!bg-slate-200 !text-slate-700';
        }

        return isDark ? mappedClasses.dark : mappedClasses.light;
    };

    const programStyleBody = (rowData) => (
        <Tag value={humanizeSlug(rowData.style)} className={`!border-0 !text-xs !font-semibold ${resolveStyleTagClass(rowData.style)}`} rounded />
    );

    const programLevelBody = (rowData) => (
        <Tag
            value={humanizeSlug(rowData.experience_level)}
            className={`!border-0 !text-xs !font-semibold ${resolveLevelTagClass(rowData.experience_level)}`}
            rounded
        />
    );

    const programDateBody = (rowData) => <span>{formatDate(rowData.created_at)}</span>;

    const exerciseNameBody = (rowData) => (
        <div className="flex flex-col gap-0.5">
            <Link
                href={`/exercises/${rowData.exercise.slug}`}
                className={`font-medium no-underline transition hover:underline ${isDark ? 'text-slate-100 hover:text-indigo-200' : 'text-slate-900 hover:text-indigo-700'}`}
            >
                {rowData.exercise.name}
            </Link>
            <div className="flex flex-wrap items-center gap-1 text-xs">
                <span className="text-slate-400">{humanizeSlug(rowData.exercise.difficulty_level)}</span>
                <span className="text-slate-400">•</span>
                <Link
                    href={`/exercises/${rowData.exercise.slug}`}
                    className={`font-medium no-underline transition hover:underline ${isDark ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-700'}`}
                >
                    View details
                </Link>
            </div>
        </div>
    );

    const categoryBody = (rowData) => {
        const isKnownCategory = Boolean(rowData.exercise.category);
        const categoryClass = isDark
            ? isKnownCategory
                ? '!bg-blue-500/25 !text-blue-100'
                : '!bg-slate-600 !text-slate-100'
            : isKnownCategory
              ? '!bg-blue-100 !text-blue-700'
              : '!bg-slate-200 !text-slate-700';

        return <Tag value={rowData.exercise.category?.name ?? 'Uncategorized'} className={`!border-0 !text-xs !font-semibold ${categoryClass}`} rounded />;
    };

    const prescriptionBody = (rowData) => (
        <span className="font-medium">
            {rowData.sets} x {rowData.reps}
        </span>
    );

    const equipmentBody = (rowData) => (
        <div className="flex flex-wrap gap-1.5">
            {rowData.exercise.equipments.map((equipment) => (
                <Chip
                    key={equipment.id}
                    label={equipment.name}
                    className={`programs-equipment-chip !text-xs ${isDark ? 'programs-equipment-chip-dark' : 'programs-equipment-chip-light'}`}
                />
            ))}
        </div>
    );

    const pageSurfaceClass = isDark ? 'programs-surface-dark' : 'programs-surface-light';
    const headlineClass = isDark ? 'text-slate-100' : 'text-slate-900';
    const subtitleClass = isDark ? 'text-slate-300' : 'text-slate-600';
    const mobileExerciseCardClass = isDark ? 'border border-slate-700 bg-slate-900/45' : 'border border-slate-200 bg-slate-50';
    const mobileLabelClass = isDark ? 'text-slate-400' : 'text-slate-500';
    const programBreadcrumb = [{ label: 'Dashboard', href: '/' }, { label: 'Programs' }];

    return (
        <>
            <Head title="Programs" />
            <Toast ref={toast} />
            <AppLayout title="Programs" breadcrumb={programBreadcrumb}>
                <div className="w-full lg:max-w-[1240px] lg:mr-auto">
                    <Card className={`programs-hero !rounded-3xl !border-0 ${pageSurfaceClass}`}>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-2">
                                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-indigo-200' : 'text-indigo-700'}`}>
                                    Program Studio
                                </p>
                                <h3 className={`text-2xl font-semibold tracking-tight ${headlineClass}`}>Build your 4-week training template</h3>
                                <p className={`max-w-2xl text-sm ${subtitleClass}`}>
                                    Generates a deterministic weekly structure based on your profile, equipment, style, and level. The weekly plan repeats for
                                    4 weeks.
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Chip
                                        label={`Programs: ${programs.length}`}
                                        className={`${isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'}`}
                                    />
                                    <Chip
                                        label={`Profile style: ${profileSummary?.style ?? 'Not set'}`}
                                        className={`${isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'}`}
                                    />
                                    <Chip
                                        label={`Training days: ${profileSummary?.training_days_per_week ?? 'Not set'}`}
                                        className={
                                            profileSummary?.training_days_per_week
                                                ? isDark
                                                    ? 'programs-summary-chip-dark'
                                                    : 'programs-summary-chip-light'
                                                : isDark
                                                  ? 'programs-summary-chip-danger-dark'
                                                  : 'programs-summary-chip-danger-light'
                                        }
                                    />
                                </div>
                            </div>
                            <Button
                                label="Generate Program"
                                icon="pi pi-bolt"
                                loading={isGenerating}
                                onClick={generateProgram}
                                className="p-button-lg w-full lg:w-auto lg:min-w-56"
                            />
                        </div>
                    </Card>

                    <div className="mt-2 grid gap-3 xl:grid-cols-12">
                        <Card className={`program-history-card programs-content-card xl:col-span-5 !rounded-3xl !border-0 ${pageSurfaceClass}`}>
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h4 className={`!m-0 !mb-2 text-lg font-semibold ${headlineClass}`}>Program History</h4>
                                <Tag
                                    value={`${programs.length} total`}
                                    className={`!border-0 !text-xs !font-semibold ${
                                        isDark ? '!bg-indigo-500/25 !text-indigo-100' : '!bg-indigo-100 !text-indigo-700'
                                    }`}
                                    rounded
                                />
                            </div>

                            {programs.length === 0 ? (
                                <Message
                                    severity="info"
                                    text="No programs generated yet. Complete your profile and click Generate Program."
                                    className="w-full"
                                />
                            ) : (
                                <DataTable
                                    value={programs}
                                    selectionMode="single"
                                    selection={selectedProgram}
                                    onSelectionChange={(event) => setSelectedProgramId(event.value?.id ?? null)}
                                    dataKey="id"
                                    paginator
                                    rows={6}
                                    rowsPerPageOptions={[6, 10, 20]}
                                    stripedRows
                                    className="programs-table"
                                    pt={{
                                        wrapper: { className: 'rounded-2xl' },
                                    }}
                                >
                                    <Column field="name" header="Program" sortable />
                                    <Column field="style" header="Style" body={programStyleBody} />
                                    <Column field="experience_level" header="Level" body={programLevelBody} />
                                    <Column field="created_at" header="Created" body={programDateBody} sortable />
                                </DataTable>
                            )}
                        </Card>

                        <Card className={`programs-content-card xl:col-span-7 !rounded-3xl !border-0 ${pageSurfaceClass}`}>
                            {!selectedProgram ? (
                                <Message severity="info" text="Generate your first program to preview the weekly template." />
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <h4 className={`!m-0 text-xl font-semibold tracking-tight ${headlineClass}`}>{selectedProgram.name}</h4>
                                            <p className={`!my-2 text-sm ${subtitleClass}`}>Created {formatDate(selectedProgram.created_at)}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Tag
                                                value={`${selectedProgram.training_days} days/week`}
                                                className={`!border-0 !text-xs !font-semibold ${
                                                    isDark ? '!bg-blue-500/25 !text-blue-100' : '!bg-blue-100 !text-blue-700'
                                                }`}
                                                rounded
                                            />
                                            <Tag
                                                value={`${selectedProgram.duration_weeks} weeks`}
                                                className={`!border-0 !text-xs !font-semibold ${
                                                    isDark ? '!bg-emerald-500/25 !text-emerald-100' : '!bg-emerald-100 !text-emerald-700'
                                                }`}
                                                rounded
                                            />
                                            <Tag
                                                value={`${totalExercisesInSelectedProgram} exercises/week`}
                                                className={`!border-0 !text-xs !font-semibold ${
                                                    isDark ? '!bg-amber-500/25 !text-amber-100' : '!bg-amber-100 !text-amber-700'
                                                }`}
                                                rounded
                                            />
                                        </div>
                                    </div>

                                    <Accordion multiple activeIndex={selectedProgram.days.map((_, index) => index)} className="programs-days">
                                        {selectedProgram.days.map((day) => {
                                            const statusMeta = dayStatusMeta(day);

                                            return (
                                            <AccordionTab key={day.id} header={`Day ${day.day_number}`}>
                                                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                                    <div className={`text-sm ${subtitleClass}`}>
                                                        {statusMeta.message}
                                                    </div>
                                                    <Button
                                                        label={statusMeta.actionLabel}
                                                        icon={statusMeta.actionIcon}
                                                        size="small"
                                                        loading={startingWorkoutDayId === day.id}
                                                        onClick={() => startWorkout(selectedProgram.id, day.id)}
                                                        className="w-full sm:w-auto"
                                                    />
                                                </div>

                                                <div className="hidden md:block">
                                                    <DataTable
                                                        value={day.exercises}
                                                        dataKey="id"
                                                        size="small"
                                                        className="programs-table programs-day-table"
                                                        emptyMessage="No exercises assigned."
                                                        scrollable
                                                        tableStyle={{ minWidth: '64rem' }}
                                                    >
                                                        <Column field="order_index" header="#" style={{ width: '4rem' }} />
                                                        <Column field="exercise.name" header="Exercise" body={exerciseNameBody} style={{ minWidth: '20rem' }} />
                                                        <Column field="exercise.category" header="Category" body={categoryBody} style={{ minWidth: '10rem' }} />
                                                        <Column field="sets" header="Prescription" body={prescriptionBody} style={{ minWidth: '10rem' }} />
                                                        <Column field="exercise.equipments" header="Equipment" body={equipmentBody} style={{ minWidth: '16rem' }} />
                                                    </DataTable>
                                                </div>

                                                <div className="space-y-3 md:hidden">
                                                    {day.exercises.length === 0 ? (
                                                        <Message severity="info" text="No exercises assigned." className="w-full" />
                                                    ) : (
                                                        day.exercises.map((exerciseRow) => (
                                                            <article
                                                                key={exerciseRow.id}
                                                                className={`rounded-2xl p-3.5 shadow-sm ${mobileExerciseCardClass}`}
                                                            >
                                                                <div className="mb-2 flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${mobileLabelClass}`}>
                                                                            Exercise #{exerciseRow.order_index}
                                                                        </p>
                                                                        <div className="mt-0.5 space-y-0.5">
                                                                            <Link
                                                                                href={`/exercises/${exerciseRow.exercise.slug}`}
                                                                                className={`text-base font-semibold leading-tight no-underline transition hover:underline ${
                                                                                    isDark ? 'text-slate-100 hover:text-indigo-200' : 'text-slate-900 hover:text-indigo-700'
                                                                                }`}
                                                                            >
                                                                                {exerciseRow.exercise.name}
                                                                            </Link>
                                                                            <div className={`flex flex-wrap items-center gap-1 text-[11px] leading-none ${mobileLabelClass}`}>
                                                                                <span>{humanizeSlug(exerciseRow.exercise.difficulty_level)}</span>
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
                                                                    </div>
                                                                    {categoryBody(exerciseRow)}
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <div>
                                                                        <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${mobileLabelClass}`}>Prescription</p>
                                                                        <p className="text-sm font-medium">
                                                                            {exerciseRow.sets} x {exerciseRow.reps}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${mobileLabelClass}`}>Equipment</p>
                                                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                                            {exerciseRow.exercise.equipments.length === 0 ? (
                                                                                <Tag
                                                                                    value="None"
                                                                                    className={`!border-0 !text-xs !font-semibold ${
                                                                                        isDark ? '!bg-slate-600 !text-slate-100' : '!bg-slate-200 !text-slate-700'
                                                                                    }`}
                                                                                    rounded
                                                                                />
                                                                            ) : (
                                                                                exerciseRow.exercise.equipments.map((equipment) => (
                                                                                    <Chip
                                                                                        key={equipment.id}
                                                                                        label={equipment.name}
                                                                                        className={`programs-equipment-chip !text-xs ${
                                                                                            isDark ? 'programs-equipment-chip-dark' : 'programs-equipment-chip-light'
                                                                                        }`}
                                                                                    />
                                                                                ))
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </article>
                                                        ))
                                                    )}
                                                </div>
                                            </AccordionTab>
                                            );
                                        })}
                                    </Accordion>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </AppLayout>
        </>
    );
};

export default ProgramsIndex;
