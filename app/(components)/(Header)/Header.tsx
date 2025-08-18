"use client";
import { getUsername } from '@/app/util/UserDataHandler';
import { CSSObject } from '@emotion/react';
import { AccountCircle, AccountCircleRounded, LogoutOutlined, Person, PersonOffOutlined, Reorder, Settings } from '@mui/icons-material';
import { Avatar, Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, Paper, Stack, Tooltip, Typography } from '@mui/material'
import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import React, { useEffect, useLayoutEffect, useState } from 'react'

interface Props {
    handleChangeNav:()=>void;
}

const textHoverEffect: CSSObject = {
    margin: '15px',
    color: 'black', // Text color
    fontSize: '18px', // Initial font size
    textDecoration: 'none',
    display: 'inline-block', // To make the border align properly
    position: 'relative', // For positioning the border
    transition: 'transform 0.3s ease, color 0.3s ease', // Smooth size transition
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '-4px', // Position of the border below the text
        left: 0,
        width: 0,
        height: '2px', // Border height
        backgroundColor: '#2abc96', // Border color
        transition: 'width 0.3s ease', // Smooth border transition
    },
    '&:hover': {
        transform: 'scale(1.1)', // Slightly increase size on hover
        '&::after': {
            width: '100%', // Full-width border on hover
        },
    },
};

const activeLink: CSSObject = {
    margin: '15px',
    color: '#2abc96', // Text color
    fontSize: '18px', // Initial font size
    textDecoration: 'none',
    display: 'inline-block', // To make the border align properly
    position: 'relative',
    transform: 'scale(1.1)', // Slightly increase size on hover
    '&::after': {
        width: '100%', // Full-width border on hover
    },// For positioning the border
};



export default function Header({ handleChangeNav }: Props) {
    const pathname = usePathname()
    const [username, setUsername] = useState<any>("");


    // useLayoutEffect(() => {
    //     if (typeof window !== "undefined") {
    //         setUsername(sessionStorage.getItem("username"))
    //     }
    // }, []);

 
     useEffect(() => {
         const getData = async () => {
             setUsername(await getUsername())
         };
         getData();
     }, []);


    /*Menu Item Defining*/
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };


    return (
        <Stack component={Paper} elevation={2} direction="row" justifyContent="space-between" alignItems="center" pl={2} pr={2} pt={1} pb={1}
            sx={{
                backgroundColor: 'rgb(57,163,244)',
                // backgroundColor:'rgb(20,29,38)',
                color: 'white',
                width: '100%',
                zIndex: 3,
                backdropFilter: 'blur(5px)',
                height: '60px',
                borderRadius:'0'
            }}>
            <Stack direction={'row'} spacing={1}>
                <IconButton onClick={handleChangeNav}><Reorder sx={{color:'white'}} /></IconButton>
                {/* <img src='/logo-white.png' height={40} /> */}
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bolder' }}>mDistributor</Typography>
            </Stack>

            <Stack direction="row" spacing={2} display={'flex'} alignItems={'center'}>

                <Tooltip title={""}>
                    <IconButton
                        onClick={handleClick}
                        // size="medium"
                        sx={{ ml: 2, color: 'white' }}
                        aria-controls={open ? "account-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                    >
                        <Person sx={{ fontSize: '30px' }} />
                        {/* <Avatar alt="ADMIN" src="/assets/admin.png" /> */}
                    </IconButton>
                </Tooltip>
                <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    slotProps={{
                        paper: {
                            elevation: 0,
                            sx: {
                                overflow: "visible",
                                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                                mt: 1.5,
                                "& .MuiAvatar-root": {
                                    width: 32,
                                    height: 32,
                                    ml: -0.5,
                                    mr: 1,
                                },
                                "&::before": {
                                    content: '""',
                                    display: "block",
                                    position: "absolute",
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: "background.paper",
                                    transform: "translateY(-50%) rotate(45deg)",
                                    zIndex: 0,
                                },
                            },
                        },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                    <MenuItem onClick={handleClose}>
                        <Avatar /> <Typography>{username}</Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => redirect("/pages/changePassword")}>
                        <ListItemIcon>
                            <Settings fontSize="small" />
                        </ListItemIcon>
                        Change Password
                    </MenuItem>
                    <MenuItem onClick={() => {
                        sessionStorage.clear();
                        redirect("/auth");
                    }}>
                        <ListItemIcon>
                            <LogoutOutlined fontSize="small" />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>

            </Stack>
        </Stack>
    )
}
