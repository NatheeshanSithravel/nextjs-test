// "use client";

import { handleDecryption } from "./handleEncryption";

export async function getToken() {
    if (typeof window !== "undefined") {
        const session = sessionStorage.getItem("SESSION_ID");
        if (session) {
            const decoded = decodeURI(session);
            const data: any = await handleDecryption(JSON.parse(decoded));
            return data?.token;
        }
    }
    return null;
}

export async function getRole() {
    if (typeof window !== "undefined") {
        const session = sessionStorage.getItem("SESSION_ID");
        if (session) {
            const decoded = decodeURI(session);
            const data: any = await handleDecryption(JSON.parse(decoded));
            return data?.role;
        }
    }
    return null;
}

export async function getUsername() {
    if (typeof window !== "undefined") {
        const session = sessionStorage.getItem("SESSION_ID");
        if (session) {
            const decoded = decodeURI(session);
            const data: any = await handleDecryption(JSON.parse(decoded));
            return data?.username;
        }
    }
    return "";
}

export async function getCompanyID() {
    if (typeof window !== "undefined") {
        const session = sessionStorage.getItem("SESSION_ID");
        if (session) {
            const decoded = decodeURI(session);
            const data: any = await handleDecryption(JSON.parse(decoded));
            return data?.companyId;
        }
    }
    return null;
}
