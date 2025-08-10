import type { Language } from "../i18n";

export type UserModel = {
    id: number;
    username: string;
    email: string;
    avatar: string;
    projects: number[];
    roles: string[];
    lastAccessDate: Date;
    createdDate: Date;
    updatedDate: Date;
    active: boolean;
    preferences: UserPreferences;
    exampleFiles?: ExampleFiles
};

export type UserPreferences = {
    theme: string;
    notifications: boolean;
    language: Language;
    timezone: string;
};

export type ExampleFiles = {
    files: string[];
    filesId?: number[];
    prefered: string;
    lastUpdated: Date;
}
