# Environment Configuration Guide

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update the values in `.env.local` with your actual configuration

3. **IMPORTANT**: Never commit `.env.local` to version control. It contains sensitive information.

## Environment Variables

This application uses the following environment variables:

### Server Configuration

- **`NODE_ENV`**: Node environment (development, production, test)
  - Default: `development`

### Database Configuration

- **`NEXT_PUBLIC_SUPABASE_URL`**: Supabase project URL (for client apps)
  - Default: `https://your-project-id.supabase.co`

- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Supabase anonymous/public key (for client apps)
  - Default: `your-supabase-anon-key`

- **`SUPABASE_SERVICE_ROLE_KEY`**: Supabase service role key (server-side only, for client apps)
  - Default: `your-supabase-service-role-key`

- **`SUPABASE_PROJECT_ID`**: Supabase project ID (for client apps)
  - Default: `your-project-id`

### Auth Configuration

- **`JWT_SECRET`**: Secret key for JWT token generation
  - Default: `your-super-secret-jwt-key-change-this-in-production`

### Nextjs Configuration

- **`NEXT_PUBLIC_APP_NAME`**: Application name (exposed to client)
  - Default: `Your App Name`

### Additional Configuration

- **`note`**: Configuration variable

## Security Notes

- **Never** commit `.env.local` or `.env` files to version control
- The `.env.example` file should be committed as a template
- Use strong, unique values for all secret keys
- Rotate secrets regularly in production environments
- Use environment-specific values (development, staging, production)

## Next.js Environment Variables

Next.js has special handling for environment variables:

- **Server-side only**: Regular environment variables (e.g., `JWT_SECRET`)
- **Client-side**: Variables prefixed with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_API_URL`)

Only `NEXT_PUBLIC_` prefixed variables are exposed to the browser. Keep sensitive data in server-side only variables.

## Loading Environment Variables

Next.js automatically loads environment variables from:
1. `.env.local` (local development, ignored by git)
2. `.env` (default values, can be committed)
3. `.env.production` (production environment)
4. `.env.development` (development environment)

Priority: `.env.local` > `.env.{environment}` > `.env`

## Troubleshooting

If environment variables are not working:

1. Restart the development server after changing `.env.local`
2. Verify the variable name is correct (case-sensitive)
3. For client-side variables, ensure they have the `NEXT_PUBLIC_` prefix
4. Check that `.env.local` is in the root directory of your project

## Resources

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [Node.js Environment Variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
