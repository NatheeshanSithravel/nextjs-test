import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, TextField } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { getCompanyID, getToken } from '@/app/util/UserDataHandler';
import { createBranch, updateBranch } from '@/app/(services)/SFARestClient';

interface Props {
    ///// Common ////////
    view?: boolean;
    edit?: boolean;
    create?: boolean;
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;
    //////// Spceific////////////
    branch?: any;
}


export default function BranchDialog({ branch, view, edit, create, setReload, reload }: Props) {


    //////////////////// Alert ////////////////////////
    const [alert, setAlert] = useState<AlertProp>({
        open: false,
        type: "success",
        message: "",
    });

    ///////////////////// Dialog Controls /////////////////////
    const [open, setopen] = useState(false);
    const [loading, setLoading] = useState(false);


    const closeDialog = () => {
        setopen(false);
        if(create){
            clearInputs();
        }
        setErrors({
            branchCode: false,
            branchName: false,
            addressOne: false,
            addressTwo: false,
            city: false,
        });
        
    };

    const openDialog = () => {
        setopen(true)
    }


    /////////////////// Common Attributes //////////////////
    const [token, settoken] = useState<any>(null);
    const [companyId, setcompanyId] = useState<any>(null);

    useEffect(() => {
        const getData = async () => {
            settoken(await getToken());
            setcompanyId(await getCompanyID());
        };
        getData();
    }, []);

    ///////////////////// Attributes /////////////////////
    const [branchCode, setbranchCode] = useState<any>("");
    const [branchName, setbranchName] = useState<any>("");
    const [addressOne, setaddressOne] = useState<any>("");
    const [addressTwo, setaddressTwo] = useState<any>("");
    const [city, setcity] = useState<any>("");

    ///////////////// ERRORS ///////////////////////

    const [errors, setErrors] = useState({
        branchCode: false,
        branchName: false,
        addressOne: false,
        addressTwo: false,
        city: false,
    });

    //////////////// VALIDATIONS //////////////////
    const validateForm = () => {
        const newErrors = {
            branchCode: !branchCode.trim() || branchCode.length > 50, // Trim spaces before validation
            branchName: !branchName.trim() || branchName.length > 50, 
            addressOne: !addressOne.trim() || addressOne.length > 200,
            addressTwo: addressTwo.length > 200,
            city: !city.trim() || city.length > 50,
        };

        setErrors(newErrors);

        return !Object.values(newErrors).some(error => error);
    };



    ///////////////////// Inits /////////////////////
    useEffect(() => {
        if (branch) {
            setInputs();
        }
    }, [branch]);

    ///////////////////// Helper Methods /////////////////////

    const clearInputs = () => {
        setbranchCode("");
        setbranchName("");
        setaddressOne("");
        setaddressTwo("");
        setcity("");
    };

    const setInputs = () => {
        if (branch) {
            setbranchCode(branch.branchCode || "");
            setbranchName(branch.branchName || "");
            setaddressOne(branch.addressLine1 || "");
            setaddressTwo(branch.addressLine2 || "");
            setcity(branch.city || "");
        }
    }


    ///////////////////// API Calls /////////////////////


    const onCreate = async () => {
        if (!validateForm()) {
            return;
        }

        let branch: any = {
            // companyId: companyId,
            branchCode: branchCode,
            branchName: branchName,
            addressLine1: addressOne,
            addressLine2: addressTwo,
            city: city,
        }


        let res: any = await createBranch(token, branch);
        if (res?.state === 0) {
            setAlert({
                open: true,
                type: "success",
                message: "Branch created successfully",
            });
            clearInputs();
        } else if (res?.state === 1) {
            setAlert({
                open: true,
                type: "error",
                message: res?.responseObject,
            });
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to create the Branch",
            });
        }
    };

    const onUpdate = async () => {
        if (!validateForm()) {
            return;
        }

        branch.branchName = branchName;
        branch.addressLine1 = addressOne;
        branch.addressLine2 = addressTwo;
        branch.city = city


        let res: any = await updateBranch(token, branch);
        if (res?.state === 0) {
            setAlert({
                open: true,
                type: "success",
                message: "Branch updated successfully",
            });
            setTimeout(() => {
                closeDialog();
                setReload(!reload)
            }, 2000);
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to update the Branch",
            });
        }
    };

    return (
        <React.Fragment>
            {create && <PrimaryButton onClick={openDialog} label="ADD" icon={<Add />} />}
            {view && <IconButton onClick={openDialog}><Visibility /></IconButton>}
            {edit && <IconButton onClick={openDialog}><Edit /></IconButton>}

            <Dialog open={open} sx={{ backdropFilter: 'blur(3px)' }} maxWidth='md' fullWidth >
                <GlobalAlert alert={alert} setAlert={setAlert} />

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        {view && 'View Branch'}
                        {create && 'Create Branch'}
                        {edit && 'Update Branch'}
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
                        <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <TextField
                                    value={branchCode || ""}
                                    //onChange={(e) => setbranchCode(e.target.value)}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setbranchCode(value);
                                        // Validate the name in real-time
                                        setErrors(prev => ({
                                            ...prev,
                                            branchCode: !value.trim() || value.length > 50,
                                        }));
                                    }}
                                    label="Branch Code *"
                                    fullWidth
                                    size="small"
                                    error={errors.branchCode}
                                    //helperText={errors.branchCode ? "Branch Code is required" : ""}
                                    helperText={
                                        errors.branchCode
                                            ? !branchCode.trim()
                                                ? "Branch Code is required"
                                                : "Branch Code must not exceed 50 characters"
                                            : ""
                                    }
                                    disabled={view || edit}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <TextField
                                    value={branchName || ""}
                                    //onChange={(e) => setbranchCode(e.target.value)}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setbranchName(value);
                                        // Validate the name in real-time
                                        setErrors(prev => ({
                                            ...prev,
                                            branchName: !value.trim() || value.length > 50,
                                        }));
                                    }}
                                    label="Branch Name *"
                                    fullWidth
                                    size="small"
                                    error={errors.branchName}
                                    //helperText={errors.branchCode ? "Branch Code is required" : ""}
                                    helperText={
                                        errors.branchName
                                            ? !branchName.trim()
                                                ? "Branch Name is required"
                                                : "Branch Name must not exceed 50 characters"
                                            : ""
                                    }
                                    disabled={view}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <TextField
                                    value={addressOne || ""}
                                    //onChange={(e) => setaddressOne(e.target.value)}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setaddressOne(value);
                                        // Validate the name in real-time
                                        setErrors(prev => ({
                                            ...prev,
                                            addressOne: !value.trim() || value.length > 200,
                                        }));
                                    }}
                                    label="Address Line 1 *"
                                    fullWidth
                                    size="small"
                                    error={errors.addressOne}
                                    //helperText={errors.addressOne ? "Address Line 1 is required" : ""}
                                    helperText={
                                        errors.addressOne
                                            ? !addressOne.trim()
                                                ? "Address Line 1 is required"
                                                : "Address Line 1 must not exceed 200 characters"
                                            : ""
                                    }
                                    disabled={view}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <TextField
                                    value={addressTwo || ""}
                                    //onChange={(e) => setaddressTwo(e.target.value)}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setaddressTwo(value);
                                        // Validate the name in real-time
                                        setErrors(prev => ({
                                            ...prev,
                                            addressTwo: value.length > 200,
                                        }));
                                    }}
                                    label="Address Line 2 "
                                    fullWidth
                                    size="small"
                                    error={errors.addressTwo}
                                    //helperText={errors.addressTwo ? "Address Line 2 is required" : ""}
                                    helperText={
                                        errors.addressTwo
                                            ? !addressTwo.trim()
                                                ? "Address Line 2 is required"
                                                : "Address Line 2 must not exceed 200 characters"
                                            : ""
                                    }
                                    disabled={view}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <TextField
                                    value={city || ""}
                                    //onChange={(e) => setcity(e.target.value)}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setcity(value);
                                        // Validate the name in real-time
                                        setErrors(prev => ({
                                            ...prev,
                                            city: !value.trim() || value.length > 50,
                                        }));
                                    }}
                                    label="City *"
                                    fullWidth
                                    size="small"
                                    error={errors.city}
                                    //helperText={errors.city ? "City is required" : ""}
                                    helperText={
                                        errors.city
                                            ? !city.trim()
                                                ? "City is required"
                                                : "City must not exceed 50 characters"
                                            : ""
                                    }
                                    disabled={view}
                                />
                            </Grid2>
                        </Grid2>
                        <Stack alignItems={"end"} mt={2} flexDirection={'row-reverse'} gap={1}>
                            {loading ? <CircularProgress color="secondary" /> :
                                <React.Fragment>
                                    {create && <PrimaryButton onClick={onCreate} label='Create' />}
                                    {edit && <PrimaryButton onClick={onUpdate} label='Save' />}
                                </React.Fragment>
                            }
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
        </React.Fragment >
    );
}
