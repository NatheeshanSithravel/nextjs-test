import { Alert, Snackbar } from '@mui/material'
import React, { Dispatch, SetStateAction, useState } from 'react'
import AlertProp from './AlertProp';


interface Props {
    alert : AlertProp
    setAlert :  Dispatch<SetStateAction<AlertProp>>;
}

export default function GlobalAlert({alert, setAlert } : Props) {
    const handleAlertClose = () => {
        setAlert({ ...alert, open: false });
    };

    return (
        <Snackbar
            open={alert.open}
            autoHideDuration={3000}
            onClose={handleAlertClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
            <Alert
                onClose={handleAlertClose}
                severity={alert.type}
                sx={{ width: "100%" }}
            >
                {alert.message}
            </Alert>
        </Snackbar>
    )
}
