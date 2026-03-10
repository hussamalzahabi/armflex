import { Head, router, useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { RadioButton } from 'primereact/radiobutton';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import AppLayout from '@/Layouts/AppLayout';
import { useTheme } from '@/hooks/useTheme';

const dominantArmOptions = [
    { label: 'Right', value: 'right' },
    { label: 'Left', value: 'left' },
];

const experienceOptions = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
];

const Edit = ({ profile, styleOptions, equipmentCategories, selectedEquipmentIds }) => {
    const toast = useRef(null);
    const { isDark } = useTheme();
    const labelClass = `block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`;
    const resolvedStyleOptions = styleOptions ?? [];
    const { data, setData, put, processing, errors } = useForm({
        dominant_arm: profile?.dominant_arm ?? 'right',
        experience_level: profile?.experience_level ?? 'beginner',
        style_id: profile?.style_id ?? null,
        weight_kg: profile?.weight_kg ? Number(profile.weight_kg) : null,
        training_days_per_week: profile?.training_days_per_week ?? null,
        notes: profile?.notes ?? '',
        equipment_ids: selectedEquipmentIds ?? [],
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

    const toggleEquipment = (equipmentId) => {
        const isSelected = data.equipment_ids.includes(equipmentId);

        if (isSelected) {
            setData(
                'equipment_ids',
                data.equipment_ids.filter((id) => id !== equipmentId)
            );
            return;
        }

        setData('equipment_ids', [...data.equipment_ids, equipmentId]);
    };

    const equipmentItemError = Object.keys(errors).find((key) => key.startsWith('equipment_ids.'));
    const profileBreadcrumb = [
        {
            label: 'Dashboard',
            command: () => router.visit('/'),
        },
        {
            label: 'Profile',
        },
    ];

    return (
        <>
            <Head title="Training Profile" />
            <Toast ref={toast} />
            <AppLayout title="Training Profile">
                <div className="w-full lg:max-w-[1240px] lg:mr-auto">
                    <section
                        className={`mb-2 rounded-t-3xl px-6 py-4 ${
                            isDark ? 'bg-slate-800/90 text-slate-100' : 'bg-white text-slate-900'
                        }`}
                    >
                        <BreadCrumb
                            model={profileBreadcrumb}
                            className={`app-breadcrumb app-breadcrumb-pill mt-2 border-0 px-0 py-0 ${isDark ? 'app-breadcrumb-dark' : 'app-breadcrumb-light'}`}
                        />
                    </section>
                    <Card
                        className={`w-full rounded-b-3xl !rounded-t-none !border-0 ${isDark ? 'bg-slate-800 text-slate-100 shadow-xl shadow-black/20' : 'bg-white text-slate-900 shadow-xl shadow-slate-200/70'}`}
                    >
                        <form onSubmit={submit} className="p-fluid space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="dominant_arm" className={labelClass}>
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
                            <label htmlFor="experience_level" className={labelClass}>
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
                            <label className={labelClass}>
                                Style
                            </label>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {resolvedStyleOptions.map((option) => {
                                    const radioId = `style-${option.value}`;
                                    const styleId = Number(option.value);
                                    const isSelected = Number(data.style_id) === styleId;

                                    return (
                                        <label
                                            key={option.value}
                                            htmlFor={radioId}
                                            onClick={() => setData('style_id', styleId)}
                                            className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 ${
                                                isDark
                                                    ? 'border border-slate-600 bg-slate-700 hover:bg-slate-600'
                                                    : 'border border-slate-300 bg-slate-50 hover:bg-slate-100'
                                            }`}
                                        >
                                            <RadioButton
                                                inputId={radioId}
                                                name="style_id"
                                                value={styleId}
                                                checked={isSelected}
                                                onChange={(event) => setData('style_id', Number(event.value))}
                                            />
                                            <span className={`text-sm ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>{option.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.style_id && <small className="text-red-600">{errors.style_id}</small>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="weight_kg" className={labelClass}>
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
                            <label htmlFor="training_days_per_week" className={labelClass}>
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
                            <small className={isDark ? 'text-slate-300' : 'text-slate-500'}>Enter a value between 1 and 7.</small>
                            {errors.training_days_per_week && <small className="text-red-600">{errors.training_days_per_week}</small>}
                        </div>

                        <div className="mt-6 space-y-3">
                            <label className={`block text-base font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                Equipment available
                            </label>
                            <div className="space-y-4">
                                {equipmentCategories.map((category) => (
                                    <div key={category.id} className="space-y-2">
                                        <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{category.name}</p>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            {category.items.map((equipment) => {
                                                const checkboxId = `equipment-${equipment.id}`;
                                                const isSelected = data.equipment_ids.includes(equipment.id);

                                                return (
                                                    <label
                                                        key={equipment.id}
                                                        htmlFor={checkboxId}
                                                        className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 ${
                                                            isDark
                                                                ? 'border border-slate-600 bg-slate-700 hover:bg-slate-600'
                                                                : 'border border-slate-300 bg-slate-50 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <Checkbox
                                                            inputId={checkboxId}
                                                            checked={isSelected}
                                                            onChange={() => toggleEquipment(equipment.id)}
                                                        />
                                                        <span className={`text-sm ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>{equipment.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {errors.equipment_ids && <small className="text-red-600">{errors.equipment_ids}</small>}
                            {equipmentItemError && <small className="text-red-600">{errors[equipmentItemError]}</small>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="notes" className={labelClass}>
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
                            <Button type="submit" label="Save profile" loading={processing} className="w-full sm:w-auto sm:min-w-44" />
                        </div>
                        </form>
                    </Card>
                </div>
            </AppLayout>
        </>
    );
};

export default Edit;
