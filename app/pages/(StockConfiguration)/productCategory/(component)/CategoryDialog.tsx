import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, TextField } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addProductCategory, addProductRequest } from '@/app/(services)/SFARestClient';
import { getToken } from '@/app/util/UserDataHandler';

interface Props {
    ///// Common ////////
    view?: boolean;
    edit?: boolean;
    create?: boolean;
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;
    //////// Spceific////////////
    product?: any;
}

interface FieldErrors {
    categoryName: string;
    description: string;
}

export default function CategoryDialog({ product, view, edit, create, setReload, reload }: Props) {
    /////////////////// New Validation /////////////////////
    const initialErrors: FieldErrors = {
        categoryName: "",
        description: "",
    }

    const [fieldErrors, setfieldErrors] = useState<FieldErrors>({ ...initialErrors });

    const validateForm = () => {
        const newErrors: Partial<FieldErrors> = {};
        setfieldErrors(initialErrors);

        if (!categoryName) {
            newErrors.categoryName = "Category name cannot be empty";
        } else if (categoryName.trim().length == 0) {
            newErrors.categoryName = "Category name cannot be empty";
        } else if (categoryName.length > 100) {
            newErrors.categoryName = "Category name cannot exceed 100 characters"
        }

        if (!description) {
            newErrors.description = "Description cannot be empty";
        } else if (description.trim().length == 0) {
            newErrors.description = "Description cannot be empty";
        } else if (description.length > 250) {
            newErrors.description = "Description cannot exceed 250 characters"
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
        setfieldErrors(initialErrors);
        clearInputs();
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
    const [categoryName, setcategoryName] = useState<any>("");
    const [description, setdescription] = useState<any>("");



    ///////////////////// Inits /////////////////////


    //////////////////Helpers///////////////
    const clearInputs = () => {
        setcategoryName("");
        setdescription("");
    }



    ///////////////////// API Calls /////////////////////
    const saveProductCategory = async () => {

        if (!validateForm()) {
            return;
        }

        const req = {
            productCategory: {
                categoryName: categoryName,
                description: description
            },
            tokenString: token
        }

        const res = await addProductCategory(token, req);
        if (res.success === true) {
            clearInputs();
            setAlert({
                open: true,
                type: "success",
                message: "Product Category has been successfully created.",
            });
            setReload(!reload);
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Creation of product category has been failed.",
            });
        }

    }

    //////////////////////// ERRORS /////////////////////////
    // const [errors, setErrors] = useState({
    //     categoryName: false,
    //     description: false,
    // });

    // const validateForm = () => {
    //     const newErrors = {
    //         categoryName: !categoryName.trim(), // Check if categoryName is empty
    //         description: !description.trim(), // Check if description is empty
    //     };

    //     setErrors(newErrors);

    //     return !Object.values(newErrors).some(error => error);
    // };


    return (
        <React.Fragment>
            {create && <PrimaryButton onClick={openDialog} label="ADD" icon={<Add />} />}
            {view && <IconButton onClick={openDialog}><Visibility /></IconButton>}
            {edit && <IconButton onClick={openDialog}><Edit /></IconButton>}

            <Dialog open={open} sx={{ backdropFilter: 'blur(3px)' }} maxWidth='md' >
                <GlobalAlert alert={alert} setAlert={setAlert} />

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        {view && 'View Product Category'}
                        {create && 'Create Product Category'}
                        {edit && 'Update Product Category'}
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

                            <Grid2 size={{ xs: 12, sm: 12 }}>
                                <TextField
                                    value={categoryName || ""}
                                    onChange={(e) => setcategoryName(e.target.value)}
                                    fullWidth
                                    variant='outlined'
                                    label="Category Name *"
                                    size='small'
                                    error={Boolean(fieldErrors.categoryName)}
                                    helperText={fieldErrors.categoryName}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 12 }}>
                                <TextField
                                    value={description || ""}
                                    onChange={(e) => setdescription(e.target.value)}
                                    fullWidth
                                    variant='outlined'
                                    label="Category Description *"
                                    size='small'
                                    error={Boolean(fieldErrors.description)}
                                    helperText={fieldErrors.description}
                                />
                            </Grid2>



                        </Grid2>
                        <Stack alignItems={"end"} mt={2} flexDirection={'row-reverse'} gap={1}>
                            {loading ? <CircularProgress color="secondary" /> :
                                <React.Fragment>
                                    {create && <PrimaryButton onClick={saveProductCategory} label='Create' />}
                                    {/* {edit && <PrimaryButton onClick={onUpdate} label='Save' />} */}
                                </React.Fragment>
                            }
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
        </React.Fragment >
    );
}
