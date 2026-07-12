import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema } from './zodSchema'
import './zod-playground.css'

const HOBBIES = ['Reading', 'Gaming', 'Cooking', 'Sports'];

function ZodPlayground() {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(signupSchema), // wires Zod into RHF's validation cycle
        defaultValues: {
            name: '',
            age: undefined,
            subscribed: undefined,
            birthDate: undefined,
            nickname: '',
            middleName: '',
            bio: '',
            country: '', // will be overridden by Zod's .default("India") when left empty
            password: '',
            confirmPassword: '',
            hobbies: [],
        },
    });

    const onSubmit = (data) => {
        console.log('Validated data:', data);
        alert('Validation passed! Check console.');
    };

    return (
        <div className="zp-page">
            <div className="zp-container">
                <h1>Zod Playground</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="zp-form">

                    {/* Primitive: string */}
                    <div className="zp-field">
                        <label htmlFor="name">Name (string)</label>
                        <input id="name" type="text" {...register('name')} />
                        {errors.name && <span className="zp-error">{errors.name.message}</span>}
                    </div>

                    {/* Primitive: number — RHF gives strings from inputs by default,
                        so valueAsNumber tells RHF to coerce to a number before Zod sees it */}
                    <div className="zp-field">
                        <label htmlFor="age">Age (number)</label>
                        <input id="age" type="number" {...register('age', { valueAsNumber: true })} />
                        {errors.age && <span className="zp-error">{errors.age.message}</span>}
                    </div>

                    {/* Primitive: boolean */}
                    <div className="zp-field">
                        <label>Subscribed to newsletter? (boolean)</label>
                        <div className="zp-radio-group">
                            <label><input type="radio" value="true" {...register('subscribed', {
                                setValueAs: (v) => v === 'true'
                            })} /> Yes</label>
                            <label><input type="radio" value="false" {...register('subscribed', {
                                setValueAs: (v) => v === 'true'
                            })} /> No</label>
                        </div>
                        {errors.subscribed && <span className="zp-error">{errors.subscribed.message}</span>}
                    </div>

                    {/* Primitive: date — using Controller since native date inputs
                        give strings, and we need a real Date object for Zod's z.date() */}
                    <div className="zp-field">
                        <label htmlFor="birthDate">Birth Date (date)</label>
                        <Controller
                            control={control}
                            name="birthDate"
                            render={({ field }) => (
                                <input
                                    id="birthDate"
                                    type="date"
                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                    value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                />
                            )}
                        />
                        {errors.birthDate && <span className="zp-error">{errors.birthDate.message}</span>}
                    </div>

                    {/* Optional field — can be left blank entirely, no error either way */}
                    <div className="zp-field">
                        <label htmlFor="nickname">Nickname (optional)</label>
                        <input id="nickname" type="text" {...register('nickname')} />
                        {errors.nickname && <span className="zp-error">{errors.nickname.message}</span>}
                    </div>

                    {/* Nullable field — demoing by allowing empty string,
                        in a real form you'd send `null` explicitly when clearing it */}
                    <div className="zp-field">
                        <label htmlFor="middleName">Middle Name (nullable)</label>
                        <input id="middleName" type="text" {...register('middleName')} />
                        {errors.middleName && <span className="zp-error">{errors.middleName.message}</span>}
                    </div>

                    {/* Default value — leave this blank and submit, watch console log "India" */}
                    <div className="zp-field">
                        <label htmlFor="country">Country (default: "India")</label>
                        <input id="country" type="text" placeholder="Leave blank to use default" {...register('country')} />
                        {errors.country && <span className="zp-error">{errors.country.message}</span>}
                    </div>

                    {/* refine() in action — password rules */}
                    <div className="zp-field">
                        <label htmlFor="password">Password (refine x2)</label>
                        <input id="password" type="password" {...register('password')} />
                        {errors.password && <span className="zp-error">{errors.password.message}</span>}
                    </div>

                    {/* superRefine target — cross-field check against password */}
                    <div className="zp-field">
                        <label htmlFor="confirmPassword">Confirm Password (superRefine)</label>
                        <input id="confirmPassword" type="password" {...register('confirmPassword')} />
                        {errors.confirmPassword && <span className="zp-error">{errors.confirmPassword.message}</span>}
                    </div>

                    {/* Array schema — checkboxes feeding a string[] */}
                    <div className="zp-field">
                        <label>Hobbies (array, min 1)</label>
                        <div className="zp-checkbox-group">
                            {HOBBIES.map((hobby) => (
                                <label key={hobby}>
                                    <input type="checkbox" value={hobby} {...register('hobbies')} />
                                    {hobby}
                                </label>
                            ))}
                        </div>
                        {errors.hobbies && <span className="zp-error">{errors.hobbies.message}</span>}
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Validating...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ZodPlayground;