import { Head, Link, useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';

const dominantArmOptions = [
    { label: 'Right', value: 'right' },
    { label: 'Left', value: 'left' },
];

const experienceOptions = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
];

const Edit = ({ profile }) => {
    const toast = useRef(null);
    const { data, setData, put, processing, errors } = useForm({
        dominant_arm: profile?.dominant_arm ?? 'right',
        experience_level: profile?.experience_level ?? 'beginner',
        weight_kg: profile?.weight_kg ? Number(profile.weight_kg) : null,
        training_days_per_week: profile?.training_days_per_week ?? null,
        notes: profile?.notes ?? '',
    });

    const submit = (event) => {
        event.preventDefault();

        put('/profile', {
            onSuccess: () => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Saved',
                    detail: 'Training profile saved successfully.',
                    life: 3000,
                });
            },
        });
    };

    return (
        <>
            <Head title="Training Profile" />
            <Toast ref={toast} />
            <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
                <Card title="Training Profile" className="w-full max-w-xl">
                    <form onSubmit={submit} className="p-fluid space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="dominant_arm" className="block text-sm font-medium text-slate-700">
                                Dominant arm
                            </label>
                            <Dropdown
                                id="dominant_arm"
                                value={data.dominant_arm}
                                options={dominantArmOptions}
                                onChange={(event) => setData('dominant_arm', event.value)}
                                placeholder="Select dominant arm"
                                className="w-full"
                            />
                            {errors.dominant_arm && <small className="text-red-600">{errors.dominant_arm}</small>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="experience_level" className="block text-sm font-medium text-slate-700">
                                Experience level
                            </label>
                            <Dropdown
                                id="experience_level"
                                value={data.experience_level}
                                options={experienceOptions}
                                onChange={(event) => setData('experience_level', event.value)}
                                placeholder="Select experience level"
                                className="w-full"
                            />
                            {errors.experience_level && <small className="text-red-600">{errors.experience_level}</small>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="weight_kg" className="block text-sm font-medium text-slate-700">
                                Body weight (kg)
                            </label>
                            <InputNumber
                                inputId="weight_kg"
                                value={data.weight_kg}
                                onValueChange={(event) => setData('weight_kg', event.value)}
                                min={30}
                                max={300}
                                minFractionDigits={0}
                                maxFractionDigits={2}
                                mode="decimal"
                                className="w-full"
                            />
                            {errors.weight_kg && <small className="text-red-600">{errors.weight_kg}</small>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="training_days_per_week" className="block text-sm font-medium text-slate-700">
                                Training days per week
                            </label>
                            <InputNumber
                                inputId="training_days_per_week"
                                value={data.training_days_per_week}
                                onValueChange={(event) => {
                                    const value = event.value;

                                    if (value === null || value === undefined) {
                                        setData('training_days_per_week', null);
                                        return;
                                    }

                                    const clamped = Math.min(7, Math.max(1, Math.round(value)));
                                    setData('training_days_per_week', clamped);
                                }}
                                min={1}
                                max={7}
                                minFractionDigits={0}
                                maxFractionDigits={0}
                                useGrouping={false}
                                className="w-full"
                            />
                            <small className="text-slate-500">Enter a value between 1 and 7.</small>
                            {errors.training_days_per_week && <small className="text-red-600">{errors.training_days_per_week}</small>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
                                Notes
                            </label>
                            <InputTextarea
                                id="notes"
                                value={data.notes}
                                onChange={(event) => setData('notes', event.target.value)}
                                rows={4}
                                autoResize
                            />
                            {errors.notes && <small className="text-red-600">{errors.notes}</small>}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button type="submit" label="Save profile" loading={processing} className="w-full sm:min-w-44" />
                            <Link href="/" className="w-full sm:w-auto">
                                <Button
                                    type="button"
                                    label="Back to Dashboard"
                                    severity="secondary"
                                    outlined
                                    className="w-full sm:min-w-44"
                                />
                            </Link>
                        </div>
                    </form>
                </Card>
            </main>
        </>
    );
};

export default Edit;
