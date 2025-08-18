import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, ToggleButton } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addInvoice, addNewGRN, addOrder, getBatchByProductCode, retrieveAllDiscountsByProductCode, retriewAllSellableProductsForStock, retriveStockByProductCode, selectFreeIssueByProduct } from '@/app/(services)/SFARestClient';
import dayjs from 'dayjs';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';

interface Props {
    ///// Common ////////
    view?: boolean;
    edit?: boolean;
    create?: boolean;
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;
    //////// Spceific////////////
    invoice?: any,
    globalDistributorsList: any[];
    globalSalesPoints: any[];
    globalProductCatList: any[];
}

interface FieldErrorsPageOne {
    shopID: string,
    assignedDistributor: string,
    invoiceType: string,
    paymentMethod: string,
    expectedDate: string,
    returnAmount: string,
    returnCredits: string
}

interface FieldErrorsPageTwo {
    productCategory: string,
    product: string,
    requestedQuantity: string,
}

export default function InvoiceDialog({
    view, edit, create, setReload, reload,
    globalSalesPoints,
    globalDistributorsList,
    globalProductCatList,
    invoice
}: Props) {

    /////////////////// New Validation /////////////////////
    const initialErrorsPageOne: FieldErrorsPageOne = {
        shopID: "",
        assignedDistributor: "",
        invoiceType: "",
        paymentMethod: "",
        expectedDate: "",
        returnAmount: "",
        returnCredits: ""
    }

    const [fieldErrorsPageOne, setfieldErrorsPageOne] = useState<FieldErrorsPageOne>({ ...initialErrorsPageOne });

    const validatePage1 = () => {
        const newErrors: Partial<FieldErrorsPageOne> = {};
        setfieldErrorsPageOne(initialErrorsPageOne);

        if (!shopID) {
            newErrors.shopID = "Shop ID is required";
        }

        if (!assignedDistributor) {
            newErrors.assignedDistributor = "Assigned Distributor is required";
        }

        if (!invoiceType) {
            newErrors.invoiceType = "Invoice Type is required";
        }

        if (!paymentMethod) {
            newErrors.paymentMethod = "Payment Method is required";
        }

        if (returnCredits === "1" && !returnAmount) {
            newErrors.returnAmount = "Return amount is required";
        }

        if (!returnCredits) {
            newErrors.returnCredits = "Return credit is required";
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
        requestedQuantity: ""
    }

    const [fieldErrorsPageTwo, setfieldErrorsPageTwo] = useState<FieldErrorsPageTwo>({ ...initialErrorsPageTwo });

    const validatePage2 = () => {
        const newErrors: Partial<FieldErrorsPageTwo> = {};
        setfieldErrorsPageTwo(initialErrorsPageTwo);

        if (!productCategory) {
            newErrors.productCategory = "Product category is required";
        }

        if (!product) {
            newErrors.product = "Product code is required";
        }   

        if (!requestedQuantity) {
            newErrors.requestedQuantity = " Required quantity is required"
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
        if(create){
            clearInputs();
        }
        setfieldErrorsPageOne(initialErrorsPageOne)
        setfieldErrorsPageTwo(initialErrorsPageTwo)
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

    const [page, setpage] = useState<number>(1);

    const [requestedQuantity, setrequestedQuantity] = useState<any>("");

    const [globalProductList, setglobalProductList] = useState<any[]>([]);
    const [filteredProductList, setfilteredProductList] = useState<any[]>([]);
    const [globalDiscountList, setglobalDiscountList] = useState<any[]>([]);
    const [allFreeIssueList, setallFreeIssueList] = useState<any[]>([]);
    const [globalFreeIssueList, setglobalFreeIssueList] = useState<any[]>([]);

    // Page 1
    const [shopID, setshopID] = useState<any>("");
    const [dateBoundries, setdateBoundries] = useState<boolean>(false);
    const [assignedDistributor, setassignedDistributor] = useState<any>("");
    const [invoiceType, setinvoiceType] = useState<any>("0");
    const [paymentMethod, setpaymentMethod] = useState<any>("");
    const [expectedDate, setexpectedDate] = useState<any>(dayjs(new Date()));
    const [returnCredits, setreturnCredits] = useState<any>("0");
    const [returnAmount, setreturnAmount] = useState<any>("");

    // Page 2
    const [productCategory, setproductCategory] = useState<any>("");
    const [product, setproduct] = useState<any>("");
    const [discountType, setdiscountType] = useState<any>("");
    const [selectedFreeIssue, setselectedFreeIssue] = useState<any>("");
    const [enableDiscount, setenableDiscount] = useState<boolean>(true);
    const [enableFreeIssue, setenableFreeIssue] = useState<boolean>(true);
    const [disInvoice, setdisInvoice] = useState<any>({});
    const [disOrder, setdisOrder] = useState<any>({});

    const [invoiceDetailsList, setinvoiceDetailsList] = useState<any[]>([]);


    ///////////////////// Inits /////////////////////
    useEffect(() => {
        if (invoice) {
            setInputs();
        }
    }, [invoice]);

    //////////////////Helpers///////////////
    const clearInputs = () => {
        setshopID("");
        setdateBoundries(false);
        setassignedDistributor("");
        setinvoiceType("0");
        setpaymentMethod("");
        setexpectedDate(dayjs(new Date()));
        setreturnCredits("0");
        setreturnAmount("");
        setproductCategory("");
        setproduct("");
        setdiscountType("");
        setselectedFreeIssue("");
        setenableDiscount(true);
        setenableFreeIssue(true);
        setdisInvoice({});
        setdisOrder({});
        setinvoiceDetailsList([]);
        setrequestedQuantity("");
        setpage(1)
    }

    const setInputs = () => {
        if (invoice) {

        }
    }

    ///////////////////// Methods /////////////////////


    const getProductsRelaventToStore = async () => {
        if (assignedDistributor != "") {
            const req = {
                tokenString: token,
                storeLocationId: assignedDistributor
            }
            const res = await retriewAllSellableProductsForStock(token, req);

            if (res?.success === true) {
                setglobalProductList(res.disProductList)
                setfilteredProductList(res.disProductList)
            } else {
                setglobalProductList([]);
                setfilteredProductList([])
            }
        }

    }

    useEffect(() => {
        getProductsRelaventToStore();
    }, [assignedDistributor]);

    const productFilter = (value: any) => {
        let tempProductList = globalProductList.filter(i => i.categoryId == value);
        setfilteredProductList(tempProductList);
    }

    const setBasicInformation = () => {
        if (!validatePage1()) {
            return;
        } 

        setdisInvoice((prev: any) => ({
            ...prev,
            customerId: shopID,
            invoiceType: "Company to distributor",
            printedCount: 0,
            source: "WEB",
            itineraryId: 1,
            cash: 0.0,
            cheque: 0.0,
            latitude: "0.0",
            longitude: "0.0",

        }))

        setdisOrder((prev: any) => ({
            ...prev,
            orderType: "Sales",
            expectedDate: dayjs(expectedDate).format('YYYY-MM-DD HH:mm:ss'),
            saleType: "Outlet",
            requestedLocationId: shopID

        }))

        setpage(2)

    }


    const discountActivator = async () => {
        setenableDiscount(false);

        if (requestedQuantity != null && requestedQuantity > 0) {
            setenableDiscount(false);
            const tempDiscountRequest = {
                tokenString: token,
                productCode: product,
            };
            const tempDiscountResponse = await retrieveAllDiscountsByProductCode(token, tempDiscountRequest);
            if (tempDiscountResponse.success) {
                setglobalDiscountList(tempDiscountResponse.discountQuantList);
            } else {
                setglobalDiscountList([]);
                setenableDiscount(true);
            }
        } else {
            setglobalDiscountList([]);
            setenableDiscount(true);
        }
    }

    const freeIssueActivator = async () => {
        setenableFreeIssue(false);

        if (requestedQuantity != null && requestedQuantity > 0) {
            setenableFreeIssue(false);
            const tempDiscountRequest = {
                tokenString: token,
                productCode: product,
            };
            const tempFreeIssue = await selectFreeIssueByProduct(token, tempDiscountRequest);
            if (tempFreeIssue.success) {
                setglobalFreeIssueList(tempFreeIssue.freeIssueList);
                const tempAllFreeIssueList = tempFreeIssue.freeIssueList.filter((freeIssue: any) => freeIssue.minQuant < requestedQuantity);
                setallFreeIssueList(tempAllFreeIssueList.length > 0 ? tempAllFreeIssueList : []);
            } else {
                setglobalFreeIssueList([]);
                setallFreeIssueList([]);
                setenableFreeIssue(true);
            }
        } else {
            setglobalFreeIssueList([]);
            setallFreeIssueList([]);
            setenableFreeIssue(true);
        }
    }

    useEffect(() => {
        discountActivator();
        freeIssueActivator();
    }, [product, requestedQuantity]);

    const addProductsToTheList = async () => {

        if (!validatePage2()) {
            return;
        }        

        if (invoiceDetailsList.some(item => item.productCode === product)) {
            setAlert({
                open: true,
                type: "error",
                message: "This product is already added to the list"
            });
            return;
        }

        let tempDisInvoiceDatail: any = {};
        let selectedProduct: any = {};
        let selectedDiscount: any = {};
        let selectedFreeIssue: any = {};
        let netAmount = 0.0;
        let runLoop = true;

        try {
            for (let tempProduct of globalProductList) {
                if (product === tempProduct.productCode) {
                    selectedProduct = tempProduct;
                }
            }

            const tempRequest = {
                tokenString: token,
                productCode: product,
                locationId: assignedDistributor
            };

            const stockPriceCheckTemp = await retriveStockByProductCode(token, tempRequest);

            if (stockPriceCheckTemp.success && stockPriceCheckTemp.disStockList != null) {
                for (let productStock of stockPriceCheckTemp.disStockList) {
                    if ((productStock.availableQuantity >= requestedQuantity) && (requestedQuantity > 0) && (runLoop)) {
                        tempDisInvoiceDatail = {
                            productCode: product,
                            quantity: requestedQuantity,
                            unitPrice: productStock.skuprice,
                            totalAmount: productStock.skuprice * requestedQuantity,
                            stockId: productStock.id
                        };

                        if (globalDiscountList != null) {
                            for (let thisDiscount of globalDiscountList) {
                                if (discountType === thisDiscount.discountQuantId) {
                                    selectedDiscount = thisDiscount;
                                    tempDisInvoiceDatail.discountType = selectedDiscount.percentageType;
                                }
                            }
                        }

                        if (selectedDiscount.disPercentage != null && selectedDiscount.discountValue != null) {
                            // Do nothing
                        } else if (selectedDiscount.disPercentage == null && selectedDiscount.discountValue != null) {
                            tempDisInvoiceDatail.discountValue = selectedDiscount.discountValue;
                            netAmount = (productStock.skuprice * requestedQuantity) - selectedDiscount.discountValue;
                        } else if (selectedDiscount.disPercentage != null && selectedDiscount.discountValue == null) {
                            tempDisInvoiceDatail.discountPercentage = selectedDiscount.disPercentage;
                            netAmount = (productStock.skuprice * requestedQuantity) - (productStock.skuprice * requestedQuantity * selectedDiscount.disPercentage);
                        } else {
                            netAmount = productStock.skuprice * requestedQuantity;
                        }

                        tempDisInvoiceDatail.netAmount = netAmount;
                        setinvoiceDetailsList(prev => [...prev, tempDisInvoiceDatail]);
                        runLoop = false;
                    } else if ((productStock.availableQuantity < requestedQuantity) && (requestedQuantity > 0) && (runLoop)) {
                        setrequestedQuantity(requestedQuantity - productStock.availableQuantity);
                        tempDisInvoiceDatail = {
                            productCode: selectedProduct.productCode,
                            quantity: productStock.availableQuantity,
                            unitPrice: productStock.skuprice,
                            totalAmount: productStock.skuprice * productStock.availableQuantity,
                            stockId: productStock.id
                        };

                        if (globalDiscountList != null) {
                            for (let thisDiscount of globalDiscountList) {
                                if (discountType === thisDiscount.discountQuantId) {
                                    selectedDiscount = thisDiscount;
                                }
                            }
                        }

                        tempDisInvoiceDatail.discountPercentage = selectedDiscount.disPercentage;
                        tempDisInvoiceDatail.discountValue = selectedDiscount.discountValue;

                        if (selectedDiscount.disPercentage != null && selectedDiscount.discountValue != null) {
                            // Do nothing
                        } else if (selectedDiscount.disPercentage == null && selectedDiscount.discountValue != null) {
                            netAmount = (productStock.skuprice * productStock.availableQuantity) - selectedDiscount.discountValue;
                        } else if (selectedDiscount.disPercentage != null && selectedDiscount.discountValue == null) {
                            netAmount = (productStock.skuprice * productStock.availableQuantity) - (productStock.skuprice * productStock.availableQuantity * selectedDiscount.disPercentage);
                        }

                        tempDisInvoiceDatail.netAmount = netAmount;
                        setinvoiceDetailsList(prev => [...prev, tempDisInvoiceDatail]);
                    }
                }

                if (selectedFreeIssue != null && selectedFreeIssue > 0) {
                    let selectedFI: any = {};
                    let selectedFreeIssueProduct: any = {};

                    for (let tempFreeIssue of allFreeIssueList) {
                        if (tempFreeIssue.id === selectedFreeIssue) {
                            selectedFI = tempFreeIssue;
                        }
                    }

                    const freeIssueRequest = {
                        tokenString: token,
                        productCode: selectedFI.freeIssueProductCode
                    };

                    selectedFreeIssueProduct = await retriveStockByProductCode(token, freeIssueRequest);

                    if (selectedFreeIssueProduct.success) {
                        let availableStock = 0;
                        let isAvailable = false;
                        let somethingElse = false;

                        let needIssues = Math.floor(requestedQuantity / selectedFI.unitValue) * selectedFI.freeIssueQuant;

                        for (let tempStock of selectedFreeIssueProduct.disStockList) {
                            if (needIssues !== 0 && needIssues > availableStock) {
                                availableStock += tempStock.availableQuantity;
                            }
                        }

                        if (needIssues < availableStock) {
                            isAvailable = true;
                        } else if (needIssues > availableStock) {
                            isAvailable = false;
                        } else {
                            isAvailable = false;
                            somethingElse = true;
                        }

                        if (isAvailable) {
                            for (let tempStock of selectedFreeIssueProduct.disStockList) {
                                if (needIssues !== 0) {
                                    const newInvoiceDetail = {
                                        stockId: tempStock.id,
                                        unitPrice: tempStock.skuprice,
                                        quantity: needIssues,
                                        totalAmount: 0,
                                        discountPercentage: 0,
                                        discountValue: 0,
                                        productCode: tempStock.productCode,
                                        netAmount: 0,
                                        itemType: "Free Issue"
                                    };

                                    setinvoiceDetailsList(prev => [...prev, newInvoiceDetail]);
                                    needIssues -= tempStock.availableQuantity;
                                } else {
                                    break;
                                }
                            }
                        } else {
                            if (somethingElse) {
                                setAlert({
                                    open: true,
                                    type: "error",
                                    message: "Something went wrong while adding free issues. Please contact admin."
                                });
                            } else {
                                setAlert({
                                    open: true,
                                    type: "error",
                                    message: "There are not enough free issues in the stock."
                                });
                            }
                        }
                    } else {
                        setAlert({
                            open: true,
                            type: "error",
                            message: "Cannot retrieve the offers."
                        });
                    }
                }
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: "No stocks found for the selected product."
                });
            }
        } catch (error) {
            console.error(error);
        }
    }



    const addDisInvoice = async () => {

        const tempOrderDet: any = {};
        if (invoiceDetailsList.length > 0) {
            const orderDetailsList: any[] = [];
            let _totalAmunt = 0;
            let _dueAmount = 0;

            invoiceDetailsList.forEach((tempDisInvoiceDet: any) => {
                tempDisInvoiceDet.itemType = "Regular";
                tempOrderDet.productCode = tempDisInvoiceDet.productCode;
                tempOrderDet.requestedQuantity = tempDisInvoiceDet.quantity;
                tempOrderDet.discount = tempDisInvoiceDet.discountValue;
                tempOrderDet.total = tempDisInvoiceDet.netAmount;
                orderDetailsList.push({ ...tempOrderDet });
                _totalAmunt += tempDisInvoiceDet.totalAmount;
                _dueAmount += tempDisInvoiceDet.netAmount;
                disInvoice.dueAmount = _totalAmunt;
                disInvoice.customerId = shopID;
            });

            disOrder.itineraryId = 1; // itinerary ID hardcoded for invoicing purpose

            const stockResp = {
                tokenString: token,
                locationId: assignedDistributor,
                order: disOrder,
                orderDetailsList: orderDetailsList,
                invoice: disInvoice,
                invoiceDetailsList: invoiceDetailsList
            };

            try {
                const addinvoiceResponce = await addInvoice(token,stockResp);
                if (addinvoiceResponce?.success) {
                    setAlert({
                        open: true,
                        type: "success",
                        message: "New invoice has been successfully created."
                    });
                    clearInputs();
                    setReload(!reload)
                } else {
                    setAlert({
                        open: true,
                        type: "error",
                        message: `Creation of new invoice has failed. (${addinvoiceResponce.message})`
                    });
                    clearInputs();
                }
            } catch (error) {
                setAlert({
                    open: true,
                    type: "error",
                    message: "Failed to add invoice. Please try again."
                });
                console.error(error);
            }
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "No products selected to add invoice."
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

    const handleNumberInput = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
        setter(value ? parseInt(value) : '');
    };

    ///////////// ERRORS ///////////////////////
    // const [errors, setErrors] = useState({
    //     shopID: false,
    //     assignedDistributor: false,
    //     paymentMethod: false,
    //     expectedDate: false,
    //     returnAmount: false,
    //     productCategory: false,
    //     product: false,
    //     requestedQuantity: false,
    // });
    
    // // Add validation functions
    // const validatePage1 = () => {
    //     const newErrors = {
    //         shopID: !shopID,
    //         assignedDistributor: !assignedDistributor,
    //         paymentMethod: !paymentMethod,
    //         expectedDate: !expectedDate,
    //         returnAmount: returnCredits === "1" && !returnAmount,
    //         productCategory: false,
    //         product: false,
    //         requestedQuantity: false,
    //     };
    //     setErrors(newErrors);
    //     return !Object.values(newErrors).some(error => error);
    // };
    
    // const validatePage2 = () => {
    //     const newErrors = {
    //         shopID: false,
    //         assignedDistributor: false,
    //         paymentMethod: false,
    //         expectedDate: false,
    //         returnAmount: false,
    //         productCategory: !productCategory,
    //         product: !product,
    //         requestedQuantity: !requestedQuantity || requestedQuantity <= 0,
    //     };
    //     setErrors(newErrors);
    //     return !Object.values(newErrors).some(error => error);
    // };


    return (
        <React.Fragment>
            {create && <PrimaryButton onClick={()=>{openDialog(); clearInputs()}} label="ADD" icon={<Add />} />}
            {view && <IconButton onClick={openDialog}><Visibility /></IconButton>}
            {edit && <IconButton onClick={openDialog}><Edit /></IconButton>}

            <Dialog open={open} sx={{ backdropFilter: 'blur(3px)' }} maxWidth='md' >
                <GlobalAlert alert={alert} setAlert={setAlert} />

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        {view && 'View Invoice'}
                        {create && 'Create Invoice'}
                        {edit && 'Update Invoice'}
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

                        {page == 1 &&
                            <React.Fragment>
                                <Grid2 container spacing={2} width={'100%'}>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <FormControl fullWidth size="small" disabled={view} error={Boolean(fieldErrorsPageOne.shopID)}>
                                            <InputLabel>Shop Name *</InputLabel>
                                            <Select
                                                label="Shop Name *"
                                                value={shopID || ""}
                                                onChange={(e) => setshopID(e.target.value as number)}

                                            >
                                                <MenuItem value={""}>Please select an option</MenuItem>
                                                {globalSalesPoints?.map((item, index) =>
                                                    <MenuItem key={index} value={item.id}>{item.ownerName}</MenuItem>
                                                )}


                                            </Select>
                                            <FormHelperText>
                                            {fieldErrorsPageOne.shopID}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <Stack>
                                            <ToggleButton
                                                fullWidth
                                                size='small'
                                                color='primary'
                                                value="check"
                                                selected={dateBoundries}
                                                onChange={() => setdateBoundries((prevSelected) => !prevSelected)}
                                            >
                                                {dateBoundries ? 'Date Boundries Enable' : 'Date Boundries Disable'}
                                            </ToggleButton>
                                        </Stack>
                                    </Grid2>

                                </Grid2>

                                <Divider sx={{ my: 2 }} />

                                <Grid2 container spacing={2}>
                                    <Grid2 size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth size="small" disabled={view} error={Boolean(fieldErrorsPageOne.assignedDistributor)}>
                                            <InputLabel>Assigned Distributor *</InputLabel>
                                            <Select
                                                label="Assigned Distributor *"
                                                value={assignedDistributor || ""}
                                                onChange={(e) => setassignedDistributor(e.target.value as number)}

                                            >
                                                <MenuItem value={""}>Please select an option</MenuItem>
                                                {globalDistributorsList?.map((item, index) =>
                                                    <MenuItem key={index} value={item.id}>{item.storeName}</MenuItem>
                                                )}
                                            </Select>
                                            <FormHelperText>
                                            {fieldErrorsPageOne.assignedDistributor}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth size="small" disabled={true} error={Boolean(fieldErrorsPageOne.invoiceType)}>
                                            <InputLabel>Invoice type *</InputLabel>
                                            <Select
                                                label="Invoice type *"
                                                value={invoiceType || ""}
                                                onChange={(e) => setinvoiceType(e.target.value)}

                                            >
                                                <MenuItem value={""}>Please select an option</MenuItem>
                                                <MenuItem value="0">Distributor</MenuItem>
                                            </Select>
                                            <FormHelperText>
                                            {fieldErrorsPageOne.invoiceType}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth size="small" error={Boolean(fieldErrorsPageOne.paymentMethod)}>
                                            <InputLabel>Payment Method *</InputLabel>
                                            <Select
                                                label="Payment Method *"
                                                value={paymentMethod || ""}
                                                onChange={(e) => setpaymentMethod(e.target.value)}

                                            >
                                                <MenuItem value={""}>Please select an option</MenuItem>
                                                <MenuItem value="1">Cash</MenuItem>
                                                <MenuItem value="2">Non Cash</MenuItem>
                                                <MenuItem value="3">Cash + Non Cash</MenuItem>
                                            </Select>
                                            <FormHelperText>
                                            {fieldErrorsPageOne.paymentMethod}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6 }}>
                                        <CustomDatePicker
                                            disabled={view}
                                            label='Invoice Date *'
                                            setvalue={setexpectedDate}
                                            value={expectedDate}
                                            minDate={view ? undefined : dayjs(new Date())}
                                            size={'small'}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth size="small" error={Boolean(fieldErrorsPageOne.returnCredits)}>
                                            <InputLabel>Return Credits *</InputLabel>
                                            <Select
                                                label="Return Credits *"
                                                value={returnCredits || ""}
                                                onChange={(e) => setreturnCredits(e.target.value)}

                                            >
                                                <MenuItem value="0">No</MenuItem>
                                                <MenuItem value="1">Yes</MenuItem>
                                            </Select>
                                            <FormHelperText>
                                            {fieldErrorsPageOne.returnCredits}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            value={returnAmount || ""}
                                            onChange={handleNumberInput(setreturnAmount)}
                                            fullWidth
                                            variant='outlined'
                                            disabled={returnCredits == "0"}
                                            size='small'
                                            label="Return Amount"
                                            error={Boolean(fieldErrorsPageOne.returnAmount)}
                                            helperText={fieldErrorsPageOne.returnAmount }                                        />
                                    </Grid2>
                                </Grid2>

                                <Stack width={'100%'} my={2} display={'flex'} direction={'row'} justifyContent={'end'}>
                                    <PrimaryButton
                                    label='Next' 
                                    onClick={setBasicInformation}
                                    
                                    />
                                        
                                </Stack>
                            </React.Fragment>
                        }

                        {page == 2 &&
                            <React.Fragment>
                                <Grid2 container spacing={2} width={'100%'}>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <FormControl fullWidth size="small" disabled={view} error={Boolean(fieldErrorsPageTwo.productCategory)}>
                                            <InputLabel>Product Category *</InputLabel>
                                            <Select
                                                label="Product Category *"
                                                value={productCategory || ""}
                                                onChange={(e) => {
                                                    setproductCategory(e.target.value);
                                                    productFilter(e.target.value)
                                                }}

                                            >
                                                <MenuItem value={""}>Please select an option</MenuItem>
                                                {globalProductCatList?.map((item, index) =>
                                                    <MenuItem key={index} value={item.categoryId}>{item.categoryName}</MenuItem>
                                                )}


                                            </Select>
                                            <FormHelperText>
                                            {fieldErrorsPageTwo.productCategory}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <FormControl fullWidth size="small" disabled={view} error={Boolean(fieldErrorsPageTwo.product)}>
                                            <InputLabel>Product *</InputLabel>
                                            <Select
                                                label="Product *"
                                                value={product || ""}
                                                onChange={(e) => {
                                                    setproduct(e.target.value);
                                                }}

                                            >
                                                <MenuItem value={""}>Please select an option</MenuItem>
                                                {filteredProductList?.map((item, index) =>
                                                    <MenuItem key={index} value={item.productCode}>{item.productName}</MenuItem>
                                                )}


                                            </Select>
                                            <FormHelperText>
                                            {fieldErrorsPageTwo.product}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <TextField
                                            value={requestedQuantity || ""}
                                            onChange={(e) => {
                                                const value = Math.max(0, parseInt(e.target.value) || 0);
                                                setrequestedQuantity(value);
                                            }}
                                            label='Required Quantity *'
                                            fullWidth
                                            size='small'
                                            error={Boolean(fieldErrorsPageTwo.requestedQuantity)}
                                            helperText={fieldErrorsPageTwo.requestedQuantity}
                                            type='number'
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <FormControl fullWidth size="small" disabled={ view || enableDiscount} >
                                            <InputLabel>Discount Type</InputLabel>
                                            <Select
                                                label="Discount Type"
                                                value={discountType || ""}
                                                onChange={(e) => setdiscountType(e.target.value)}
                                            >
                                                <MenuItem value={""}>Please select an option</MenuItem>
                                                {globalDiscountList?.map((item, index) =>
                                                    <MenuItem key={index} value={item.discountQuantId}>{item.discountName}</MenuItem>
                                                )}


                                            </Select>
                                        </FormControl>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <FormControl fullWidth size="small" disabled={view || enableFreeIssue}>
                                            <InputLabel>Free Issues</InputLabel>
                                            <Select
                                                label="Free Issues"
                                                value={selectedFreeIssue || ""}
                                                onChange={(e) => setselectedFreeIssue(e.target.value)}
                                            >
                                                <MenuItem value={""}>Please select an option</MenuItem>
                                                {allFreeIssueList?.map((item, index) =>
                                                    <MenuItem key={index} value={item.id}>{item.freeIssueName}</MenuItem>
                                                )}

                                            </Select>
                                        </FormControl>
                                    </Grid2>
                                </Grid2>
                                 <Stack width={'100%'} my={2} display={'flex'} direction={'row'} justifyContent={'end'} gap={1}>
                                    <PrimaryButton
                                        label='Add'
                                        onClick={addProductsToTheList}
                                    />
                                    <PrimaryButton
                                    disabled={invoiceDetailsList.length == 0 || 
                                        !productCategory || 
                                        !product || 
                                        !requestedQuantity || 
                                        requestedQuantity <= 0}
                                        label='Submit'
                                        onClick={addDisInvoice}
                                    />
                                </Stack>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell ><strong>Product Code</strong></TableCell>
                                                <TableCell ><strong>Quantity</strong></TableCell>
                                                <TableCell ><strong>Stock ID</strong></TableCell>
                                                <TableCell ><strong>Unit Price</strong></TableCell>
                                                <TableCell ><strong>Total Amount</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {invoiceDetailsList
                                                ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                                                .map((row: any, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{row.productCode}</TableCell>
                                                        <TableCell>{row.quantity}</TableCell>
                                                        <TableCell>{row.stockId}</TableCell>
                                                        <TableCell>{row.unitPrice}</TableCell>
                                                        <TableCell>{row.totalAmount}</TableCell>

                                                    </TableRow>
                                                ))}

                                        </TableBody>
                                    </Table>
                                    <TablePagination
                                        component="div"
                                        count={invoiceDetailsList?.length || 0}
                                        page={tablePage}
                                        onPageChange={handleChangePage}
                                        rowsPerPage={rowsPerPage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                        rowsPerPageOptions={[5, 10, 25, 50]}
                                    />
                                </TableContainer>
                                <Stack alignItems={"end"} mt={2} flexDirection={'row-reverse'} gap={1}>
                                    {loading ? <CircularProgress color="secondary" /> :
                                        <React.Fragment>
                                            {/* {create && page == 2 && <PrimaryButton onClick={saveGRNDistributor} label='Save' />}
                                    {page == 1 ? <PrimaryButton onClick={() => setpage(2)} label='Next' />
                                        : <PrimaryButton onClick={() => setpage(1)} label='Back' />
                                    } */}
                                        </React.Fragment>
                                    }
                                </Stack>
                            </React.Fragment>
                        }




                    </Stack>
                </DialogContent>
            </Dialog>
        </React.Fragment >
    );
}
