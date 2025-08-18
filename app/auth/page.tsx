"use client"
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import { authenticate } from '@/app/(services)/UserManagementService';
import { Box, Button, CSSObject, Divider, Grid2, Grow, Paper, Slide, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import React, { useState } from 'react'
import { handleDecryption, handleEncryption } from '../util/handleEncryption';
import { getToken } from '../util/UserDataHandler';

export default function LoginPage() {
    const webView = useMediaQuery('(min-width:600px)');
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [alert, setAlert] = useState<AlertProp>({
        open: false,
        type: "success",
        message: "",
    });

    const onSignIn = async () => {
        let data = await authenticate(username, password);
        if (data?.state === 0) {
            setAlert({
                open: true,
                type: "success",
                message: "Login Success",
            });

            // Encryption
            let userData = {
                token:data.responseObject,
                username:data.responseObject?.split(':')[0],
                companyId:data.responseObject?.split(':')[4],
                role:data.responseObject?.split(':')[3]
            }

            let encrypt = await handleEncryption(userData);
            let encodeURL = encodeURI(JSON.stringify(encrypt))

            sessionStorage.setItem("SESSION_ID",encodeURL)
            sessionStorage.setItem("token", data.responseObject);
            sessionStorage.setItem("isLogged", "true");
            sessionStorage.setItem("username", data.responseObject?.split(':')[0]);
            setAlert({ open: true, type: "success", message: "Login Successful!" }); // Show success alert
            setTimeout(() => redirect('/pages/users'), 500); // Redirect after success login
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Incorrect username or password.",
            });
        }
    }


    return (
        <Slide direction="right" in={true} mountOnEnter unmountOnExit>
            <Box sx={{ height: '100vh' }}>
                <GlobalAlert alert={alert} setAlert={setAlert} />
                <Grid2 container sx={{ height: '100%' }}>
                    <Grid2 size={{ xs: 0, md: 4 }} sx={{ height: '100%', backgroundColor: 'rgb(20,29,38)' }}  >
                        <Grow in={true}>
                            <Stack sx={{ color: 'rgb(6,130,152)', height: '100%' }} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Typography variant={'h3'}>Welcome to</Typography>
                                <img src='/mdistributor/logo-white.png' height={80}/>
                                <Divider sx={{ backgroundColor: 'rgba(150, 150, 150, 0.62)', width: '60%', my: 2 }} />
                                <Typography variant='body1' sx={{ fontStyle: 'italic', color: 'white' }}>Powered By</Typography>
                                <Typography variant='h5' sx={{ fontStyle: 'italic', color: 'white', fontWeight:'bold' }}>SLT<span style={{color:'rgb(85, 233, 78)'}}>Mobitel</span></Typography>
                            </Stack>
                        </Grow>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 8 }} sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(255, 255, 255)' }}>
                        <Stack sx={{

                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: 'auto',
                            gap: 2,
                            p: 5,
                            height: '80%',
                            width: '100%',
                            m: 5,
                            maxWidth: '600px',
                            maxHeight: '600px'
                        }}>
            
                            <Typography variant='h3' mb={2}>Sign In</Typography>
                            <Divider sx={{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', width: '80%', m: 2 }} />
                            <TextField
                                sx={[{ maxWidth: '400px', }]}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                variant="outlined"
                                label="Username"
                                fullWidth
                            />
                            <TextField
                                sx={[{ maxWidth: '400px', mb: 2 }]}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                variant="outlined"
                                label="Password"
                                fullWidth
                            />
                            <PrimaryButton label='LOGIN' onClick={onSignIn} />
                            <Divider sx={{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', width: '100%' }} />
                            {/* <Typography variant='body2'>
                                Forgot Password? <Link style={{ textDecoration: 'none' }} href={'/auth/signup'}>

                                </Link>
                            </Typography> */}


                        </Stack>
                    </Grid2>
                </Grid2>
            </Box>
        </Slide>

    )
}


