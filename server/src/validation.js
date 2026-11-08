const { z } = require('zod');

const TITLE_MAX = 200;
const USERNAME_MAX = 50;
const PASSWORD_MIN = 6;
// bcrypt silently ignores bytes past 72, so longer passwords would give a false sense of security.
const PASSWORD_MAX = 72;

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['pending', 'completed'];

const titleRequired = 'title is required and cannot be empty or whitespace-only';

const title = z
  .string({ error: titleRequired })
  .trim()
  .min(1, titleRequired)
  .max(TITLE_MAX, `title must be at most ${TITLE_MAX} characters`);

const priority = z.enum(PRIORITIES, { error: `priority must be one of: ${PRIORITIES.join(', ')}` });

const schemas = {
  idParams: z.object({
    id: z.coerce.number({ error: 'id must be a positive integer' }).int('id must be a positive integer').positive('id must be a positive integer'),
  }),
  createTask: z.object({ title, priority: priority.nullish() }),
  updateTask: z.object({ title }),
  taskStatus: z.object({
    status: z.enum(STATUSES, { error: `status must be one of: ${STATUSES.join(', ')}` }),
  }),
  taskPriority: z.object({ priority }),
  register: z.object({
    email: z
      .string({ error: 'email is required and cannot be empty' })
      .trim()
      .toLowerCase()
      .min(1, 'email is required and cannot be empty')
      .pipe(z.email('email must be a valid email address')),
    username: z
      .string({ error: 'username is required and cannot be empty or whitespace-only' })
      .trim()
      .min(1, 'username is required and cannot be empty or whitespace-only')
      .max(USERNAME_MAX, `username must be at most ${USERNAME_MAX} characters`),
    password: z
      .string({ error: `password must be at least ${PASSWORD_MIN} characters` })
      .min(PASSWORD_MIN, `password must be at least ${PASSWORD_MIN} characters`)
      .max(PASSWORD_MAX, `password must be at most ${PASSWORD_MAX} characters`),
  }),
  login: z.object({
    email: z.string({ error: 'email is required' }).trim().min(1, 'email is required'),
    password: z.string({ error: 'password is required' }).min(1, 'password is required'),
  }),
};

// Express middleware: validates req.params / req.body against the given zod schemas,
// answering 400 with the first issue's message, and replaces them with the parsed values.
function validate({ params, body }) {
  return (req, res, next) => {
    for (const [key, schema] of [['params', params], ['body', body]]) {
      if (!schema) continue;
      const result = schema.safeParse(req[key] ?? {});
      if (!result.success) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }
      req[key] = result.data;
    }
    next();
  };
}

module.exports = { schemas, validate, TITLE_MAX, USERNAME_MAX, PASSWORD_MIN, PASSWORD_MAX };
