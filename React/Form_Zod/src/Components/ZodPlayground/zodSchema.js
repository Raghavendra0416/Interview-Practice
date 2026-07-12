import { z } from 'zod'

// ── Primitive types ────────────────────────────────────────────
// string, number, boolean, date — each with a custom error message

const nameSchema = z.string({
    required_error: "Name is required", // custom error message
}).min(2, "Name must be at least 2 characters");

const ageSchema = z.number({
    required_error: "Age is required",
    invalid_type_error: "Age must be a number", // fires if user types letters
}).min(18, "You must be at least 18");

const subscribedSchema = z.boolean({
    required_error: "Please select yes or no",
});

const birthDateSchema = z.date({
    required_error: "Birth date is required",
    invalid_type_error: "That's not a valid date",
});

// ── Optional vs Nullable — commonly confused, so both are here ──
// optional(): field can be `undefined` (key can be missing entirely)
const nicknameSchema = z.string().optional();

// nullable(): field can be `null` (key must exist, but value can be null)
const middleNameSchema = z.string().nullable();

// You can combine both if a field can be missing OR explicitly null
const bioSchema = z.string().optional().nullable();

// ── Default values ───────────────────────────────────────────
// If the field is undefined, Zod fills in this default automatically
const countrySchema = z.string().default("India");

// ── Refinements ─────────────────────────────────────────────
// refine(): custom validation logic on a SINGLE field
const passwordSchema = z.string()
    .min(6, "Password must be at least 6 characters")
    .refine((val) => /[A-Z]/.test(val), {
        message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => /[0-9]/.test(val), {
        message: "Password must contain at least one number",
    });

// ── Object schema ───────────────────────────────────────────
// Combines everything above into one schema for the whole form
export const signupSchema = z.object({
    name: nameSchema,
    age: ageSchema,
    subscribed: subscribedSchema,
    birthDate: birthDateSchema,
    nickname: nicknameSchema,
    middleName: middleNameSchema,
    bio: bioSchema,
    country: countrySchema,
    password: passwordSchema,
    confirmPassword: z.string(),

    // ── Array schema ─────────────────────────────────────────
    // array of strings, must have at least 1 item
    hobbies: z.array(z.string()).min(1, "Pick at least one hobby"),

}).superRefine((data, ctx) => {
    // ── superRefine ──────────────────────────────────────────
    // Use this over refine() when:
    //   1. You need to validate MULTIPLE fields together (cross-field)
    //   2. You need to attach the error to a SPECIFIC field (via `path`)
    //   3. You need more than one issue reported at once
    //
    // refine() at the object level can only report ONE combined error
    // with no clean way to target which field it belongs to.
    // superRefine gives you ctx.addIssue() for full control.

    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Passwords do not match",
            path: ["confirmPassword"], // attaches error to this exact field
        });
    }

    if (data.age < 18 && data.subscribed === true) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Must be 18+ to subscribe",
            path: ["subscribed"],
        });
    }
});