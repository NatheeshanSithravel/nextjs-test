import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, TextField } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addBatch, addDistributorStore, addProductRequest, addUser, findAllAreaHirachy, findRootsByHierarchy, findSupervisorListByRole, getUmBranches, retriewAllROutPlans, retriewUserRoles, updateBatch, updateDisPoint, updateUser } from '@/app/(services)/SFARestClient';
import dayjs from 'dayjs';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';
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
    globalProductCatList: any[];
    globalProductList: any[];
    selectedBatch?: any;
}

interface FieldErrors {
    selectedCategory: string;
    selectedProduct: string;
    qty: string;
    manufacturedDate: string;
    expiryDate: string;
    price: string;
    skuUnits: string;
    skuPerBox: string;
    batchCode: string;
}

export default function BatchDialog({ selectedBatch, view, edit, create, setReload, reload, globalProductCatList, globalProductList }: Props) {

    /////////////////// New Validation /////////////////////
    const initialErrors: FieldErrors = {
        selectedCategory: "",
        selectedProduct: "",
        qty: "",
        manufacturedDate: "",
        expiryDate: "",
        price: "",
        skuUnits: "",
        skuPerBox: "",
        batchCode: ""
    }

    const [fieldErrors, setfieldErrors] = useState<FieldErrors>({ ...initialErrors });

    const validateForm = () => {
        const newErrors: Partial<FieldErrors> = {};
        setfieldErrors(initialErrors);

        if (!selectedCategory) {
            newErrors.selectedCategory = "Category is required";
        }

        if (!selectedProduct) {
            newErrors.selectedProduct = "Product is required";
        }

        if (qty <= 0) {
            newErrors.qty = "Quantity must be greater than 0";
        } else if (qty > 999999) {
            newErrors.qty = "Quantity cannot exceed 999999"
        }

        if (!manufacturedDate) {
            newErrors.manufacturedDate = "Manufactured date is required";
        }

        if (!expiryDate) {
            newErrors.expiryDate = "Expiry date is required";
        }

        if (price <= 0) {
            newErrors.price = "Price must be greater than 0";
        } else if (price > 999999) {
            newErrors.price = "Price cannot exceed 999999";
        }

        if (skuUnits <= 0) {
            newErrors.skuUnits = "SKU units must be greater than 0";
        } else if (skuUnits > 999999) {
            newErrors.skuUnits = "SKU units cannot exceed 999999";
        }

        if (skuPerBox <= 0) {
            newErrors.skuPerBox = "SKU per box must be greater than 0";
        } else if (skuPerBox > 999999) {
            newErrors.skuPerBox = "SKU per box cannot exceed 999999";
        }

        if (!batchCode) {
            newErrors.batchCode = "Batch code cannot be empty";
        } else if (batchCode.trim().length == 0) {
            newErrors.batchCode = "Batch code cannot be empty";
        } else if (batchCode.length > 10) {
            newErrors.batchCode = "Batch code cannot exceed 10 characters"
        } else if (!alphanumericCharactersRegex.test(batchCode)) {
            newErrors.batchCode = "Batch code can only contain alphabetic characters"
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
            clearInputs(),
                setfieldErrors(initialErrors)
        }

    }

    const openDialog = () => {
        setopen(true)
    }


    /////////////////// Common Attributes //////////////////
    const [token, settoken] = useState<any>(null);

    // useLayoutEffect(() => {
    //     if (typeof window !== "undefined") {
    //         settoken(sessionStorage.getItem("token"))
    //         setcompanyId(sessionStorage.getItem("token")?.split(":")[4])
    //     }
    // }, []);
    useEffect(() => {
        const getData = async () => {
            settoken(await getToken());
        };
        getData();
    }, []);

    ///////////////////// Attributes /////////////////////
    const [selectedCategory, setselectedCategory] = useState<any>("");
    const [filteredProductList, setfilteredProductList] = useState<any[]>(globalProductList);
    const [selectedProduct, setselectedProduct] = useState<any>("");
    const [qty, setqty] = useState<number>(0);
    const [manufacturedDate, setmanufacturedDate] = useState<any>(dayjs(new Date()));
    const [expiryDate, setexpiryDate] = useState<any>(dayjs(new Date()));
    const [price, setprice] = useState<number>(0);
    const [skuUnits, setskuUnits] = useState<number>(0);
    const [skuPerBox, setskuPerBox] = useState<number>(0);
    const [batchCode, setbatchCode] = useState<any>("");


    ///////////////////// Inits /////////////////////
    useEffect(() => {
        if (globalProductList && globalProductList.length != 0) {
            setfilteredProductList(globalProductList)
        }
    }, [globalProductList]);

    useEffect(() => {
        if (selectedBatch) {
            setInputs();
        }
    }, [selectedBatch]);


    //////////////////Helpers///////////////
    const clearInputs = () => {
        setLoading(false)
        setselectedCategory("");
        setfilteredProductList([]);
        setqty(0);
        setmanufacturedDate(dayjs(new Date()));
        setexpiryDate(dayjs(new Date()));
        setprice(0);
        setskuUnits(0);
        setskuPerBox(0);
        setbatchCode("");
        setselectedProduct("");
    }

    const setInputs = () => {
        if (selectedBatch) {
            setbatchCode(selectedBatch.batchCode);
            setexpiryDate(dayjs(selectedBatch.expiaryDate));
            setmanufacturedDate(dayjs(selectedBatch.manufactureDate));
            setselectedProduct(selectedBatch.productCode);
            setqty(selectedBatch.totalQuantity);
            setskuPerBox(selectedBatch.skuPerBox);
            setprice(selectedBatch.wholeSalePrice);
            setskuUnits(selectedBatch.skuUnits);
        }
    }



    ///////////////////// Methods /////////////////////
    const addNewBatch = async () => {

        if (!validateForm()) {
            return;
        }

        if ((skuPerBox * skuUnits) != qty) {
            setAlert({
                message: 'Multiplication of SKU Box and SKU units should be equal to product quantity',
                type: 'error',
                open: true
            })
        } else {
            const disBatch = {
                batchCode: batchCode,
                expiaryDate: dayjs(expiryDate).format('YYYY-MM-DD HH:mm:ss'),
                manufactureDate: dayjs(manufacturedDate).format('YYYY-MM-DD HH:mm:ss'),
                productCode: selectedProduct,
                totalQuantity: qty,
                skuPerBox: skuPerBox,
                wholeSalePrice: parseFloat(price.toFixed(2)),
                skuPrice: parseFloat(price.toFixed(2)),
                skuUnits: skuUnits
            }

            const req = {
                disBatch: disBatch,
                tokenString: token
            }

            const res = await addBatch(token, req);
            if (res?.success === true) {
                clearInputs();
                setAlert({
                    open: true,
                    type: "success",
                    message: "New batch has been successfully added.",
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
                    message: "Adding of new batch has been failed.",
                });
            }
        }


    }

    const onUpdate = async () => {
        if (!validateForm()) {
            return;
        }
        setLoading(true)
        const disBatch = {
            batchId: selectedBatch.batchId,
            expiaryDate: dayjs(expiryDate).format('YYYY-MM-DD HH:mm:ss'),
            manufactureDate: dayjs(manufacturedDate).format('YYYY-MM-DD HH:mm:ss'),
        }

        const req = {
            disBatch: disBatch,
            tokenString: token
        }

        const res = await updateBatch(token, req);
        if (res?.success === true) {
            setAlert({
                open: true,
                type: "success",
                message: "Batch has been updated successfully",
            });
            setReload(!reload);
            setLoading(false)

        } else if (res?.success == false) {
            setAlert({
                open: true,
                type: "error",
                message: res.message,
            });
            setLoading(true)
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Updating of new batch has been failed.",
            });
            setLoading(true)
        }
    }

    const productFilter = () => {
        if (selectedCategory != "" && globalProductList.length != 0) {
            let temp = globalProductList.filter(i => i.categoryId == selectedCategory);
            setfilteredProductList(temp)
        } else if (globalProductList.length != 0) {
            setfilteredProductList(globalProductList)
        }
    }

    useEffect(() => {
        productFilter();
    }, [selectedCategory]);

    //////////////// ERRORS ////////////////////
    // const [errors, setErrors] = useState({
    //     selectedCategory: false,
    //     selectedProduct: false,
    //     qty: false,
    //     manufacturedDate: false,
    //     expiryDate: false,
    //     price: false,
    //     skuUnits: false,
    //     skuPerBox: false,
    //     batchCode: false,
    // });

    // const validateForm = () => {
    //     const newErrors = {
    //         selectedCategory: !selectedCategory && create == true, //Checking the Category is empty
    //         selectedProduct: !selectedProduct, // Check if selectedProduct is empty
    //         qty: qty <= 0, // Check if qty is empty or invalid
    //         manufacturedDate: !manufacturedDate, // Check if manufacturedDate is empty
    //         expiryDate: !expiryDate, // Check if expiryDate is empty
    //         price: price <= 0, // Check if price is empty or invalid
    //         skuUnits: skuUnits <= 0, // Check if skuUnits is empty or invalid
    //         skuPerBox: skuPerBox <= 0, // Check if skuPerBox is empty or invalid
    //         batchCode: !batchCode.trim(), // Check if batchCode is empty
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
                        {view && 'View Batch'}
                        {create && 'Create Batch'}
                        {edit && 'Update Batch'}
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
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <FormControl fullWidth size="small" error={Boolean(fieldErrors.selectedCategory)}>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            label="Category"
                                            value={selectedCategory || ""}
                                            onChange={(e) => setselectedCategory(e.target.value)}

                                        >
                                            <MenuItem value={""}>Please select an option</MenuItem>
                                            {globalProductCatList?.map((item) => (
                                                <MenuItem key={item.categoryId} value={item.categoryId}>
                                                    {item.categoryName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>
                                            {fieldErrors.selectedCategory}
                                        </FormHelperText>
                                    </FormControl>
                                </Grid2>
                            }
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small" disabled={view || edit} error={Boolean(fieldErrors.selectedProduct)}>
                                    <InputLabel>Product *</InputLabel>
                                    <Select
                                        label="Product"
                                        value={selectedProduct || ""}
                                        onChange={(e) => setselectedProduct(e.target.value)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        {filteredProductList?.map((item) => (
                                            <MenuItem key={item.productCode} value={item.productCode}>
                                                {item.productName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.selectedProduct}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    disabled={view || edit}
                                    value={qty || ""}
                                    onChange={(e) => setqty(Number(e.target.value))}
                                    fullWidth
                                    variant='outlined'
                                    label="Production Quantity *"
                                    size='small'
                                    error={Boolean(fieldErrors.qty)}
                                    helperText={fieldErrors.qty}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <CustomDatePicker
                                    disabled={view}
                                    label='Manufactured Date *'
                                    setvalue={setmanufacturedDate}
                                    value={manufacturedDate}
                                    size={'small'}
                                    maxDate={expiryDate}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <CustomDatePicker
                                    minDate={manufacturedDate}
                                    disabled={view}
                                    label='Expiry Date *'
                                    setvalue={setexpiryDate}
                                    value={expiryDate}
                                    size={'small'}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    disabled={view || edit}
                                    value={price || ""}
                                    onChange={(e) => setprice(Number(e.target.value))}
                                    fullWidth
                                    variant='outlined'
                                    label="Wholesale Price *"
                                    size='small'
                                    error={Boolean(fieldErrors.price)}
                                    helperText={fieldErrors.price}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    disabled={view || edit}
                                    value={skuUnits || ""}
                                    onChange={(e) => setskuUnits(Number(e.target.value))}
                                    fullWidth
                                    variant='outlined'
                                    label="Units Per SKU *"
                                    size='small'
                                    error={Boolean(fieldErrors.skuUnits)}
                                    helperText={fieldErrors.skuUnits}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    disabled={view || edit}
                                    value={skuPerBox || ""}
                                    onChange={(e) => setskuPerBox(Number(e.target.value))}
                                    fullWidth
                                    variant='outlined'
                                    label="SKU Per Box *"
                                    size='small'
                                    error={Boolean(fieldErrors.skuPerBox)}
                                    helperText={fieldErrors.skuPerBox}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    disabled={view || edit}
                                    value={batchCode || ""}
                                    onChange={(e) => setbatchCode(e.target.value)}
                                    fullWidth
                                    variant='outlined'
                                    label="Batch Code *"
                                    size='small'
                                    error={Boolean(fieldErrors.batchCode)}
                                    helperText={fieldErrors.batchCode}
                                />
                            </Grid2>



                        </Grid2>
                        <Stack alignItems={"end"} mt={2} flexDirection={'row-reverse'} gap={1}>
                            {loading ? <CircularProgress color="secondary" /> :
                                <React.Fragment>
                                    {create && <PrimaryButton onClick={addNewBatch} label='Create' />}
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
