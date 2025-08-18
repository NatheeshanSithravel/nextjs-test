import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, TextField } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addDistributorStore, addUser, findAllAreaHirachy, findRootsByHierarchy, findSupervisorListByRole, getUmBranches, retriewAllROutPlans, retriewUserRoles, updateDisPoint, updateUser } from '@/app/(services)/SFARestClient';
import { getToken } from '@/app/util/UserDataHandler';

interface Props {
    ///// Common ////////
    view?: boolean;
    edit?: boolean;
    create?: boolean;
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;
    //////// Spceific////////////
    dealerList:any[]
    store?: any;
}


export default function StoreDialog({ store, view, edit, create, setReload, reload,dealerList }: Props) {

    
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
        setopen(false)
        if(create){
            clearInputs();
        }
        setErrors({
            sName: false,
            slocation: false,
            sOwner: false,
            sCategory: false,
        });
    }

    const openDialog = () => {
        setopen(true)
    }


    /////////////////// Common Attributes //////////////////
    const [token, settoken] = useState<any>(null);

    useEffect(() => {
        const getData = async () => {
            settoken(await getToken());
        };
        getData();
    }, []);

    ///////////////////// Attributes /////////////////////
    const [sName, setsName] = useState<any>("");
    const [slocation, setslocation] = useState<any>("");
    const [sOwner, setsOwner] = useState<any>("");
    const [sCategory, setsCategorty] = useState<any>("");
    


    ///////////////////// Inits /////////////////////
    useEffect(() => {
        if (store) {
            setInputs();
        }
    }, [store]);

    ///////////////////// Helper Methods /////////////////////

    const clearInputs = () => {
        setsName("")
        setslocation("")
        setsCategorty("")
        setsOwner("")
    };

    const setInputs = () => {
        setsName(store.storeName)
        setslocation(store.storeLocation);
        setsOwner(store.dealerCode);
        setsCategorty(store.storeCategory)
    }




    ///////////////////// API Calls /////////////////////


    const onCreate = async () => {
        if (!validateForm()) return;

        setLoading(true)

        let regionId:any = dealerList.filter(s=>s.id == sOwner)[0].region;
        let newStore:any = {
            regionId:regionId,
            storeName:sName,
            storeLocation:slocation,
            storeCategory:sCategory,
            dealerCode:sOwner
        }

        let request: any = {
            disPoints:newStore,
            tokenString:token
        }
        setReload(!reload)

        let res: any = await addDistributorStore(token, request);
        if (res.success === true) {
            setAlert({
                open: true,
                type: "success",
                message: "Store created successfully",
            });
            setReload(!reload)
            clearInputs();
            setLoading(false)
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to create the store",
            });
            setLoading(false)
        }
    };

    const onUpdate = async () => {

        if (!validateForm()) return;

        setLoading(true)

        let regionId:any = dealerList.filter(s=>s.id == sOwner)[0].region;

        store.regionId=regionId,
        store.storeName=sName,
        store.storeLocation=slocation,
        store.storeCategory=sCategory,
        store.dealerCode=sOwner

        let request: any = {
            disPoints:store,
            tokenString:token
        }
        
        let res = await updateDisPoint(token, request);
        if (res?.success === true) {
            setAlert({
                open: true,
                type: "success",
                message: "Store updated successfully",
            });
            setReload(!reload)
            setLoading(false)
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to update store",
            });
            setLoading(false)
        }
    };

    ////////////////// ERRORS ////////////////
    const [errors, setErrors] = useState({
        sName: false,
        slocation: false,
        sOwner: false,
        sCategory: false,
    });
    
    // Validation function
    const validateForm = () => {
        const newErrors = {
            sName: !sName.trim() || sName.length > 20,
            slocation: !slocation.trim() || slocation.length > 20,
            sOwner: !sOwner,
            sCategory: !sCategory, 
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };


    return (
        <React.Fragment>
            {create && <PrimaryButton onClick={openDialog} label="ADD" icon={<Add />} />}
            {view && <IconButton onClick={openDialog}><Visibility /></IconButton>}
            {edit && <IconButton onClick={openDialog}><Edit /></IconButton>}

            <Dialog open={open} sx={{ backdropFilter: 'blur(3px)' }} maxWidth='md' >
                <GlobalAlert alert={alert} setAlert={setAlert} />

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        {view && 'View Dealer Store'}
                        {create && 'Create Dealer Store'}
                        {edit && 'Update Dealer Store'}
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
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={sName || ""}
                                    //onChange={(e) => setsName(e.target.value)}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setsName(value);
                                        // Validate the name in real-time
                                        setErrors(prev => ({
                                            ...prev,
                                            sName: !value.trim() || value.length > 20,
                                        }));
                                    }}
                                    disabled={view}
                                    label="Store Name*"
                                    fullWidth
                                    size="small"
                                    error={errors.sName}
                                    //helperText={errors.sName ? "Store name is required" : ""}
                                    helperText={
                                        errors.sName
                                            ? !sName.trim()
                                                ? "Store Name is required"
                                                : "Store Name must be 20 characters"
                                            : ""
                                    }
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        value={slocation || ""}
                                        //onChange={(e) => setslocation(e.target.value)}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setslocation(value);
                                            // Validate the name in real-time
                                            setErrors(prev => ({
                                                ...prev,
                                                slocation: !value.trim() || value.length > 20,
                                            }));
                                        }}
                                        disabled={view}
                                        label="Store Location*"
                                        fullWidth
                                        size="small"
                                        error={errors.slocation}
                                        //helperText={errors.slocation ? "Store location is required" : ""}
                                        helperText={
                                            errors.slocation
                                                ? !slocation.trim()
                                                    ? "Store Location is required"
                                                    : "Store Location must be 20 characters"
                                                : ""
                                        }
                                    />
                                </Grid2>
                            
                            
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small" disabled={view || edit} error={errors.sOwner}>
                                    <InputLabel>Owner Name*</InputLabel>
                                    <Select
                                        label="Owner Name*"
                                        value={sOwner || ""}
                                        variant="outlined"
                                        onChange={(e) => setsOwner(e.target.value)}
                                    >
                                        {dealerList?.map(
                                            item => <MenuItem key={item.id} value={item.id}>{item.userName}</MenuItem>
                                        )}

                                    </Select>
                                    <FormHelperText>
                                    {errors.sOwner && <span>Owner is required</span>}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small" disabled={view || edit} error={errors.sCategory}>
                                    <InputLabel>Store Category*</InputLabel>
                                    <Select
                                        label="Store Category*"
                                        value={sCategory || ""}
                                        variant="outlined"
                                        onChange={(e) => setsCategorty(e.target.value)}
                                    >
                                        <MenuItem  value={'DealerStore'}>Dealer Store</MenuItem>
                                        <MenuItem  value={'SubDealerStore'}>Sub Dealer Store</MenuItem>
                                        <MenuItem  value={'Vehicle'}>Vehicle</MenuItem>

                                    </Select>
                                    <FormHelperText>
                                    {errors.sCategory && <span>Category is required</span>}
                                    </FormHelperText>
                                </FormControl>
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
