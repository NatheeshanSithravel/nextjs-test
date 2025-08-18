"use client"
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import PageContent from '@/app/(components)/(Page)/PageContent'
import { changePasswordRequest } from '@/app/(services)/SFARestClient';
import { getToken, getUsername } from '@/app/util/UserDataHandler';
import { Grid2, InputLabel, Stack, TextField } from '@mui/material';
import { redirect } from 'next/navigation';
import React, { useEffect, useState } from 'react'

interface ErrorMsg {
    name: string,
    message: string
}

export default function Page() {

    //////////////////// Alert ////////////////////////
    const [alert, setAlert] = useState<AlertProp>({
        open: false,
        type: "success",
        message: "",
    });

    const [reload, setReload] = useState<boolean>(false);
    const [token, settoken] = useState<any>(null);
    const [username, setusername] = useState<any>("");

    useEffect(() => {
        const getData = async () => {
            settoken(await getToken());
            setusername(await getUsername());
        };
        getData();
    }, []);


    //////////////////// Attributes /////////////////////
    const [oldPassword, setoldPassword] = useState<string>("");
    const [newPassword, setnewPassword] = useState<any>("");
    const [confirmedPassword, setconfirmedPassword] = useState<any>("");

    const [errors, setErrors] = useState<Map<string, string | boolean>>(new Map());

    const validateForm = ():boolean => {
        let tempErrors: Map<string, string | boolean> = new Map();

        if (oldPassword.trim().length == 0) {
            tempErrors.set("oldPassword", "Old password cannot be empty")
        }else if (oldPassword.length > 10) {
            tempErrors.set ("oldPassword","Old password cannot exceed 10 characters")
        }

        if (newPassword.trim().length == 0) {
            tempErrors.set("newPassword", "New password cannot be empty")
        }else if (newPassword.length > 10) {
            tempErrors.set ("newPassword","New password cannot exceed 10 characters")
        }

        if (confirmedPassword.trim().length == 0) {
            tempErrors.set("confirmedPassword", "Confirmed password cannot be empty")
        }else if (confirmedPassword.length > 10) {
            tempErrors.set ("confirmedPassword","Confirmed password cannot exceed 10 characters")
        }

        if(newPassword.trim().length != 0 && confirmedPassword.trim().length != 0 && newPassword != confirmedPassword){
            tempErrors.set("confirmedPassword", "Confirmed password does not match the new password")
        }

        setErrors(tempErrors)
        return tempErrors.size == 0;
    }


    const onAction = async () => {
        if(validateForm()){
            const req = {
                tokenString:token,
                userName:username,
                oldPassword:oldPassword,
                newPassword:newPassword
            }

            const res = await changePasswordRequest(token,req);
            if(res?.state == 0){
                setAlert({
                    message:"Modification : Password has been successfully changed. Please login to the system again.",
                    type:'success',
                    open:true
                })

                setTimeout(() => {
                    sessionStorage.clear();
                    redirect("/auth")
                }, 5000);
            } else if(res?.state == 1){
                setAlert({
                    message:"Failure : Old password is incorrect.",
                    type:'error',
                    open:true
                })
            } else {
                setAlert({
                    message:"Failure : Password modification has been failed.",
                    type:'error',
                    open:true
                })
            }
        }
    }

    return (
        <PageContent title='Change Password'>
            <GlobalAlert alert={alert} setAlert={setAlert} />
            <Grid2 container sx={{ width: '100%', justifyContent:'center',alignItems:'center' }} spacing={1}>
                <Grid2 size={{ xs: 12, md: 2 }}>
                    <InputLabel>Username *</InputLabel>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth size='small' value={username} />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                    <InputLabel>Old Password *</InputLabel>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        size='small'
                        value={oldPassword}
                        error={errors.get("oldPassword") ? true : false}
                        helperText={errors.get("oldPassword")}
                        onChange={(e) => setoldPassword(e.target.value)}
                        type='password'
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                    <InputLabel>New Password *</InputLabel>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        size='small'
                        value={newPassword}
                        error={errors.get("newPassword") ? true : false}
                        helperText={errors.get("newPassword")}
                        onChange={(e) => setnewPassword(e.target.value)}
                        type='password'
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                    <InputLabel>Confirmed Password *</InputLabel>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        size='small'
                        value={confirmedPassword}
                        error={errors.get("confirmedPassword") ? true : false}
                        helperText={errors.get("confirmedPassword")}
                        onChange={(e) => setconfirmedPassword(e.target.value)}
                        type='password'
                    />
                </Grid2>
            </Grid2>
            <Stack sx={{ width: '100%' }} direction={{ xs: 'column', md: 'row' }} my={1}>
                <PrimaryButton label='Submit' onClick={onAction} />
            </Stack>
        </PageContent>
    )
}
