import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { useTheme } from '@/hooks/useTheme';

const Login = () => {
    const { isDark } = useTheme();
    const labelClass = `block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();

        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />
            <main className={`flex min-h-screen items-center justify-center px-4 py-10 ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                <Card
                    title="Sign in"
                    className={`w-full max-w-md ${isDark ? 'border border-slate-700 bg-slate-800 text-slate-100' : 'bg-white text-slate-900'}`}
                >
                    <form onSubmit={submit} className="p-fluid space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className={labelClass}>
                                Email
                            </label>
                            <InputText
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                                className={`w-full ${isDark ? 'border-slate-600 bg-slate-700 text-slate-100' : ''}`}
                                autoComplete="email"
                            />
                            {errors.email && <small className="text-red-600">{errors.email}</small>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className={labelClass}>
                                Password
                            </label>
                            <Password
                                id="password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                feedback={false}
                                toggleMask
                                inputClassName={`w-full ${isDark ? 'border-slate-600 bg-slate-700 text-slate-100' : ''}`}
                                className="w-full"
                                autoComplete="current-password"
                            />
                            {errors.password && <small className="text-red-600">{errors.password}</small>}
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                inputId="remember"
                                checked={data.remember}
                                onChange={(event) => setData('remember', Boolean(event.checked))}
                            />
                            <label htmlFor="remember" className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                Remember me
                            </label>
                        </div>

                        <Button type="submit" label="Login" className="w-full" loading={processing} />
                    </form>

                    <p className={`mt-5 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        No account?{' '}
                        <Link href="/register" className="font-medium text-blue-600 hover:underline">
                            Register
                        </Link>
                    </p>
                </Card>
            </main>
        </>
    );
};

export default Login;
