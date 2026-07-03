/**
 * Greet a user by name.
 */
export const greet = (name: string): void => {
    process.stdout.write(`Hello ${name}!\n`);
};
