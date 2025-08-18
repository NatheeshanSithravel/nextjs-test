"use client"
import { Stack } from "@mui/material";
import Header from "../(components)/(Header)/Header";
import SideNav from "../(components)/(NavBar)/SideNav";
import AppFooter from "../(components)/(Footer)/AppFooter";
import { useEffect, useLayoutEffect, useState } from "react";
import { redirect } from "next/navigation";

export default function PageLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const [visibleNav, setvisibleNav] = useState(true);
    const handleChangeNav = () => {
        setvisibleNav(!visibleNav)
    }

    const [loggedIn, setloggedIn] = useState<boolean>(false);

    useLayoutEffect(() => {
        if (typeof window !== 'undefined') {
            if (sessionStorage.getItem("SESSION_ID") === null) {
                redirect("/auth")
            } else {
                setloggedIn(true)
            }
        }

    }, []);

    /////////// Session time handler /////////////
    const [active, setactive] = useState<boolean>(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            sessionStorage.clear();
            redirect("/auth");
        }, 1000*60*30);

        return () => clearTimeout(timer);
    }, [active]);

    return loggedIn && (

        <Stack onClick={(e) => setactive(!active)} sx={{ height: '100vh' }} overflow={'hidden'}>
            <Header handleChangeNav={handleChangeNav} />
            <Stack direction={'row'} height={'100%'} flex={1} width={'100vw'} sx={{ overflowY: 'scroll' }}>
                <SideNav visibleNav={visibleNav} />
                <Stack sx={{ backgroundColor: 'rgb(238,242,246)', overflowY: 'hidden', width: '100%' }}>
                    {children}
                </Stack>
            </Stack>
            <AppFooter />
        </Stack>
    );
}
