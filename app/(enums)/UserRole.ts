export enum UserRole {
    SUPER_ADMIN = 0,
    COOP_ADMIN = 1,
    MANAGER = 2,
    COORDINATOR = 3,
    DEFAULT_USER = 4,
    DEALER = 5,
    SALES_REP = 6
}

export function getRoleValue(role: UserRole): number {
    return role;
}

export function getRoleName(value: number): string | undefined {
    return UserRole[value];
}

export function getAllRoles(): string[] {
    return Object.keys(UserRole).filter(key => isNaN(Number(key)));
}