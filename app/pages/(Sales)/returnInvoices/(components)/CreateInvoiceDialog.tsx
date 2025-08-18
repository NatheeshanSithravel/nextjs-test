import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, ToggleButton } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addInvoice, addNewGRN, addOrder, addReturnInvoices, findBatchByCode, findDistributors, getBatchByProductCode, retrieveAllDiscountsByProductCode, retrieveAllProductCategories, retriewAllDistributors, retriewAllSellableProducts, retriewAllSellableProductsForStock, retriveStockByProductCode, selectFreeIssueByProduct, validateReturnBatchID } from '@/app/(services)/SFARestClient';
import dayjs from 'dayjs';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';
import { create } from 'domain';

interface Props {
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;
}

interface FieldErrors {
    shopID: string;
    assignedDistributor: string;
    returnType: string;
    productCategory: string;
    product: string;
    returnQuantity: string;
    batchID: string;
    returnMethod: string;
    comment: string;
    invoiceSelection: string;

}

export default function CreateInvoiceDialog({
    setReload, reload
}: Props) {

    /////////////////// New Validation /////////////////////
    const initialErrors: FieldErrors = {
        shopID: "",
        assignedDistributor: "",
        returnType: "",
        productCategory: "",
        product: "",
        returnQuantity: "",
        batchID: "",
        returnMethod: "",
        comment: "",
        invoiceSelection: ""
    }

    const [fieldErrors, setfieldErrors] = useState<FieldErrors>({ ...initialErrors });

    const validateForm = () => {
        const newErrors: Partial<FieldErrors> = {};
        setfieldErrors(initialErrors);

        if (!shopID) {
            newErrors.shopID = "Shop ID is required";
        }

        if (!assignedDistributor) {
            newErrors.assignedDistributor = "Assigned Distributor is required";
        }

        if (!returnType) {
            newErrors.returnType = "Return type is required";
        }

        if (!productCategory) {
            newErrors.productCategory = "Product Category is required";
        }

        if (!product) {
            newErrors.product = "Product is required";
        }

        if (returnQuantity <= 0) {
            newErrors.returnQuantity = "Return Quantity must be greater than 0";
        } else if (returnQuantity > 999999) {
            newErrors.returnQuantity = "Return Quantity cannot exceed 999999"
        }

        if (!batchID) {
            newErrors.batchID = "Batch ID is required";
        }

        if (!returnMethod) {
            newErrors.returnMethod = "Return method is required";
        }

        if (!comment) {
            newErrors.comment = "Comment is required";
        }else if (comment.trim().length == 0) {
            newErrors.comment = "Comment cannot be empty";
        } else if (comment.length > 200) {
            newErrors.comment = "Comment cannot exceed 200 characters"
        }

        if (!invoiceSelection){
            newErrors.invoiceSelection = "Invoice Selection is required"
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
        clearInputs
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
    const [lockTextBox, setlockTextBox] = useState<boolean>(false);
    const [enableInvoiceSelection, setenableInvoiceSelection] = useState<boolean>(true);

    const [globalSalesPointList, setglobalSalesPointList] = useState<any[]>([]);
    const [globalDistributorsList, setglobalDistributorsList] = useState<any[]>([]);
    const [globalProductList, setglobalProductList] = useState<any[]>([]);
    const [globalProductCatList, setglobalProductCatList] = useState<any[]>([]);
    const [filteredProductList, setfilteredProductList] = useState<any[]>([]);
    const [invoiceDtoList, setinvoiceDtoList] = useState<any[]>([]);
    const [globalInvoiceDetails, setglobalInvoiceDetails] = useState<any[]>([]);
    const [globalReturnsList, setglobalReturnsList] = useState<any[]>([]);

    const [shopID, setshopID] = useState<any>("");
    const [assignedDistributor, setassignedDistributor] = useState<any>("");
    const [returnType, setreturnType] = useState<any>("");
    const [productCategory, setproductCategory] = useState<any>("");
    const [product, setproduct] = useState<any>("");
    const [returnQuantity, setreturnQuantity] = useState<any>("");
    const [batchID, setbatchID] = useState<any>("");
    const [returnMethod, setreturnMethod] = useState<any>("");
    const [comment, setcomment] = useState<any>("");
    const [invoiceSelection, setinvoiceSelection] = useState<any>("");

    ///////////////////// Inits /////////////////////
    const init = async () => {
        clearInputs();


        const res1 = await findDistributors(token, { tokenString: token });
        if (res1?.success === true) {
            setglobalSalesPointList(res1.salesPointsList)
        } else {
            setglobalSalesPointList([]);
        }

        const res2 = await retriewAllDistributors(token, { tokenString: token });
        if (res2?.success === true) {
            setglobalDistributorsList(res2.disPointList)
        } else {
            setglobalDistributorsList([]);
        }

        const res3 = await retriewAllSellableProducts(token, { tokenString: token });
        if (res3?.success === true) {
            setglobalProductList(res3.disProductList)
            setfilteredProductList(res3.disProductList)
        } else {
            setglobalProductList([])
            setfilteredProductList([])
        }

        const res4 = await retrieveAllProductCategories(token, { tokenString: token });
        if (res4?.success === true) {
            setglobalProductCatList(res4.productCatList)
        } else {
            setglobalProductCatList([])
        }

    }




    //////////////////Helpers///////////////
    const clearInputs = () => {
        setlockTextBox(false);
        setenableInvoiceSelection(true);
        setglobalInvoiceDetails([]);
        setglobalReturnsList([]);
        setshopID("");
        setassignedDistributor("");
        setreturnType("");
        setproductCategory("");
        setproduct("");
        setreturnQuantity("");
        setbatchID("");
        setreturnMethod("");
        setcomment("");
        setinvoiceSelection("");
    }




    ///////////////////// Methods /////////////////////
    const productFilter = () => {
        let temp: any[] = [];
        temp = globalProductList.filter(i => i.categoryId == productCategory);
        setfilteredProductList(temp)
    }

    useEffect(() => {
        if (productCategory != "") {
            productFilter();
        } else {
            if(globalProductList.length > 0){
                setfilteredProductList(globalProductList)
            }
        }
    }, [productCategory]);

    const validateBatch = async () => {
        setenableInvoiceSelection(true);
        let tempRequest = {
            tokenString: token,
            batchCode: batchID,
            customerId: shopID,
        };

        const batchIDResponce = await validateReturnBatchID(token, tempRequest);
        if (batchIDResponce?.success === true) {
            setenableInvoiceSelection(false);
            setinvoiceDtoList(batchIDResponce.invoiceDtoList);
            for (let tempInvoice of batchIDResponce.invoiceDtoList) {
                for (let tempInvoiceDetails of tempInvoice.invoiceDetailsList) {
                    let tempInvoiceRt: any = {};
                    tempInvoiceRt.invoiceId = tempInvoiceDetails.invoiceId;
                    tempInvoiceRt.discountPercentage = tempInvoiceDetails.discountPercentage;
                    tempInvoiceRt.discountValue = tempInvoiceDetails.discountValue;
                    tempInvoiceRt.netAmount = tempInvoiceDetails.netAmount;
                    tempInvoiceRt.productCode = tempInvoiceDetails.productCode;
                    tempInvoiceRt.quantity = tempInvoiceDetails.quantity;
                    tempInvoiceRt.stockHistoryId = tempInvoiceDetails.stockHistoryId;
                    tempInvoiceRt.stockId = tempInvoiceDetails.stockId;
                    tempInvoiceRt.totalAmount = tempInvoiceDetails.totalAmount;
                    tempInvoiceRt.unitPrice = tempInvoiceDetails.unitPrice;
                    setglobalInvoiceDetails(prevDetails => [...prevDetails, tempInvoiceRt]);
                }
            }
        } else {

            setinvoiceDtoList([])
            // setAlert({
            //     type: "error",
            //     message: "BatchID do not exsist.",
            //     open: true
            // })
        }
    }

    useEffect(() => {
        if (batchID != "" && shopID != "") {
            validateBatch();
        }
    }, [batchID, shopID]);

    const addReturnItem = async () => {

        if (!validateForm()) {
            return;
        }

        const req = {
            tokenString: token,
            batchCode: batchID
        }


        const res = await findBatchByCode(token, req); 

        let returnHandler: any = {};

        if (res?.disBatch != null) {
            returnHandler.batchId = batchID;
            returnHandler.comment = comment;
            returnHandler.productCode = product;

            if (returnMethod == "1") {
                returnHandler.returnMethod = "Goods";
            } else {
                returnHandler.returnMethod = "Credit";
            }

            returnHandler.returnQuantity = returnQuantity;
            returnHandler.returnTotal = returnQuantity * res.disBatch?.skuPrice;
            if (returnType == "0")
                returnHandler.returnType = "Non stock returns";
            else if (returnType == "1")
                returnHandler.returnType = "Sales returns";
            else if (returnType == "2")
                returnHandler.returnType = "market returns";

            returnHandler.unitPrice = res.disBatch?.skuPrice;

            setglobalReturnsList((prev) => [...prev,returnHandler]);
            resetFieldsSub();
        } else {
            setAlert({
                message:"Stocks not found. Returning stock is not found. please check !",
                type:'error',
                open:true
            })

        }
    }

    const resetFieldsSub = () => {
        setlockTextBox(true);
        setreturnType("");
        setreturnMethod("");
        setproductCategory("");
        setproduct("");
        setreturnQuantity("");
        setbatchID("");
        setcomment("");
    }

    const addReturnInvoice = async () => {

        if (!validateForm()) {
            return;
        }
        const returnInvoiceDetails: any = {
            customerId: shopID,
            storeId: assignedDistributor,
        };

        const listOfReturnDetails: any[] = [];
        let stockRetrunResponse: any = {};

        try {
            if (globalReturnsList.length > 0) {
                for (const tempReturns of globalReturnsList) {
                    const tempRequest = {
                        tokenString: token,
                        batchCode: tempReturns.batchId,
                    };

                    const batchIDResponce = await findBatchByCode(token, tempRequest);

                    const disreturn = {
                        productCode: tempReturns.productCode,
                        batchCode: batchIDResponce.disBatch.batchCode,
                        returnCredit: tempReturns.returnTotal,
                        returnQuantity: tempReturns.returnQuantity,
                        returnPaymentMethod: tempReturns.returnMethod,
                        returnType: tempReturns.returnType,
                    };

                    listOfReturnDetails.push(disreturn);
                }

                const stockResp = {
                    tokenString: token,
                    returnInvoice: returnInvoiceDetails,
                    returnInvoiceDetailsList: listOfReturnDetails,
                };

                stockRetrunResponse = await addReturnInvoices(token, stockResp);

                if (stockRetrunResponse.success) {
                    setAlert({
                        type: "success",
                        message: "Return invoice has been successfully created.",
                        open: true,
                    });
                    clearInputs();
                } else {
                    setAlert({
                        type: "error",
                        message: "Creation of return invoice has been failed.",
                        open: true,
                    });
                    clearInputs();
                }
            } else {
                setAlert({
                    type: "error",
                    message: "Add products to return",
                    open: true,
                });
                clearInputs();
            }
        } catch (error) {
            console.error(error);
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

    ///////////// ERRORS ///////////////
    // const [errors, setErrors] = useState({
    //     shopID: false,
    //     assignedDistributor: false,
    //     returnType: false,
    //     productCategory: false,
    //     product: false,
    //     returnQuantity: false,
    //     batchID: false,
    //     returnMethod: false,
    //     comment: false,
    //     invoiceSelection: false,
    // });
    
    // // Add validation function
    // const validateForm = () => {
    //     const newErrors = {
    //         shopID: !shopID,
    //         assignedDistributor: !assignedDistributor,
    //         returnType: !returnType,
    //         productCategory: !productCategory,
    //         product: !product,
    //         returnQuantity: !returnQuantity || isNaN(returnQuantity) || returnQuantity <= 0,
    //         batchID: !batchID || isNaN(batchID) || batchID <= 0,
    //         returnMethod: !returnMethod,
    //         comment: !comment.trim(),
    //         invoiceSelection: enableInvoiceSelection ? false : !invoiceSelection,
    //     };
    
    //     setErrors(newErrors);
    //     return !Object.values(newErrors).some(error => error);
    // };


    // const handleNumericInput = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const value = e.target.value.replace(/[^0-9]/g, '');
    //     setter(value ? Number(value) : '');
    // };

    return (
        <React.Fragment>
            <PrimaryButton onClick={() => { openDialog(); init() }} label="ADD" icon={<Add />} />

            <Dialog open={open} sx={{ backdropFilter: 'blur(3px)' }} maxWidth='md' >
                <GlobalAlert alert={alert} setAlert={setAlert} />

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        Create Return Invoice
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
                            <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                <FormControl fullWidth size="small" disabled={lockTextBox} error={Boolean(fieldErrors.shopID)}>
                                    <InputLabel>Shop Name *</InputLabel>
                                    <Select
                                        label="Shop Name *"
                                        value={shopID || ""}
                                        onChange={(e) => setshopID(e.target.value)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        {globalSalesPointList?.map((item, index) =>
                                            <MenuItem key={index} value={item.id}>{item.ownerName}</MenuItem>
                                        )}


                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.shopID}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <FormControl fullWidth size="small" disabled={lockTextBox} error={Boolean(fieldErrors.assignedDistributor)}>
                                    <InputLabel>Assigned Distributor *</InputLabel>
                                    <Select
                                        label="Assigned Distributor *"
                                        value={assignedDistributor || ""}
                                        onChange={(e) => setassignedDistributor(e.target.value)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        {globalDistributorsList?.map((item, index) =>
                                            <MenuItem key={index} value={item.id}>{item.storeName}</MenuItem>
                                        )}


                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.assignedDistributor}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <FormControl fullWidth size="small" disabled={lockTextBox} error={Boolean(fieldErrors.returnType)}>
                                    <InputLabel>Return type *</InputLabel>
                                    <Select
                                        label="Return type *"
                                        value={returnType || ""}
                                        onChange={(e) => setreturnType(e.target.value)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        <MenuItem value="0">Non Stock Item</MenuItem>
                                        <MenuItem value="1">Sale Item</MenuItem>
                                        <MenuItem value="2">Market Item</MenuItem>


                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.returnType}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <FormControl fullWidth size="small" disabled={lockTextBox} error={Boolean(fieldErrors.productCategory)}>
                                    <InputLabel>Product Category *</InputLabel>
                                    <Select
                                        label="Product Category *"
                                        value={productCategory || ""}
                                        onChange={(e) => setproductCategory(e.target.value)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        {globalProductCatList?.map((item, index) =>
                                            <MenuItem key={index} value={item.categoryId}>{item.categoryName}</MenuItem>
                                        )}
                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.productCategory}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <FormControl fullWidth size="small" disabled={lockTextBox} error={Boolean(fieldErrors.product)}>
                                    <InputLabel>Product *</InputLabel>
                                    <Select
                                        label="Product *"
                                        value={product || ""}
                                        onChange={(e) => setproduct(e.target.value)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        {filteredProductList?.map((item, index) =>
                                            <MenuItem key={index} value={item.productCode}>{item.productName}</MenuItem>
                                        )}
                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.product}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <TextField
                                    label='Return Quantity *'
                                    fullWidth
                                    disabled={lockTextBox}
                                    size='small'
                                    value={returnQuantity || ""}
                                    onChange={(e) => setreturnQuantity(Number(e.target.value))}
                                    error={Boolean(fieldErrors.returnQuantity)}
                                    helperText={fieldErrors.returnQuantity}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <TextField
                                    label='Batch ID *'
                                    fullWidth
                                    disabled={lockTextBox}
                                    size='small'
                                    value={batchID || ""}
                                    onChange={(e) => setbatchID(Number(e.target.value))}
                                    error={Boolean(fieldErrors.batchID)}
                                    helperText={fieldErrors.batchID}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <FormControl fullWidth size="small" disabled={lockTextBox} error={Boolean(fieldErrors.returnMethod)}>
                                    <InputLabel>Return Method *</InputLabel>
                                    <Select
                                        label="Return Method *"
                                        value={returnMethod || ""}
                                        onChange={(e) => setreturnMethod(e.target.value)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        <MenuItem value="1">Same Product</MenuItem>
                                        <MenuItem value="2">Credit</MenuItem>
                                    </Select>
                                    
                                    <FormHelperText>
                                        {fieldErrors.returnMethod}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <TextField
                                    label='Comment *'
                                    fullWidth
                                    disabled={lockTextBox}
                                    size='small'
                                    value={comment || ""}
                                    onChange={(e) => setcomment(e.target.value)}
                                    error={Boolean(fieldErrors.comment)}
                                    helperText={fieldErrors.comment}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <FormControl fullWidth size="small" disabled={enableInvoiceSelection || lockTextBox} error={Boolean(fieldErrors.invoiceSelection)}>
                                    <InputLabel>Relevant invoice *</InputLabel>
                                    <Select
                                        label="Relevant Invoice *"
                                        value={invoiceSelection || ""}
                                        onChange={(e) => setinvoiceSelection(e.target.value)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        {globalInvoiceDetails?.map((item, index) =>
                                            <MenuItem key={index} value={item.invoiceId}>Invoice ID {item.invoiceId} -- Stock ID {item.stockId} -- Unit Price {item.unitPrice}</MenuItem>
                                        )}
                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.invoiceSelection}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                        </Grid2>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={'center'} my={2}>
                            <PrimaryButton label='Add' onClick={addReturnItem} disabled={lockTextBox} />
                            <PrimaryButton label='Reset' onClick={clearInputs }  />
                            <PrimaryButton label='Submit' onClick={addReturnInvoice} disabled={globalReturnsList.length == 0} />
                        </Stack>


                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Batch ID</strong></TableCell>
                                        <TableCell><strong>Product Code</strong></TableCell>
                                        <TableCell><strong>Return Type</strong></TableCell>
                                        <TableCell><strong>Unit Price</strong></TableCell>
                                        <TableCell><strong>Quantity</strong></TableCell>
                                        <TableCell><strong>Total Amount</strong></TableCell>
                                        <TableCell><strong>Return Method</strong></TableCell>
                                        <TableCell><strong>Comment</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {globalReturnsList
                                        ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                                        .map((row: any, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{row.batchId}</TableCell>
                                                <TableCell>{row.productCode}</TableCell>
                                                <TableCell>{row.returnType}</TableCell>
                                                <TableCell>{row.unitPrice}</TableCell>
                                                <TableCell>{row.returnQuantity}</TableCell>
                                                <TableCell>{row.returnTotal}</TableCell>
                                                <TableCell>{row.returnMethod}</TableCell>
                                                <TableCell>{row.comment}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                component="div"
                                count={globalReturnsList?.length || 0}
                                page={tablePage}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                            />
                        </TableContainer>




                    </Stack>
                </DialogContent>
            </Dialog>
        </React.Fragment >
    );
}
