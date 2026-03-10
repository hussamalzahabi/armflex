import { Head, router, usePage } from '@inertiajs/react';
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

const styleSeverityMap = {
    toproll: 'info',
    hook: 'warning',
    press: 'danger',
    mixed: 'success',
};

const levelSeverityMap = {
    beginner: 'success',
    intermediate: 'info',
    advanced: 'warning',
    elite: 'danger',
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
    const { flash = {}, errors = {} } = usePage().props;
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedProgramId, setSelectedProgramId] = useState(programs[0]?.id ?? null);

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

    useEffect(() => {
        if (!flash.success) {
            return;
        }

        toast.current?.show({
            severity: 'success',
            summary: 'Program Generated',
            detail: flash.success,
            life: 3500,
        });
    }, [flash.success]);

    useEffect(() => {
        const firstErrorEntry = Object.entries(errors)[0];
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
    }, [errors]);

    const generateProgram = () => {
        setIsGenerating(true);

        router.post(
            '/programs/generate',
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsGenerating(false),
            }
        );
    };

    const programStyleBody = (rowData) => (
        <Tag value={humanizeSlug(rowData.style)} severity={styleSeverityMap[rowData.style] ?? 'secondary'} rounded />
    );

    const programLevelBody = (rowData) => (
        <Tag value={humanizeSlug(rowData.experience_level)} severity={levelSeverityMap[rowData.experience_level] ?? 'secondary'} rounded />
    );

    const programDateBody = (rowData) => <span>{formatDate(rowData.created_at)}</span>;

    const exerciseNameBody = (rowData) => (
        <div className="flex flex-col gap-0.5">
            <span className="font-medium">{rowData.exercise.name}</span>
            <span className="text-xs text-slate-400">{humanizeSlug(rowData.exercise.difficulty_level)}</span>
        </div>
    );

    const categoryBody = (rowData) => (
        <Tag
            value={rowData.exercise.category?.name ?? 'Uncategorized'}
            severity={rowData.exercise.category ? 'info' : 'secondary'}
            rounded
        />
    );

    const prescriptionBody = (rowData) => (
        <span className="font-medium">
            {rowData.sets} x {rowData.reps}
        </span>
    );

    const equipmentBody = (rowData) => (
        <div className="flex flex-wrap gap-1.5">
            {rowData.exercise.equipments.map((equipment) => (
                <Chip key={equipment.id} label={equipment.name} className="!text-xs" />
            ))}
        </div>
    );

    const pageSurfaceClass = isDark ? 'programs-surface-dark' : 'programs-surface-light';
    const headlineClass = isDark ? 'text-slate-100' : 'text-slate-900';
    const subtitleClass = isDark ? 'text-slate-300' : 'text-slate-600';

    return (
        <>
            <Head title="Programs" />
            <Toast ref={toast} />
            <AppLayout
                title="Programs"
                breadcrumb={[
                    { label: 'Dashboard', href: '/' },
                    { label: 'Programs' },
                ]}
            >
                <div className="w-full lg:max-w-[1240px] lg:mr-auto">
                    <Card className={`programs-hero !rounded-3xl !border-0 ${pageSurfaceClass}`}>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Program Studio</p>
                                <h3 className={`text-2xl font-semibold tracking-tight ${headlineClass}`}>Build your 4-week training template</h3>
                                <p className={`max-w-2xl text-sm ${subtitleClass}`}>
                                    Generates a deterministic weekly structure based on your profile, equipment, style, and level. The weekly plan repeats for
                                    4 weeks.
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Chip label={`Programs: ${programs.length}`} />
                                    <Chip label={`Profile style: ${profileSummary?.style ?? 'Not set'}`} />
                                    <Chip
                                        label={`Training days: ${profileSummary?.training_days_per_week ?? 'Not set'}`}
                                        className={profileSummary?.training_days_per_week ? '' : 'border-red-400/50'}
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

                    <div className="mt-3 grid gap-3 xl:grid-cols-12">
                        <Card className={`xl:col-span-5 !rounded-3xl !border-0 ${pageSurfaceClass}`}>
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h4 className={`text-lg font-semibold ${headlineClass}`}>Program History</h4>
                                <Tag value={`${programs.length} total`} severity="contrast" />
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

                        <Card className={`xl:col-span-7 !rounded-3xl !border-0 ${pageSurfaceClass}`}>
                            {!selectedProgram ? (
                                <Message severity="info" text="Generate your first program to preview the weekly template." />
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <h4 className={`text-xl font-semibold tracking-tight ${headlineClass}`}>{selectedProgram.name}</h4>
                                            <p className={`text-sm ${subtitleClass}`}>Created {formatDate(selectedProgram.created_at)}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Tag value={`${selectedProgram.training_days} days/week`} severity="info" />
                                            <Tag value={`${selectedProgram.duration_weeks} weeks`} severity="success" />
                                            <Tag value={`${totalExercisesInSelectedProgram} exercises/week`} severity="warning" />
                                        </div>
                                    </div>

                                    <Accordion multiple activeIndex={selectedProgram.days.map((_, index) => index)} className="programs-days">
                                        {selectedProgram.days.map((day) => (
                                            <AccordionTab key={day.id} header={`Day ${day.day_number}`}>
                                                <DataTable
                                                    value={day.exercises}
                                                    dataKey="id"
                                                    stripedRows
                                                    size="small"
                                                    className="programs-table"
                                                    emptyMessage="No exercises assigned."
                                                >
                                                    <Column field="order_index" header="#" style={{ width: '4rem' }} />
                                                    <Column field="exercise.name" header="Exercise" body={exerciseNameBody} />
                                                    <Column field="exercise.category" header="Category" body={categoryBody} />
                                                    <Column field="sets" header="Prescription" body={prescriptionBody} />
                                                    <Column field="exercise.equipments" header="Equipment" body={equipmentBody} />
                                                </DataTable>
                                            </AccordionTab>
                                        ))}
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
