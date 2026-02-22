export interface MinimalProfile {
    age: number | null | string;
    gender: string | null;
    commune: string | null;
}

export function isProfileComplete(profile: MinimalProfile | null): boolean {
    if (!profile) return false;

    return (
        profile.age !== null &&
        profile.gender !== null &&
        profile.commune !== null
    );
}
