import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, TextField } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addDistributorStore, addUser, createRoutePlan, findAllAreaHirachy, findRootsByHierarchy, findSupervisorListByRole, getUmBranches, retriewAllROutPlans, retriewUserRoles, updateDisPoint, updateRootPlanById, updateUser } from '@/app/(services)/SFARestClient';
import { getCompanyID, getToken } from '@/app/util/UserDataHandler';

interface Props {
    ///// Common ////////
    view?: boolean;
    edit?: boolean;
    create?: boolean;
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;
    //////// Spceific////////////
    parent?: any;
    hierarchyMap?: Map<number, string>;
}

interface FieldErrors {
    areaCategory: string;
    name: string;
    
}

export default function RootPlanDialog({ parent, hierarchyMap, view, edit, create, setReload, reload }: Props) {

    /////////////////// New Validation /////////////////////
    const initialErrors: FieldErrors = {
        areaCategory: "",
        name: ""
    }

    const [fieldErrors, setfieldErrors] = useState<FieldErrors>({ ...initialErrors });

    const validateEditForm = () => {
        const newErrors: Partial<FieldErrors> = {};
       // setfieldErrors(initialErrors);
   
        if (!name) {
            newErrors.name = "Name cannot be empty";
        } else if (name.trim().length == 0) {
            newErrors.name = "Name cannot be empty";
        } else if (name.length > 200) {
            newErrors.name = "Name cannot exceed 200 characters"
        }

        setfieldErrors((prevErrors) => ({
            ...prevErrors,
            ...newErrors,
        }));

        return Object.keys(newErrors).length === 0;
    }

    const validateForm = () => {
        const newErrors: Partial<FieldErrors> = {};
        setfieldErrors(initialErrors);
       
        if (!areaCategory) {
            newErrors.areaCategory = "Area category cannot be empty";
        }

   
        if (!name) {
            newErrors.name = "Name cannot be empty";
        } else if (name.trim().length == 0) {
            newErrors.name = "Name cannot be empty";
        } else if (name.length > 200) {
            newErrors.name = "Name cannot exceed 200 characters"
        }

        setfieldErrors((prevErrors) => ({
            ...prevErrors,
            ...newErrors,
        }));

        return Object.keys(newErrors).length === 0;
    }

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
        if (create) {
            setfieldErrors(initialErrors)
            clearInputs();
        }

    }

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
    const [areaCategory, setareaCategory] = useState<any>("");
    const [name, setname] = useState<string>("");
    const [selectedParent, setselectedParent] = useState<any>("");



    ///////////////////// Inits /////////////////////
    useEffect(() => {
        if (parent) {
            setInputs();
        }
    }, [parent]);

    ///////////////////// Helper Methods /////////////////////

    const clearInputs = () => {
        setname('')
        setareaCategory('')
    };

    const setInputs = () => {
        if (create === true) {
            setname("")
        } else {
            setname(parent.rootName)
        }
        if (parent?.rootName) {
            setselectedParent(parent?.rootName + ` (${hierarchyMap?.get(parent?.areaHierachy)})`)
        } else {
            setselectedParent("None")
        }

    }




    ///////////////////// API Calls /////////////////////


    const onCreate = async () => {

        if (!validateForm()) {
            return;
        }

        setLoading(true)
        let cfgRootPlan: any = {
            ID: null,
            rootPlanId: null,
            companyID: companyId,
            rootName: name,
            rootParentID: parent?.id ? parent.id : 0,
            areaHierachy: areaCategory,
            status: 1,
        }
        let request: any = {
            cfgRootPlan: cfgRootPlan,
            tokenString: token
        }
        setReload(!reload)

        let res: any = await createRoutePlan(token, request);
        if (res.success === true) {
            setAlert({
                open: true,
                type: "success",
                message: "Location Boundary created successfully",
            });
            setReload(!reload)
            clearInputs();
            setLoading(false)
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to create the Location Boundary",
            });
            setLoading(false)
        }
    };

    const onUpdate = async () => {

        // if (!validateForm()) {
        //     return;
        // }
        //created seperate function for edit option due to areaCategory null issue
        if (!validateEditForm()) {
            return;
        }

        setLoading(true)


        parent.rootName = name;
        parent.rootPlanId = parent.id;
        let request: any = {
            rootPlan: parent
        }

        let res = await updateRootPlanById(token, request);
        if (res?.success === true) {
            setAlert({
                open: true,
                type: "success",
                message: "Location Boundary updated successfully",
            });
            setReload(!reload)
            setLoading(false)
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to update Location Boundary",
            });
            setLoading(false)
        }
    };

    /////////////////// ERRORS ////////////////////////
    // const [errors, setErrors] = useState({
    //     areaCategory: false,
    //     name: false,
    // });

    // const validateForm = () => {
    //     const newErrors = {
    //         areaCategory: (!areaCategory || areaCategory == "") && create == true, // Check if areaCategory is empty
    //         name: !name.trim(), // Check if name is empty
    //     };

    //     setErrors(newErrors);

    //     return !Object.values(newErrors).some(error => error);
    // };




    return (
        <React.Fragment>
            {create && <>
                {parent?.rootName ? <IconButton onClick={openDialog}><Add /></IconButton> : <PrimaryButton onClick={openDialog} label='Add Location Boundary' />}

            </>}
            {edit && <IconButton onClick={openDialog}><Edit /></IconButton>}

            <Dialog open={open} sx={{ backdropFilter: 'blur(3px)' }} fullWidth  >
                <GlobalAlert alert={alert} setAlert={setAlert} />

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        {create && 'Add Location Boundary'}
                        {edit && 'Edit Location Boundary'}
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
                            {create &&
                                <>
                                    <Grid2 size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth size="small" disabled={view || edit} error={Boolean(fieldErrors.areaCategory)}>
                                            <InputLabel>Area Category *</InputLabel>
                                            <Select
                                                label="Area Category *"
                                                value={areaCategory || ""}
                                                variant="outlined"
                                                onChange={(e) => setareaCategory(e.target.value)}
                                            >
                                                {Array.from(hierarchyMap?.entries() || [])
                                                    .filter(([key, item]) => parent.areaHierachy ? parent.areaHierachy < key : key == 1)
                                                    .map(
                                                        ([key, item]) => <MenuItem key={key} value={key}>{item}</MenuItem>
                                                    )}
                                            </Select>
                                            <FormHelperText>
                                                {fieldErrors.areaCategory}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            value={selectedParent}
                                            disabled={true}
                                            label="Parent"
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid2>
                                </>
                            }

                            <Grid2 size={{ xs: 12, sm: 12 }}>
                                <TextField
                                    value={name || ""}
                                    onChange={(e) => setname(e.target.value)}
                                    label="Name *"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.name)}
                                    helperText={fieldErrors.name}
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
