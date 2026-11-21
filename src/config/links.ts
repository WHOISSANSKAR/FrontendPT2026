// changes done by vb: address of the public landing page ("Back to home" on the login / sign-up page).
// Override per environment with VITE_LANDING_URL, e.g. VITE_LANDING_URL=https://pseudoteam.com
export const LANDING_URL: string = import.meta.env.VITE_LANDING_URL || 'http://localhost:5173/';
