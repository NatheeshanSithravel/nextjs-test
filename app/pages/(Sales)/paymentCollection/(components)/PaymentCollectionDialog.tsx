import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, ToggleButton } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addInvoice, addNewGRN, addOrder, addReturnInvoices, findBatchByCode, findDistributors, getBatchByProductCode, retrieveAllDiscountsByProductCode, retrieveAllProductCategories, retriewAllDistributors, retriewAllSellableProducts, retriewAllSellableProductsForStock, retriveStockByProductCode, savePayments, selectFreeIssueByProduct, validateReturnBatchID } from '@/app/(services)/SFARestClient';
import dayjs from 'dayjs';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';

interface Props {
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;
    selectedInvoice: any;
}

interface FieldErrors {
    paymentMethod: string;
    todaysCollection: string;
    comment: string;
   
}


export default function PaymentCollectionDialog({
    setReload, reload, selectedInvoice
}: Props) {

    /////////////////// New Validation /////////////////////
    const initialErrors: FieldErrors = {
        paymentMethod: "",
        todaysCollection: "",
        comment: ""
    }

    const [fieldErrors, setfieldErrors] = useState<FieldErrors>({ ...initialErrors });

    const validateForm = () => {
        const newErrors: Partial<FieldErrors> = {};
        setfieldErrors(initialErrors);

        if (!paymentMethod) {
            newErrors.paymentMethod = "Payment Method is required";
        }

        if (!todaysCollection) {
            newErrors.todaysCollection = "Todays Collection is required";
        }

        if (!comment) {
            newErrors.comment = "Comment is required";
        }else if (comment.trim().length == 0) {
            newErrors.comment = "Comment cannot be empty";
        } else if (comment.length > 200) {
            newErrors.comment = "Comment cannot exceed 200 characters"
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
    const [paymentMethod, setpaymentMethod] = useState<any>("");
    const [todaysCollection, settodaysCollection] = useState<any>("");
    const [nextPaymentDate, setnextPaymentDate] = useState<any>(dayjs(new Date()));
    const [comment, setcomment] = useState<any>("");

    ///////////////////// Inits /////////////////////
    const init = async () => {

    }




    //////////////////Helpers///////////////
    const clearInputs = () => {
        setpaymentMethod("");
        settodaysCollection("");
        setnextPaymentDate(dayjs(new Date()));
        setcomment("");
    }




    ///////////////////// Methods /////////////////////
    const saveDisPayments = async () => {

        if (!validateForm()) {
            return;
        }

        let paymentList: any[] = [];

        let disCollection: any = {};

        disCollection.invoiceId = selectedInvoice.invoiceId;
        disCollection.balanceAmount =  selectedInvoice.remainingBalance;

        if (paymentMethod == "Credit") {
            disCollection.customerCredit = todaysCollection;
            disCollection.paymentMethod = "Credit";
        } else if (paymentMethod == "Cash") {
            disCollection.customerCredit =  0.0;
            disCollection.paymentMethod = "Cash";
        } else if (paymentMethod == "Checque") {
            disCollection.customerCredit =  0.0;
            disCollection.paymentMethod = "Checque";
        }
        disCollection.paidAmount = todaysCollection;
        disCollection.nextPaymentDate =  dayjs(nextPaymentDate).format('YYYY-MM-DD HH:mm:ss');
        // paymentList.push(disCollection);

        const req = {
            tokenString:token,
            paymentCollectionList:[disCollection]
        }

        const res = await savePayments(token, req);
        if(res?.success){
            setAlert({
                message:"Payment has been successfully collected.",
                type:"success",
                open:true
            })
           
            setTimeout(() => {
                closeDialog();
                setReload(!reload);
            }, 3000);
        } else {
            setAlert({
                message:`Payment collection has been failed. ${res?.message}`,
                type:"error",
                open:true
            })
        }

    }




    //////// Table Pagination ///////////
    const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page
    const [tablePage, settablePage] = useState(0);
    const handleChangePage = (event: unknown, newPage: number) => {
        settablePage(newPage);
    };
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        settablePage(0);
    };




    return (
        <React.Fragment>
            <IconButton onClick={() => { clearInputs(); openDialog() }}><Edit /></IconButton>

            <Dialog open={open} sx={{ backdropFilter: 'blur(3px)' }} maxWidth='sm' >
                <GlobalAlert alert={alert} setAlert={setAlert} />

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        Invoice No - {selectedInvoice.invoiceId}
                    </DialogTitle>
                    <DialogActions>
                        <IconButton onClick={closeDialog}>
                            <Close />
                        </IconButton>
                    </DialogActions>
                </Stack>
                <Divider />
                <DialogContent >
                    <Stack>

                        <Grid2 container spacing={2} width={'100%'}>

                            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <TextField
                                    value={selectedInvoice.invoiceId}
                                    disabled={true}
                                    variant='outlined'
                                    size='small'
                                    label='Invoice No'
                                    fullWidth
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <TextField
                                    value={selectedInvoice.totalAmount}
                                    disabled={true}
                                    variant='outlined'
                                    size='small'
                                    label='Total Amount'
                                    fullWidth
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <TextField
                                    value={selectedInvoice.remainingBalance}
                                    disabled={true}
                                    variant='outlined'
                                    size='small'
                                    label='Remaining Balance'
                                    fullWidth
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <FormControl fullWidth size="small" error={Boolean(fieldErrors.paymentMethod)}>
                                    <InputLabel>Payment Method *</InputLabel>
                                    <Select
                                        label="Payment Method *"
                                        value={paymentMethod || ""}
                                        onChange={(e) => { setpaymentMethod(e.target.value); }}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        <MenuItem value={"Credit"}>Credit</MenuItem>
                                        <MenuItem value={"Cash"}>Cash</MenuItem>
                                        <MenuItem value={"Cheque"}>Cheque</MenuItem>
                                    </Select>

                                    <FormHelperText>
                                        {fieldErrors.paymentMethod}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <TextField
                                    value={todaysCollection || ""}
                                    onChange={(e) => settodaysCollection(parseFloat(e.target.value))}
                                    variant='outlined'
                                    size='small'
                                    label='Today`s Collection *'
                                    fullWidth
                                    type="number"
                                    error={Boolean(fieldErrors.todaysCollection)}
                                    helperText={fieldErrors.todaysCollection}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <CustomDatePicker
                                    label='Next Paymenmt Date *'
                                    setvalue={setnextPaymentDate}
                                    value={nextPaymentDate}
                                    size={'small'}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                <TextField
                                    value={comment || ""}
                                    onChange={(e) => setcomment(e.target.value)}
                                    variant='outlined'
                                    size='small'
                                    label='Comment *'
                                    fullWidth
                                    multiline
                                    rows={3}
                                    error={Boolean(fieldErrors.comment)}
                                    helperText={fieldErrors.comment}
                                />
                            </Grid2>

                        </Grid2>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={'end'} my={2}>
                            <PrimaryButton label='Submit' onClick={saveDisPayments} />
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
        </React.Fragment >
    );
}
