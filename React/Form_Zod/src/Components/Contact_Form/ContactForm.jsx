import './contact-form.css'
import { useForm } from 'react-hook-form'

function ContactForm() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            fullName: '',
            email: '',
            message: '',
        },
    });

    const onSubmit = (data) => console.log(data);

    return <div className="cf-page">
        <div className="cf-container">
            <h1>Contact Us</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="cf-form">

                <div className="cf-field">
                    <label htmlFor="fullName">Full Name</label>
                    <input id="fullName" type="text"
                        placeholder="John Doe"
                        {...register("fullName", { required: "Full name is required" })} />
                    {errors.fullName && <span className="cf-error">{errors.fullName.message}</span>}
                </div>

                <div className="cf-field">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email"
                        placeholder="example@gmail.com"
                        {...register("email", { required: "Email is required" })} />
                    {errors.email && <span className="cf-error">{errors.email.message}</span>}
                </div>

                <div className="cf-field">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" rows="4"
                        placeholder="Your message..."
                        {...register("message", { required: "Message cannot be empty" })} />
                    {errors.message && <span className="cf-error">{errors.message.message}</span>}
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    </div>
}

export default ContactForm;