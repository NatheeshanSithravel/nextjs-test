import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import { deleteUser } from '@/app/(services)/SFARestClient';
import { getToken, getUsername } from '@/app/util/UserDataHandler';
import { Close, Delete } from '@mui/icons-material';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react'

interface Props {
    user: any;
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;
}

export default function DeleteUserDialog({ user, setReload, reload }: Props) {

    /////////////////// Common Attributes //////////////////
    const [token, settoken] = useState<any>(null);
    const [username, setUsername] = useState<any>(null);

    useEffect(() => {
        const getData = async () => {
            settoken(await getToken());
            setUsername(await getUsername())
        };
        getData();
    }, []);

    ///////////////////// Dialog Controls /////////////////////
    const [open, setopen] = useState(false);
    const [loading, setLoading] = useState(false);

    const closeDialog = () => {
        setopen(false)
    }

    const openDialog = () => {
        setopen(true)
    }


    //////////////////// Alert ////////////////////////
    const [alert, setAlert] = useState<AlertProp>({
        open: false,
        type: "success",
        message: "",
    });


    const onDelete = async () => {
        setLoading(true);
        const request: any = {
            userId: user.id,
            isPermanant: true,
            reposiblePerson: username
        };
        try {
            const res = await deleteUser(token, request);
            if (res?.state === 0) {
                setAlert({
                    open: true,
                    type: "success",
                    message: "User deleted successfully",
                });
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: "Failed to delete the user",
                });
            }
        } catch (error) {
            setAlert({
                open: true,
                type: "error",
                message: "An error occurred while deleting the user",
            });
        } finally {
            setLoading(false);
            setTimeout(() => { closeDialog(); setReload(!reload) }, 3000); // Ensure timeout runs after the API call completes
        }
    };


    return (
        <React.Fragment>

            <IconButton onClick={openDialog}><Delete /></IconButton>

            <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
                <GlobalAlert alert={alert} setAlert={setAlert} />

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        Confirmation
                    </DialogTitle>
                    <DialogActions>
                        <IconButton onClick={closeDialog}>
                            <Close />
                        </IconButton>
                    </DialogActions>
                </Stack>
                <Divider />
                <DialogContent>
                    <Stack>
                        <Typography></Typography>
                        Are you sure, you want to remove the user ?
                        <Stack alignItems={"end"} mt={2} flexDirection={'row-reverse'} gap={1}>

                            {loading ? <CircularProgress color="secondary" /> :
                                <React.Fragment>
                                    <PrimaryButton onClick={onDelete} label='Yes' />
                                    <PrimaryButton onClick={closeDialog} label='No' />
                                </React.Fragment>
                            }

                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}
