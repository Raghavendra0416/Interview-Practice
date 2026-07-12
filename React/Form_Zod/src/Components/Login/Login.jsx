import './login.css'
import { useForm } from 'react-hook-form'

function Login() {
    const { register, handleSubmit, formState: { errors, isSubmitting }, } =
        useForm({
            defaultValues: {
                name: '',
                email: '',
                password: '',
            },
            // mode: 'onSubmit', -> not needed
        });

    const onSubmit = (data) => {
        console.log("Data: ", data);
    }

    return <div className="page">
        <div className="container">
            <h1>Login</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="form">

                <div className="field">
                    <label htmlFor="name">User Name:</label>
                    <input id="name" type="text"
                        placeholder="User Name"
                        // register connects inputs
                        {...register("name", { required: "Name is Required" })} />
                </div>
                {errors.name && <span style={{ color: "red" }} className="error">{errors.name.message}</span>}


                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email"
                        placeholder="example@gmail.com"
                        {...register("email", {
                            required: "Email is Required",
                            pattern: { value: /^\S+@\S+$/, message: 'Invalid email' }
                        })} />
                </div>
                {errors.email && <span style={{ color: "red" }} className="error">{errors.email.message}</span>}


                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password"
                        placeholder="********"
                        {...register("password", {
                            required: "Password is Required for Login",
                            minLength: { value: 8, message: 'Must be at least 8 characters' }
                        })} />
                </div>
                {errors.password && <span style={{ color: "red" }} className="error">{errors.password.message}</span>}


                <button type="submit" disabled={isSubmitting}>Submit</button>
            </form>
        </div>
    </div>
}

export default Login;