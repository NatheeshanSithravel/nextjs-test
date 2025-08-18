"use client"
import { redirect } from 'next/navigation';
import React, { useLayoutEffect } from 'react'

export default function page() {
    useLayoutEffect(() => {
        if (typeof window !== 'undefined') {
            if (sessionStorage.getItem("SESSION_ID") === null) {
                redirect("/auth")
            } else {
                redirect("/pages/dashboard")
            }
        }

    }, []);
    return null;
}