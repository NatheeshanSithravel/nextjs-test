import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addNewGRN, getBatchByProductCode } from '@/app/(services)/SFARestClient';
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
    globalDistributorsList: any[];
    globalProductList: any[];
    disGrn?: any;
}

interface FieldErrorsPageOne {
    dealerId: string;
    invoiceNo: string;
    note: string;
}

interface FieldErrorsPageTwo {
    productCategory: string;
    product: string;
    batchCode: string;
    issuedQty: string;
    serialStart: string;
    serialEnd: string;
}

export default function GINDialog({
    view, edit, create, setReload, reload,
    globalProductCatList,
    globalDistributorsList,
    globalProductList,
    disGrn
}: Props) {

    /////////////////// New Validation /////////////////////
    const initialErrorsPageOne: FieldErrorsPageOne = {
        dealerId: "",
        invoiceNo: "",
        note:""
    }

    const [fieldErrorsPageOne, setfieldErrorsPageOne] = useState<FieldErrorsPageOne>({ ...initialErrorsPageOne });

    const validateFormOne = () => {
        const newErrors: Partial<FieldErrorsPageOne> = {};
        setfieldErrorsPageOne(initialErrorsPageOne);

        if (!dealerId) {
            newErrors.dealerId = "Assigned distributor is required";
        }

        if (!invoiceNo) {
            newErrors.invoiceNo = "Invoice number cannot be empty";
        } else if (invoiceNo.trim().length == 0) {
            newErrors.invoiceNo = "Invoice number cannot be empty";
        } else if (invoiceNo.length > 10) {
            newErrors.invoiceNo = "Invoice number cannot exceed 10 characters"
        } else if (!alphanumericCharactersRegex.test(invoiceNo)) {
            newErrors.invoiceNo = "Invoice number can only contain alphabetic characters"
        }

        if (note.length > 255) {
            newErrors.note = "Note cannot exceed 255 characters"
        }

        setfieldErrorsPageOne((prevErrors) => ({
            ...prevErrors,
            ...newErrors,
        }));

        return Object.keys(newErrors).length === 0;
    }

    const initialErrorsPageTwo: FieldErrorsPageTwo = {
        productCategory: "",
        product: "",
        batchCode: "",
        issuedQty: "",
        serialStart: "",
        serialEnd: ""
    }

    const [fieldErrorsPageTwo, setfieldErrorsPageTwo] = useState<FieldErrorsPageTwo>({ ...initialErrorsPageTwo });

    const validateFormTwo = () => {
        const newErrors: Partial<FieldErrorsPageTwo> = {};
        setfieldErrorsPageTwo(initialErrorsPageTwo);

        if (!productCategory) {
            newErrors.productCategory = "Product category is required";
        }

        if (!product) {
            newErrors.product = "Product code is required";
        }

        if (!batchCode) {
            newErrors.batchCode = "Batch code is required";
        }

        if (issuedQty <= 0) {
            newErrors.issuedQty = "Issued quantity must be greater than 0";
        } else if (issuedQty > 999999) {
            newErrors.issuedQty = "Issued quantity cannot exceed 999999";
        }

        if (serialStart <= 0) {
            newErrors.serialStart = "Serial start must be greater than 0";
        } else if (serialStart > 999999) {
            newErrors.serialStart = "Serial start cannot exceed 999999";
        }

        if (serialEnd <= 0) {
            newErrors.serialEnd = "Serial end must be greater than 0";
        } else if (serialEnd > 999999) {
            newErrors.serialEnd = "Serial end cannot exceed 999999";
        }

        setfieldErrorsPageTwo((prevErrors) => ({
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
        clearInputs();
        setfieldErrorsPageOne(initialErrorsPageOne)
        setfieldErrorsPageTwo(initialErrorsPageTwo)
        setpage(1)
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

    const [page, setpage] = useState(1);

    //Page 1
    const [dealerId, setdealerId] = useState<any>("");
    const [issueDate, setissueDate] = useState<any>(dayjs(new Date()));
    const [invoiceNo, setinvoiceNo] = useState<any>("");
    const [note, setnote] = useState<any>("");

    //Page 2
    const [productCategory, setproductCategory] = useState<any>("");
    const [filteredProductList, setfilteredProductList] = useState<any[]>([]);
    const [product, setproduct] = useState<any>("");
    const [batchList, setbatchList] = useState<any[]>([]);
    const [batchCode, setbatchCode] = useState<any>("");
    const [issuedQty, setissuedQty] = useState<any>("");
    const [serialStart, setserialStart] = useState<any>("");
    const [serialEnd, setserialEnd] = useState<any>("");
    const [grnAddedProducts, setgrnAddedProducts] = useState<any[]>([]);



    ///////////////////// Inits /////////////////////
    useEffect(() => {
        if (disGrn) {
            setInputs();
        }
    }, [disGrn]);

    //////////////////Helpers///////////////
    const clearInputs = () => {
        setdealerId("");
        setissueDate(dayjs(new Date()));
        setinvoiceNo("");
        setnote("");
        setproductCategory("");
        setfilteredProductList([]);
        setproduct("");
        setbatchList([]);
        setbatchCode("");
        setissuedQty("");
        setserialStart("");
        setserialEnd("");
        setgrnAddedProducts([]);
        setpage(1)
    }

    const setInputs = () => {
        setdealerId(disGrn.storeId);
        setissueDate(dayjs(disGrn.addedAt));
        setinvoiceNo(disGrn.invoiceNumber);
        setnote(disGrn.companyNote);
        setgrnAddedProducts(disGrn.disGrnDetails);
    }



    ///////////////////// Methods /////////////////////
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

    useEffect(() => {
        setbatchList([])
        if (product != "") {
            getBatchDetailsByProductCode();
        }
    }, [product]);

    const getBatchDetailsByProductCode = async () => {
        const req = {
            tokenString: token,
            productCode: product,
            batchStatus: null
        }
        const res = await getBatchByProductCode(token, req);

        if (res?.success === true) {
            setbatchList(res.batchList)
        } else {
            setAlert({
                message: `Somthing is not right`,
                type: 'error',
                open: true
            })
        }
    }

    const addProductsToTheList = () => {

        if (!validateFormTwo()) {
            return;
        }

        let qty = batchList.find(i => i.batchCode == batchCode)?.totalQuantity;
        if (qty < issuedQty) {
            setAlert({
                message: `Batch quantity cannot be exceeded.`,
                type: 'error',
                open: true
            })
            return;
        }

        const tempDisGRN = {
            issuesQuantity: issuedQty,
            dealerNote: note,
            productCode: product,
            batchCode: batchCode,
            serialEndNumber: parseInt(serialEnd),
            serialStartNumber: parseInt(serialStart)
        };

        setgrnAddedProducts([...grnAddedProducts, tempDisGRN]);

        setproductCategory("");
        setproduct("");
        setbatchList([]);
        setbatchCode("")
        setissuedQty("");
        setserialStart("");
        setserialEnd("");
    }


    const saveGRNDistributor = async () => {

        let shop = globalDistributorsList.find(i => i.id == dealerId);
        let distributorID = shop?.dealerCode;

        let tempGRN = {
            invoiceNumber: invoiceNo,
            dealerId: distributorID,
            companyNote: note,
            storeId: dealerId
        };

        const req = {
            tokenString: token,
            disGrn: tempGRN,
            disGrnDetailsList: grnAddedProducts
        }

        const res = await addNewGRN(token, req);
        if (res?.success === true) {
            clearInputs();
            setAlert({
                open: true,
                type: "success",
                message: "New good issue note has been successfully created.",
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
                message: "Creation of Good issue note has been failed.",
            });
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

    // /////////////// ERRORS //////////////////
    // const [errors, setErrors] = useState({
    //     dealerId: false,
    //     issueDate: false,
    //     invoiceNo: false,
    //     productCategory: false,
    //     product: false,
    //     batchCode: false,
    //     issuedQty: false,
    //     serialStart: false,
    //     serialEnd: false,
    // });

    // const validateForm = () => {
    //     const newErrors = {
    //         dealerId: !dealerId, // Check if dealerId is empty
    //         issueDate: !issueDate, // Check if issueDate is empty
    //         invoiceNo: !invoiceNo.trim(), // Check if invoiceNo is empty
    //         productCategory: page === 2 && !productCategory, // Check if productCategory is empty (only for page 2)
    //         product: page === 2 && !product, // Check if product is empty (only for page 2)
    //         batchCode: page === 2 && !batchCode, // Check if batchCode is empty (only for page 2)
    //         issuedQty: page === 2 && (issuedQty <= 0 || !issuedQty), // Check if issuedQty is empty or invalid (only for page 2)
    //         serialStart: page === 2 && (serialStart <= 0 || !serialStart), // Check if serialStart is empty or invalid (only for page 2)
    //         serialEnd: page === 2 && (serialEnd <= 0 || !serialEnd), // Check if serialEnd is empty or invalid (only for page 2)
    //     };

    //     setErrors(newErrors);

    //     return !Object.values(newErrors).some(error => error);
    // };



    return (
        <React.Fragment>
            {create && <PrimaryButton onClick={openDialog} label="ADD" icon={<Add />} />}
            {view && <IconButton onClick={openDialog}><Visibility /></IconButton>}
            {edit && <IconButton onClick={openDialog}><Edit /></IconButton>}

            <Dialog open={open} sx={{ backdropFilter: 'blur(3px)' }} maxWidth='md' fullWidth >
                <GlobalAlert alert={alert} setAlert={setAlert} />

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        {view && 'View Good Issue Note'}
                        {create && 'Create Good Issue Note'}
                        {edit && 'Update Good Issue Note'}
                    </DialogTitle>
                    <DialogActions>
                        <IconButton onClick={closeDialog}>
                            <Close />
                        </IconButton>
                    </DialogActions>
                </Stack>
                <Divider />
                <DialogContent sx={{ width: '900px' }}>
                    <Stack>
                        {page == 1 &&
                            <Grid2 container spacing={2}>
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <FormControl fullWidth size="small" disabled={view} error={Boolean(fieldErrorsPageOne.dealerId)}>
                                        <InputLabel>Assigned Distributor *</InputLabel>
                                        <Select
                                            label="Assigned Distributor *"
                                            value={dealerId || ""}
                                            onChange={(e) => setdealerId(e.target.value as number)}

                                        >
                                            <MenuItem value={""}>Please select an option</MenuItem>
                                            {globalDistributorsList?.map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.storeName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>
                                            {fieldErrorsPageOne.dealerId}
                                        </FormHelperText>
                                    </FormControl>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <CustomDatePicker
                                        disabled={view}
                                        label='Issueing Date *'
                                        setvalue={setissueDate}
                                        value={issueDate}
                                        minDate={view ? undefined : dayjs(new Date())}
                                        size={'small'}
                                    />
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        disabled={view}
                                        value={invoiceNo || ""}
                                        onChange={(e) => setinvoiceNo(e.target.value)}
                                        fullWidth
                                        variant='outlined'
                                        label="Invoice Number *"
                                        size='small'
                                        error={Boolean(fieldErrorsPageOne.invoiceNo)}
                                        helperText={fieldErrorsPageOne.invoiceNo}
                                    />
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        disabled={view}
                                        value={note || ""}
                                        onChange={(e) => setnote(e.target.value)}
                                        fullWidth
                                        variant='outlined'
                                        label="Notes"
                                        size='small'
                                        // inputProps={{ maxLength: 255 }}
                                        error={Boolean(fieldErrorsPageOne.note)}
                                        helperText={fieldErrorsPageOne.note}
                                    />
                                </Grid2>

                            </Grid2>
                        }
                        {page == 2 &&
                            <Stack width={'100%'} spacing={2}>
                                {
                                    create &&
                                    <React.Fragment>
                                        <Grid2 container spacing={2}>
                                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                                <FormControl fullWidth size="small" error={Boolean(fieldErrorsPageTwo.productCategory)}>
                                                    <InputLabel>Product Category *</InputLabel>
                                                    <Select
                                                        label="Product Category *"
                                                        value={productCategory || ""}
                                                        // onChange={(e) => setproductCategory(e.target.value as number)}
                                                        //reset product - BUG 66729
                                                         onChange={(e) => {
                                                            setproductCategory(e.target.value as number);
                                                            setproduct(""); 
                                                            setbatchCode(""); 
                                                            setissuedQty("");
                                                            setserialStart(""); 
                                                            setserialEnd(""); 
                                                         }}

                                                    >

                                                        <MenuItem value={""}>Please select an option</MenuItem>
                                                        {globalProductCatList?.map((item) => (
                                                            <MenuItem key={item.categoryId} value={item.categoryId}>
                                                                {item.categoryName}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    <FormHelperText>
                                                        {fieldErrorsPageTwo.productCategory}
                                                    </FormHelperText>
                                                </FormControl>
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                                <FormControl fullWidth size="small" error={Boolean(fieldErrorsPageTwo.product)}>
                                                    <InputLabel>Product Name/Code *</InputLabel>
                                                    <Select
                                                        label="Product Name/Code *"
                                                        value={product || ""}
                                                        onChange={(e) => {setproduct(e.target.value);
                                                            setbatchCode("");
                                                            setissuedQty("");
                                                            setserialStart(""); 
                                                            setserialEnd(""); 
                                                         
                                                        }}

                                                    >
                                                        <MenuItem value={""}>Please select an option</MenuItem>
                                                        {filteredProductList?.map((item) => (
                                                            <MenuItem key={item.productCode} value={item.productCode}>
                                                                {item.productName} / {item.productCode}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    <FormHelperText>
                                                        {fieldErrorsPageTwo.product}
                                                    </FormHelperText>
                                                </FormControl>
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                                <FormControl fullWidth size="small" error={Boolean(fieldErrorsPageTwo.batchCode)}>
                                                    <InputLabel>Batch Code *</InputLabel>
                                                    <Select
                                                        label="Batch Code *"
                                                        value={batchCode || ""}
                                                        onChange={(e) => {setbatchCode(e.target.value);
                                                            setissuedQty("");
                                                            setserialStart(""); 
                                                            setserialEnd(""); 
                                                        }}

                                                    >
                                                        <MenuItem value={""}>Please select an option</MenuItem>
                                                        {batchList?.map((item) => (
                                                            <MenuItem key={item.batchCode} value={item.batchCode}>
                                                                {item.batchCode} - (QTY {item.totalQuantity} )
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    <FormHelperText>
                                                        {fieldErrorsPageTwo.batchCode}
                                                    </FormHelperText>
                                                </FormControl>
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    value={issuedQty || ""}
                                                    onChange={(e) => setissuedQty(Number(e.target.value))}
                                                    fullWidth
                                                    variant='outlined'
                                                    label="Issued Quantity*"
                                                    size='small'
                                                    error={Boolean(fieldErrorsPageTwo.issuedQty)}
                                                    helperText={fieldErrorsPageTwo.issuedQty}
                                                />
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    value={serialStart || ""}
                                                    onChange={(e) => setserialStart(Number(e.target.value))}
                                                    fullWidth
                                                    variant='outlined'
                                                    label="Serial Start *"
                                                    size='small'
                                                    error={Boolean(fieldErrorsPageTwo.serialStart)}
                                                    helperText={fieldErrorsPageTwo.serialStart}
                                                />
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    value={serialEnd || ""}
                                                    onChange={(e) => setserialEnd(Number(e.target.value))}
                                                    fullWidth
                                                    variant='outlined'
                                                    label="Serial End *"
                                                    size='small'
                                                    error={Boolean(fieldErrorsPageTwo.serialEnd)}
                                                    helperText={fieldErrorsPageTwo.serialEnd}
                                                />
                                            </Grid2>
                                        </Grid2>
                                        <Stack direction={'row'}>
                                            <PrimaryButton onClick={addProductsToTheList} label='Add' />
                                        </Stack>
                                    </React.Fragment>
                                }

                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell ><strong>Product Code</strong></TableCell>
                                                <TableCell ><strong>Issued Quantity</strong></TableCell>
                                                <TableCell><strong>Remark</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {grnAddedProducts
                                                ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                                                .map((row: any, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{row.productCode}</TableCell>
                                                        <TableCell>{row.issuesQuantity}</TableCell>
                                                        <TableCell>{row.dealerNote}</TableCell>
                                                    </TableRow>
                                                ))}

                                        </TableBody>
                                    </Table>
                                    <TablePagination
                                        component="div"
                                        count={grnAddedProducts?.length || 0}
                                        page={tablePage}
                                        onPageChange={handleChangePage}
                                        rowsPerPage={rowsPerPage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                        rowsPerPageOptions={[5, 10, 25, 50]}
                                    />
                                </TableContainer>
                            </Stack>
                        }
                        <Stack alignItems={"end"} mt={2} flexDirection={'row-reverse'} gap={1}>
                            {loading ? <CircularProgress color="secondary" /> :
                                <React.Fragment>
                                    {create && page == 2 && <PrimaryButton onClick={saveGRNDistributor} label='Save' disabled={grnAddedProducts.length == 0} />}
                                    {page == 1 ? <PrimaryButton onClick={() => {
                                        if (validateFormOne()) {
                                            setpage(2);
                                        }
                                    }} label='Next' />
                                        : <PrimaryButton onClick={() => setpage(1)} label='Back' />
                                    }
                                </React.Fragment>
                            }
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
        </React.Fragment >
    );
}
