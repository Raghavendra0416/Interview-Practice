import "./form.css";

import { useForm } from 'react-hook-form';

function BasicForm() {
    const { register, handleSubmit, formState: { errors }, watch, setValue,
        getValues, reset, control } = useForm({
            defaultValues: { email: '', password: '' }
        });


    const onSubmit = (data) => console.log(data);
    return <>
        <h1>Basic Form</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div>
                <label htmlFor="email">Email:</label>
                <input id="email" placeholder="Email"
                    {...register('email', {
                        required: 'Email is required', pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address'
                        }
                    })}
                />
                {/* Error Message */}
                {errors.email && <p>{errors.email.message}</p>}
            </div>


            {/* Password */}
            <div>
                <label htmlFor="password">Password:</label>
                <input id="password" placeholder="Password"
                    {...register('password', {
                        required: 'Password is Required',
                        validate: (value) => {
                            if (value.length < 5) {
                                return "Username must be at least 5 characters";
                            }
                            return true;
                        },
                    },)}
                />
                {/* Error Message */}
                {errors.password && <p>{errors.password.message}</p>}
            </div>



            {/* Submit */}
            <button type="submit">Submit</button>


        </form>
    </>
}

export default BasicForm;