import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import { deleteCompany, deleteUser } from '@/app/(services)/SFARestClient';
import { getToken } from '@/app/util/UserDataHandler';
import { Close, Delete } from '@mui/icons-material';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react'

interface Props {
    company: any;
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;
}

export default function DeleteCompanyDialog({ company, setReload, reload }: Props) {

    /////////////////// Common Attributes //////////////////
    const [token, settoken] = useState<any>(null);
    const [username, setUsername] = useState<any>(null);

    // useLayoutEffect(() => {
    //     if (typeof window !== "undefined") {
    //         settoken(sessionStorage.getItem("token"))
    //         setUsername(sessionStorage.getItem("username"))
    //     }
    // }, []);

    useEffect(() => {
        const getData = async () => {
            settoken(await getToken());
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

        try {
            const res = await deleteCompany(token, company);
            if (res?.state === 0) {
                setAlert({
                    open: true,
                    type: "success",
                    message: "Company deleted successfully",
                });
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: "Failed to delete the Company",
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
                        Are you sure, you want to remove the {company?.companyName} ?
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
