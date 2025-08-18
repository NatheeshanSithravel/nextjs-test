import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, TextField } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import dayjs from 'dayjs';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';
import { addDiscount, updateDiscount } from '@/app/(services)/SFARestClient';
import { getToken } from '@/app/util/UserDataHandler';

interface Props {
    ///// Common ////////
    view?: boolean;
    edit?: boolean;
    create?: boolean;
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;
    //////// Spceific////////////
    disProductList: any[];
    discount?: any;
}

interface FieldErrors {
    pcode: string;
    minQuant: string;
    maxQuant: string;
    minPercentage: string;
    maxPercentage: string;
    percentageType: string;
    discountName: string;
}

export default function DiscountDialog({ discount, view, edit, create, setReload, reload, disProductList }: Props) {

    /////////////////// New Validation /////////////////////
    const initialErrors: FieldErrors = {
        pcode: "",
        minQuant: "",
        maxQuant: "",
        minPercentage: "",
        maxPercentage: "",
        percentageType: "",
        discountName: ""
    }

    const [fieldErrors, setfieldErrors] = useState<FieldErrors>({ ...initialErrors });

    const validateForm = () => {
        const newErrors: Partial<FieldErrors> = {};
        setfieldErrors(initialErrors);

        if (!pcode) {
            newErrors.pcode = "Product cannot be empty";
        }

        if (!percentageType) {
            newErrors.percentageType = "Discount type cannot be empty";
        }


        if (!discountName) {
            newErrors.discountName = "Discount name cannot be empty";
        } else if (discountName.trim().length == 0) {
            newErrors.discountName = "Discount name cannot be empty";
        } else if (discountName.length > 200) {
            newErrors.discountName = "Discount name cannot exceed 200 characters"
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



        if (!minPercentage) {
            newErrors.minPercentage = "Minimum deduction cannot be empty";
        } else if (minPercentage < 0) {
            newErrors.minPercentage = "Minimum deduction cannot be 0";
        } else if (minPercentage > 100) {
            newErrors.minPercentage = "Minimum deduction cannot exceed 100"
        } else if (percentageType && percentageType != "flat" && minPercentage > maxPercentage) {
            newErrors.minPercentage = "Minimum deduction cannot exceed maximum deduction"
        }

        if (percentageType && percentageType != "flat") {
            if (!maxPercentage) {
                newErrors.maxPercentage = "Maximum deduction cannot be empty";
            } else if (maxPercentage < 0) {
                newErrors.maxPercentage = "Maximum deduction cannot be 0";
            } else if (maxPercentage > 100) {
                newErrors.maxPercentage = "Maximum deduction cannot exceed 100"
            } else if (minPercentage > maxPercentage) {
                newErrors.maxPercentage = "Maximum deduction should exceed minimum deduction"
            }
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

    useEffect(() => {
        const getData = async () => {
            settoken(await getToken());
        };
        getData();
    }, []);

    // useLayoutEffect(() => {
    //     if (typeof window !== "undefined") {
    //         settoken(sessionStorage.getItem("token"))
    //         setcompanyId(sessionStorage.getItem("token")?.split(":")[4])
    //     }
    // }, []);

    ///////////////////// Attributes /////////////////////
    const [pcode, setPcode] = useState<string>("");
    const [minQuant, setMinQuant] = useState<number>(0);
    const [maxQuant, setMaxQuant] = useState<number>(0);
    const [minPercentage, setMinPercentage] = useState<number>(0);
    const [maxPercentage, setMaxPercentage] = useState<number>(0);
    const [percentageType, setPercentageType] = useState<string>("");
    const [discountName, setDiscountName] = useState<string>("");
    const [effectiveFrom, setEffectiveFrom] = useState<any>(dayjs(new Date));
    const [effectiveTo, setEffectiveTo] = useState<any>(dayjs(new Date));


    ///////////////////// Inits /////////////////////
    useEffect(() => {
        if (discount) {
            setInputs()
        }
    }, [discount]);


    //////////////////Helpers///////////////
    const clearInputs = () => {
        setPcode("");
        setMinQuant(0);
        setMaxQuant(0);
        setMinPercentage(0);
        setMaxPercentage(0);
        setPercentageType("");
        setDiscountName("");
        setEffectiveFrom(dayjs(new Date));
        setEffectiveTo(dayjs(new Date));
    }

    const setInputs = () => {
        setPcode(discount.productCode || "");
        setMinQuant(discount.minQuant || 0);
        setMaxQuant(discount.maxQuant || 0);
        setMinPercentage(discount.minPercentage || 0);
        setMaxPercentage(discount.maxPercentage || 0);
        setPercentageType(discount.percentageType || "");
        setDiscountName(discount.discountName || "");
        setEffectiveFrom(dayjs(discount.effectiveFrom) || dayjs(new Date));
        setEffectiveTo(dayjs(discount.effectiveTo) || dayjs(new Date));
    }



    ///////////////////// Methods /////////////////////
    const onCreate = async () => {

        if (!validateForm()) {
            return;
        }

        let discountQuantDto: any = {};

        discountQuantDto.productCode = pcode;
        discountQuantDto.minQuant = minQuant;
        discountQuantDto.maxQuant = maxQuant;
        discountQuantDto.discountName = discountName;

        if (percentageType.toLowerCase() === "percentage") {
            discountQuantDto.disPercentage = minPercentage;
            discountQuantDto.minPercentage = minPercentage;
            discountQuantDto.maxPercentage = maxPercentage;
            discountQuantDto.discountValue = null;
        } else if (percentageType.toLowerCase() === "flat") {
            discountQuantDto.disPercentage = 0;
            discountQuantDto.minPercentage = 0;
            discountQuantDto.maxPercentage = 0;
            discountQuantDto.discountValue = minPercentage;
        }

        discountQuantDto.percentageType = percentageType;
        discountQuantDto.effectiveFrom = dayjs(effectiveFrom).format('YYYY-MM-DD HH:mm:ss');;
        discountQuantDto.effectiveTo = dayjs(effectiveTo).format('YYYY-MM-DD HH:mm:ss');;

        const req = {
            tokenString: token,
            discountQuant: discountQuantDto
        }

        const res = await addDiscount(token, req);

        if (res?.success) {
            setReload(!reload);
            clearInputs();
            setAlert({
                message: "New discount has been successfully added.",
                type: "success",
                open: true
            })
        } else {
            setAlert({
                message: "Adding of new discount has been failed.",
                type: "success",
                open: true
            })
        }
    }

    const onUpdate = async () => {

        if (!validateForm()) {
            return;
        }

        let discountQuantDto: any = {};
        discountQuantDto.discountQuantId = discount.discountQuantId;
        discountQuantDto.productCode = pcode;
        discountQuantDto.minQuant = minQuant;
        discountQuantDto.maxQuant = maxQuant;
        discountQuantDto.discountName = discountName;
        discountQuantDto.disPercentage = minPercentage;
        discountQuantDto.minPercentage = minPercentage;
        discountQuantDto.maxPercentage = maxPercentage;
        discountQuantDto.discountValue = minPercentage;
        discountQuantDto.percentageType = percentageType;
        discountQuantDto.effectiveFrom = dayjs(effectiveFrom).format('YYYY-MM-DD HH:mm:ss');;
        discountQuantDto.effectiveTo = dayjs(effectiveTo).format('YYYY-MM-DD HH:mm:ss');;


        const req = {
            tokenString: token,
            discountQuant: discountQuantDto
        }

        const res = await updateDiscount(token, req);

        if (res?.success) {
            setReload(!reload);
            clearInputs();
            setAlert({
                message: "Discount has been successfully updated.",
                type: "success",
                open: true
            })
        } else {
            setAlert({
                message: "Failed to update the discount",
                type: "error",
                open: true
            })
        }
    }

    //////////////// ERRORS ////////////////////
    // const [errors, setErrors] = useState({
    //     pcode: false,
    //     minQuant: false,
    //     maxQuant: false,
    //     minPercentage: false,
    //     maxPercentage: false,
    //     percentageType: false,
    //     discountName: false,
    // });

    // const validateForm = () => {
    //     const newErrors = {
    //         pcode: !pcode.trim(),
    //         minQuant: minQuant <= 0,
    //         maxQuant: maxQuant <= 0,
    //         minPercentage: minPercentage <= 0,
    //         maxPercentage: maxPercentage <= 0,
    //         percentageType: !percentageType.trim(),
    //         discountName: !discountName.trim(),

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
                        {view && 'View Discount'}
                        {create && 'Create Discount'}
                        {edit && 'Update Discount'}
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
                                <FormControl fullWidth size="small" disabled={!create} error={Boolean(fieldErrors.pcode)}>
                                    <InputLabel>Product *</InputLabel>
                                    <Select
                                        label="Product *"
                                        value={pcode || ""}
                                        onChange={(e) => setPcode(e.target.value)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        {disProductList?.map((item, index) => (
                                            <MenuItem key={index} value={item.productCode}>
                                                {item.productName} - {item.productCode}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.pcode}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small" disabled={!create} error={Boolean(fieldErrors.percentageType)}>
                                    <InputLabel>Discount Type *</InputLabel>
                                    <Select
                                        label="Discount Type *"
                                        value={percentageType || ""}
                                        onChange={(e) => setPercentageType(e.target.value)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        <MenuItem value={"percentage"}>Percentage</MenuItem>
                                        <MenuItem value={"flat"}>Flat Rate</MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.percentageType}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    disabled={!create}
                                    value={discountName || ""}
                                    onChange={(e) => setDiscountName(e.target.value)}
                                    fullWidth
                                    variant='outlined'
                                    label="Discount Name *"
                                    size='small'
                                    error={Boolean(fieldErrors.discountName)}
                                    helperText={fieldErrors.discountName}
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
                                    value={minPercentage || ""}
                                    onChange={(e) => setMinPercentage(parseFloat(e.target.value))}
                                    fullWidth
                                    variant='outlined'
                                    label="Minimum Deduction *"
                                    size='small'
                                    type='number'
                                    error={Boolean(fieldErrors.minPercentage)}
                                    helperText={fieldErrors.minPercentage}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={maxPercentage || ""}
                                    onChange={(e) => setMaxPercentage(parseFloat(e.target.value))}
                                    fullWidth
                                    variant='outlined'
                                    label="Maximum Deduction *"
                                    size='small'
                                    type='number'
                                    disabled={percentageType == "flat" || !create}
                                    error={Boolean(fieldErrors.maxPercentage)}
                                    helperText={fieldErrors.maxPercentage}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <CustomDatePicker
                                    label='Effective From *'
                                    setvalue={setEffectiveFrom}
                                    minDate={create ? dayjs(new Date) : effectiveFrom}
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
