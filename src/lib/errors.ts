import type { UnknownRecord } from "type-fest";

import { inspect } from "node:util";
import { keyIn } from "ts-extras";

const isUnknownRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null;

const hasStringMessage = (
    value: unknown
): value is Readonly<{ message: string }> =>
    isUnknownRecord(value) &&
    keyIn(value, "message") &&
    typeof value["message"] === "string";

const hasStringStack = (value: unknown): value is Readonly<{ stack: string }> =>
    isUnknownRecord(value) &&
    keyIn(value, "stack") &&
    typeof value["stack"] === "string";

/**
 * Convert an unknown caught value into a useful message string.
 */
export const getErrorMessage = (error: unknown): string => {
    if (hasStringMessage(error)) return error.message;
    if (typeof error === "string") return error;
    return inspect(error);
};

/**
 * Return a stack trace when an unknown caught value exposes one.
 */
export const getErrorStack = (error: unknown): string | undefined =>
    hasStringStack(error) ? error.stack : undefined;
