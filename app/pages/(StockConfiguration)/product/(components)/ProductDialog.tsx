import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, TextField } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addDistributorStore, addProductRequest, addUser, findAllAreaHirachy, findRootsByHierarchy, findSupervisorListByRole, getUmBranches, retriewAllROutPlans, retriewUserRoles, updateDisPoint, updateUser } from '@/app/(services)/SFARestClient';
import { getToken } from '@/app/util/UserDataHandler';
import { alphanumericCharactersRegex } from '@/app/regex';

interface Props {
    ///// Common ////////
    view?: boolean;
    edit?: boolean;
    create?: boolean;
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;
    //////// Spceific////////////
    globalProductCatList: any[]
    product?: any;
}

interface FieldErrors {
    code: string;
    category: string;
    name: string;
    qty: string;
}

export default function ProductDialog({ product, view, edit, create, setReload, reload, globalProductCatList }: Props) {

    /////////////////// New Validation /////////////////////
    const initialErrors: FieldErrors = {
        code: "",
        category: "",
        name: "",
        qty: ""
    }

    const [fieldErrors, setfieldErrors] = useState<FieldErrors>({ ...initialErrors });

    const validateForm = () => {
        const newErrors: Partial<FieldErrors> = {};
        setfieldErrors(initialErrors);

        if (!code) {
            newErrors.code = "Product code cannot be empty";
        } else if (code.trim().length == 0) {
            newErrors.code = "Product code cannot be empty";
        } else if (code.length > 50) {
            newErrors.code = "Product code cannot exceed 50 characters"
        } else if (!alphanumericCharactersRegex.test(code)) {
            newErrors.code = "Product code can only contain alphabetic characters"
        }

        if (!name) {
            newErrors.name = "Product name cannot be empty";
        } else if (name.trim().length == 0) {
            newErrors.name = "Product name cannot be empty";
        } else if (name.length > 20) {
            newErrors.name = "Product name cannot exceed 20 characters"
        } 

        if (!qty) {
            newErrors.qty = "Quantity cannot be empty";
        } else if (qty < 1) {
            newErrors.qty = "Quantity cannot be 0";
        } else if (qty > 999999) {
            newErrors.qty = "Quantity cannot exceed 6 digits"
        } 

        if (!category) {
            newErrors.category = "Product category cannot be empty";
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
    const [code, setcode] = useState<any>("");
    const [name, setname] = useState<any>("");
    const [qty, setqty] = useState<number>(0);
    const [category, setcategory] = useState<any>("");



    ///////////////////// Inits /////////////////////


    //////////////////Helpers///////////////
    const clearInputs = () => {
        setcode("");
        setname("");
        setcategory("");
        setqty(0);
    }



    ///////////////////// API Calls /////////////////////
    const addProduct = async () => {

        if (!validateForm()) {
            return;
        }

        const req = {
            disProduct: {
                approvalId: 0,
                discountType: "",
                freeIssueFlag: false,
                maxQuantity: qty,
                productCode: code,
                productName: name,
                productGroup: 0,
                specialApproval: false,
                active: true,
                serialActive: false,
                approveStatus: null,
                categoryId: category
            },
            tokenString: token
        }

        const res = await addProductRequest(token, req);
        if (res?.success === true) {
            clearInputs();
            setAlert({
                open: true,
                type: "success",
                message: "New product has been successfully added.",
            });
            setReload(!reload);
        } else if (res?.success == false) {
            setAlert({
                open: true,
                type: "error",
                message: res.message,
            });
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Creation of product has been failed.",
            });
        }

    }

    ///////////////// ERRORS //////////////////
    // const [errors, setErrors] = useState({
    //     code: false,
    //     name: false,
    //     category: false,
    //     qty: false,
    // });

    // const validateForm = () => {
    //     const newErrors = {
    //         code: !code.trim(), // Check if code is empty
    //         name: !name.trim(), // Check if name is empty
    //         category: !category, // Check if category is empty
    //         qty: !qty, // Check if qty is empty
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
                        {view && 'View Product'}
                        {create && 'Create Product'}
                        {edit && 'Update Product'}
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
                                    value={code || ""}
                                    onChange={(e) => setcode(e.target.value)}
                                    fullWidth
                                    variant='outlined'
                                    label="Product Code *"
                                    size='small'
                                    error={Boolean(fieldErrors.code)}
                                    helperText={fieldErrors.code}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={name || ""}
                                    onChange={(e) => setname(e.target.value)}
                                    fullWidth
                                    variant='outlined'
                                    label="Product Name *"
                                    size='small'
                                    error={Boolean(fieldErrors.name)}
                                    helperText={fieldErrors.name}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={qty || 0}
                                    onChange={(e) => setqty(Number(e.target.value))}
                                    fullWidth
                                    variant='outlined'
                                    label="Max Quantity"
                                    size='small'
                                    error={Boolean(fieldErrors.qty)}
                                    helperText={fieldErrors.qty}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small" error={Boolean(fieldErrors.category)}>
                                    <InputLabel>Product Category *</InputLabel>
                                    <Select
                                        label="Product Category *"
                                        value={category || ""}
                                        onChange={(e) => setcategory(e.target.value as number)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        {globalProductCatList?.map((item) => (
                                            <MenuItem key={item.categoryId} value={item.categoryId}>
                                                {item.categoryName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.category}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>

                        </Grid2>
                        <Stack alignItems={"end"} mt={2} flexDirection={'row-reverse'} gap={1}>
                            {loading ? <CircularProgress color="secondary" /> :
                                <React.Fragment>
                                    {create && <PrimaryButton onClick={addProduct} label='Create' />}
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
