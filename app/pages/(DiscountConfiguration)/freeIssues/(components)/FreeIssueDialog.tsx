import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, TextField } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import dayjs from 'dayjs';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';
import { addDiscount, saveFreeIsues, updateDiscount, updateFreeIssue } from '@/app/(services)/SFARestClient';
import { alphanumericCharactersRegex } from '@/app/regex';

interface Props {
    ///// Common ////////
    view?: boolean;
    edit?: boolean;
    create?: boolean;
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;
    //////// Spceific////////////
    globalProductList: any[];
    globalProductCatList: any[];
    freeIssue?: any;
}

interface FieldErrors {
    productCategory: string;
    product: string;
    issueType: string;
    freeIssueCode: string;
    issueName: string;
    minQuant: string;
    maxQuant: string;
    unitValue: string;
    freeIssueQuantity: string;

}


export default function FreeIssueDialog({ freeIssue, view, edit, create, setReload, reload, globalProductList, globalProductCatList }: Props) {
    /////////////////// New Validation /////////////////////
    const initialErrors: FieldErrors = {
        productCategory: "",
        product: "",
        issueType: "",
        freeIssueCode: "",
        issueName: "",
        minQuant: "",
        maxQuant: "",
        unitValue: "",
        freeIssueQuantity: ""
    }

    const [fieldErrors, setfieldErrors] = useState<FieldErrors>({ ...initialErrors });

    const validateForm = () => {
        const newErrors: Partial<FieldErrors> = {};
        setfieldErrors(initialErrors);

        if (!productCategory) {
            newErrors.productCategory = "Product category cannot be empty";
        }

        if (!product) {
            newErrors.product = "Product cannot be empty";
        }

        if (!issueType) {
            newErrors.issueType = "Free issue cannot be empty";
        }

        if (!freeIssueCode) {
            newErrors.freeIssueCode = "Issued item code cannot be empty";
        } else if (freeIssueCode.trim().length == 0) {
            newErrors.freeIssueCode = "Issued item code cannot be empty";
        } else if (freeIssueCode.length > 10) {
            newErrors.freeIssueCode = "Issued item code cannot exceed 10 characters"
        } else if (!alphanumericCharactersRegex.test(freeIssueCode)) {
            newErrors.freeIssueCode = "Issued item code can only contain alphabetic characters"
        }


        if (!issueName) {
            newErrors.issueName = "Free issue name cannot be empty";
        } else if (issueName.trim().length == 0) {
            newErrors.issueName = "Free issue name cannot be empty";
        } else if (issueName.length > 200) {
            newErrors.issueName = "Free issue name cannot exceed 200 characters"
        }

        if (!minQuant) {
            newErrors.minQuant = "Minimum quantity cannot be empty";
        } else if (minQuant < 1) {
            newErrors.minQuant = "Minimum quantity cannot be 0";
        } else if (minQuant > 999999) {
            newErrors.minQuant = "Minimum quantity cannot exceed 999999"
        } else if (minQuant > maxQuant) {
            newErrors.minQuant = "Minimum quantity cannot exceed maximum quantity"
        }

        if (!maxQuant) {
            newErrors.maxQuant = "Maximum quantity cannot be empty";
        } else if (maxQuant < 1) {
            newErrors.maxQuant = "Maximum quantity cannot be 0";
        } else if (maxQuant > 999999) {
            newErrors.maxQuant = "Maximum quantity cannot exceed 999999"
        } else if (minQuant > maxQuant) {
            newErrors.maxQuant = "Maximum quantity should exceed minimum quantity"
        }

        if (!unitValue) {
            newErrors.unitValue = "Base quantity cannot be empty";
        } else if (unitValue < 1) {
            newErrors.unitValue = "Base quantity cannot be 0";
        } else if (unitValue > 999999) {
            newErrors.unitValue = "Base quantity cannot exceed 999999"
        }

        if (!freeIssueQuantity) {
            newErrors.freeIssueQuantity = "Issuing quantity cannot be empty";
        } else if (freeIssueQuantity < 1) {
            newErrors.freeIssueQuantity = "Issuing quantity cannot be 0";
        } else if (freeIssueQuantity > 999999) {
            newErrors.freeIssueQuantity = "Issuing quantity cannot exceed 999999"
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
            clearInputs()
        }
        setfieldErrors(initialErrors)
    }

    const openDialog = () => {
        setopen(true)
    }


    /////////////////// Common Attributes //////////////////
    const [token, settoken] = useState<any>(null);
    const [companyId, setcompanyId] = useState<any>(null);

    useLayoutEffect(() => {
        if (typeof window !== "undefined") {
            settoken(sessionStorage.getItem("token"))
            setcompanyId(sessionStorage.getItem("token")?.split(":")[4])
        }
    }, []);

    ///////////////////// Attributes /////////////////////
    const [filteredProductList, setfilteredProductList] = useState(globalProductList);
    const [productCategory, setproductCategory] = useState<string>("");
    const [product, setproduct] = useState<string>("");
    const [issueType, setissueType] = useState<string>("");
    const [freeIssueCode, setfreeIssueCode] = useState<string>("");
    const [issueName, setissueName] = useState<string>("");
    const [minQuant, setMinQuant] = useState<number>(0);
    const [maxQuant, setMaxQuant] = useState<number>(0);
    const [unitValue, setunitValue] = useState<number>(0);
    const [freeIssueQuantity, setfreeIssueQuantity] = useState<number>(0);
    const [effectiveFrom, setEffectiveFrom] = useState<any>(dayjs(new Date));
    const [effectiveTo, setEffectiveTo] = useState<any>(dayjs(new Date));


    ///////////////////// Inits /////////////////////
    useEffect(() => {
        if (freeIssue) {
            setInputs()
        }
    }, [freeIssue]);


    //////////////////Helpers///////////////
    const clearInputs = () => {
        setproductCategory("");
        setproduct("");
        setissueType("");
        setfreeIssueCode("");
        setissueName("");
        setMinQuant(0);
        setMaxQuant(0);
        setunitValue(0);
        setfreeIssueQuantity(0);
        setEffectiveFrom(dayjs(new Date));
        setEffectiveTo(dayjs(new Date));
    }

    const setInputs = () => {
        if (freeIssue) {
            setproductCategory("");
            setproduct(freeIssue.productCode || "");
            setissueType(freeIssue.freeIssueType || "");
            setfreeIssueCode(freeIssue.freeIssueProductCode || "");
            setissueName(freeIssue.freeIssueName || "");
            setMinQuant(freeIssue.minQuant || 0);
            setMaxQuant(freeIssue.maxQuant || 0);
            setunitValue(freeIssue.unitValue || 0);
            setfreeIssueQuantity(freeIssue.freeIssueQuant || 0);
            setEffectiveFrom(freeIssue.effectiveFrom ? dayjs(freeIssue.effectiveFrom) : dayjs(new Date));
            setEffectiveTo(freeIssue.effectiveTo ? dayjs(freeIssue.effectiveTo) : dayjs(new Date));
        }
    }

    const productFilter = () => {
        if (productCategory != "" && globalProductList.length != 0) {
            let temp = globalProductList.filter(i => i.categoryId == productCategory);
            setfilteredProductList(temp)
        } else if (globalProductList.length != 0) {
            setfilteredProductList(globalProductList)
        }
    }

    useEffect(() => {
        productFilter();
    }, [productCategory]);



    ///////////////////// Methods /////////////////////
    const onCreate = async () => {

        if (!validateForm()) {
            return;
        }

        let freeIssueDto: any = {};
        freeIssueDto.freeIssueProductCode = freeIssueCode;
        freeIssueDto.freeIssueQuant = freeIssueQuantity;
        freeIssueDto.freeIssueType = issueType;
        freeIssueDto.freeIssueName = issueName;
        freeIssueDto.maxQuant = maxQuant;
        freeIssueDto.minQuant = minQuant;
        freeIssueDto.unitValue = parseInt(unitValue.toString());
        freeIssueDto.effectiveFrom = dayjs(effectiveFrom).format('YYYY-MM-DD HH:mm:ss');
        freeIssueDto.effectiveTo = dayjs(effectiveTo).format('YYYY-MM-DD HH:mm:ss');
        freeIssueDto.productCode = product;
        freeIssueDto.status = 1;

        const req = {
            tokenString: token,
            freeIssue: freeIssueDto
        };

        const res = await saveFreeIsues(token, req);

        if (res?.success) {
            setReload(!reload);
            clearInputs();
            setAlert({
                message: "New free issue has been successfully added.",
                type: "success",
                open: true
            });
        } else {
            setAlert({
                message: `Adding of new free issue has been failed. (${res?.message})`,
                type: "error",
                open: true
            });
        }
    }

    const onUpdate = async () => {

        if (!validateForm()) {
            return;
        }

        let freeIssueDto: any = {};
        freeIssueDto.id = freeIssue.id;
        freeIssueDto.productCode = product;
        freeIssueDto.effectiveFrom = dayjs(effectiveFrom).format('YYYY-MM-DD HH:mm:ss');;
        freeIssueDto.effectiveTo = dayjs(effectiveTo).format('YYYY-MM-DD HH:mm:ss');;


        const req = {
            tokenString: token,
            freeIssue: freeIssueDto
        }

        const res = await updateFreeIssue(token, req);

        if (res?.success) {
            setReload(!reload);
            clearInputs();
            setAlert({
                message: "Free Issue has been successfully updated.",
                type: "success",
                open: true
            })
        } else {
            setAlert({
                message: "Failed to update the Free Issue",
                type: "error",
                open: true
            })
        }
    }

    //////////////// ERRORS ////////////////////
    // const [errors, setErrors] = useState({
    //     productCategory: false,
    //     product: false,
    //     issueType: false,
    //     freeIssueCode: false,
    //     issueName: false,
    //     minQuant: false,
    //     maxQuant: false,
    //     unitValue: false,
    //     freeIssueQuantity: false,

    // });

    // const validateForm = () => {
    //     const newErrors = {
    //         productCategory: !productCategory,
    //         product: !product,
    //         issueName: !issueName.trim(),
    //         issueType: !issueType,
    //         freeIssueCode: !freeIssueCode.trim(),
    //         minQuant: minQuant <= 0,
    //         maxQuant: maxQuant <= 0,
    //         unitValue: unitValue <= 0,
    //         freeIssueQuantity: freeIssueQuantity <= 0,
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
                        {view && 'View Free Issue'}
                        {create && 'Create Free Issue'}
                        {edit && 'Update Free Issue'}
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
                                    <FormControl fullWidth size="small" disabled={!create} error={Boolean(fieldErrors.productCategory)}>
                                        <InputLabel>Product Category *</InputLabel>
                                        <Select
                                            label="Product Category *"
                                            value={productCategory || ""}
                                            onChange={(e) => setproductCategory(e.target.value)}

                                        >
                                            <MenuItem value={""}>Please select an option</MenuItem>
                                            {globalProductCatList?.map((item, index) => (
                                                <MenuItem key={index} value={item.categoryId}>
                                                    {item.categoryName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>
                                            {fieldErrors.productCategory}
                                        </FormHelperText>
                                    </FormControl>
                                </Grid2>
                            }
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small" disabled={!create} error={Boolean(fieldErrors.product)}>
                                    <InputLabel>Product *</InputLabel>
                                    <Select
                                        label="Product *"
                                        value={product || ""}
                                        onChange={(e) => setproduct(e.target.value)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        {filteredProductList?.map((item, index) => (
                                            <MenuItem key={index} value={item.productCode}>
                                                {item.productName} - {item.productCode}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.product}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small" disabled={!create} error={Boolean(fieldErrors.issueType)}>
                                    <InputLabel>Free Issue *</InputLabel>
                                    <Select
                                        label="Free Issue *"
                                        value={issueType || ""}
                                        onChange={(e) => setissueType(e.target.value)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        <MenuItem value="1">Same Product</MenuItem>
                                        <MenuItem value="2">Other Product</MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.issueType}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    disabled={!create}
                                    value={freeIssueCode || ""}
                                    onChange={(e) => setfreeIssueCode(e.target.value)}
                                    fullWidth
                                    variant='outlined'
                                    label="Issued Item Code *"
                                    size='small'
                                    error={Boolean(fieldErrors.freeIssueCode)}
                                    helperText={fieldErrors.freeIssueCode}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    disabled={!create}
                                    value={issueName || ""}
                                    onChange={(e) => setissueName(e.target.value)}
                                    fullWidth
                                    variant='outlined'
                                    label="Free Issue Name *"
                                    size='small'
                                    error={Boolean(fieldErrors.issueName)}
                                    helperText={fieldErrors.issueName}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    disabled={!create}
                                    value={minQuant || ""}
                                    onChange={(e) => setMinQuant(parseFloat(e.target.value))}
                                    fullWidth
                                    variant='outlined'
                                    label="Minimum Quantity *"
                                    size='small'
                                    type='number'
                                    error={Boolean(fieldErrors.minQuant)}
                                    helperText={fieldErrors.minQuant}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    disabled={!create}
                                    value={maxQuant || ""}
                                    onChange={(e) => setMaxQuant(parseFloat(e.target.value))}
                                    fullWidth
                                    variant='outlined'
                                    label="Maximum Quantity *"
                                    size='small'
                                    type='number'
                                    error={Boolean(fieldErrors.maxQuant)}
                                    helperText={fieldErrors.maxQuant}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    disabled={!create}
                                    value={unitValue || ""}
                                    onChange={(e) => setunitValue(parseFloat(e.target.value))}
                                    fullWidth
                                    variant='outlined'
                                    label="Base Quantity *"
                                    size='small'
                                    type='number'
                                    error={Boolean(fieldErrors.unitValue)}
                                    helperText={fieldErrors.unitValue}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    disabled={!create}
                                    value={freeIssueQuantity || ""}
                                    onChange={(e) => setfreeIssueQuantity(parseFloat(e.target.value))}
                                    fullWidth
                                    variant='outlined'
                                    label="Issuing Quantity *"
                                    size='small'
                                    type='number'
                                    error={Boolean(fieldErrors.freeIssueQuantity)}
                                    helperText={fieldErrors.freeIssueQuantity}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <CustomDatePicker
                                    label='Effective From *'
                                    setvalue={setEffectiveFrom}
                                    value={effectiveFrom}
                                    size={'small'}
                                    disabled={!create}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <CustomDatePicker
                                    label='Effective To *'
                                    setvalue={setEffectiveTo}
                                    value={effectiveTo}
                                    size={'small'}
                                    disabled={view}
                                    minDate={effectiveFrom}
                                />
                            </Grid2>

                        </Grid2>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={'end'} my={2}>
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
