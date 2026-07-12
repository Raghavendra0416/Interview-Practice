import { useForm } from "react-hook-form";
import './form-playground.css'

// Inner form — remounted via `key` whenever mode changes,
// since RHF's `mode` is fixed at useForm() init time.
function PracticeForm({ mode }) {
    const {
        register,
        handleSubmit,
        watch,
        trigger,
        clearErrors,
        setError,
        setValue,
        getValues,
        reset,
        resetField,
        formState: { errors, isDirty, dirtyFields, touchedFields, isSubmitting, isValid }
    } = useForm({
        mode,
        defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    });

    // watch(): live values, re-renders this component on every change
    const watchedPassword = watch('password');
    const watchedAll = watch(); // watching everything, for the debug panel

    const onSubmit = (data) => {
        console.log('Form submitted:', data);
    };

    // getValues(): reads current values WITHOUT subscribing/re-rendering
    const handleGetValues = () => {
        console.log('getValues() snapshot:', getValues());
        alert(JSON.stringify(getValues(), null, 2));
    };

    // setValue(): imperatively set one field's value
    const handleFillName = () => {
        setValue('name', 'Raghu', { shouldValidate: true, shouldDirty: true });
    };

    // trigger(): manually run validation — single field or whole form
    const handleTriggerEmail = () => trigger('email');
    const handleTriggerAll = () => trigger();

    // clearErrors(): wipe validation errors without changing values
    const handleClearErrors = () => clearErrors();

    // setError(): manually inject an error RHF didn't generate itself
    // (e.g. a server response like "email already taken")
    const handleSetServerError = () => {
        setError('email', { type: 'server', message: 'Email already registered (manual)' });
    };

    // resetField(): reset ONE field back to its defaultValue, clears its error/dirty/touched state
    const handleResetEmail = () => resetField('email');

    // reset(): reset the ENTIRE form back to defaultValues (or pass new values)
    const handleResetAll = () => reset();

    return (
        <div className="fp-container">

            {/* Live debug panel */}
            <div className="fp-debug">
                <h3>Live formState</h3>
                <pre>{JSON.stringify({
                    isDirty,
                    dirtyFields,
                    touchedFields,
                    isValid,
                    isSubmitting,
                    watchedValues: watchedAll,
                }, null, 2)}</pre>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="fp-form">

                <div className="fp-field">
                    <label htmlFor="name">Name</label>
                    <input id="name" type="text" placeholder="Your name"
                        {...register('name', { required: 'Name is required' })} />
                    {errors.name && <span className="fp-error">{errors.name.message}</span>}
                </div>

                <div className="fp-field">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" placeholder="example@gmail.com"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' }
                        })} />
                    {errors.email && <span className="fp-error">{errors.email.message}</span>}
                </div>

                <div className="fp-field">
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" placeholder="********"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: { value: 6, message: 'Min 6 characters' }
                        })} />
                    {errors.password && <span className="fp-error">{errors.password.message}</span>}
                </div>

                <div className="fp-field">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input id="confirmPassword" type="password" placeholder="********"
                        {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) => value === watchedPassword || 'Passwords do not match'
                        })} />
                    {errors.confirmPassword && <span className="fp-error">{errors.confirmPassword.message}</span>}
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>

            {/* Action buttons — each maps to one API you're practicing */}
            <div className="fp-actions">
                <button type="button" onClick={handleFillName}>setValue: fill name</button>
                <button type="button" onClick={handleGetValues}>getValues: snapshot</button>
                <button type="button" onClick={handleTriggerEmail}>trigger: validate email</button>
                <button type="button" onClick={handleTriggerAll}>trigger: validate all</button>
                <button type="button" onClick={handleClearErrors}>clearErrors: wipe all</button>
                <button type="button" onClick={handleSetServerError}>setError: fake server error on email</button>
                <button type="button" onClick={handleResetEmail}>resetField: email only</button>
                <button type="button" onClick={handleResetAll}>reset: whole form</button>
            </div>
        </div>
    );
}

export default PracticeForm;