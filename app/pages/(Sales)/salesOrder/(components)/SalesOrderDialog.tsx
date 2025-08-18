import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addNewGRN, addOrder, getBatchByProductCode, retriveStockByProductCode } from '@/app/(services)/SFARestClient';
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
    // globalProductCatList: any[];
    // globalDistributorsList: any[];
    globalProductList: any[];
    salesOrder?: any;
    globalSalesPoints: any[];
    usrCreateList: any[];
}

interface FieldErrors {
    orderType: string, 
    salesType: string,
    locationId: string,
    note: string,
    assignTo: string,
    productCode: string,
    requestedQuantity: string;
}


export default function SalesOrderDialog({
    view, edit, create, setReload, reload,
    salesOrder,
    globalSalesPoints,
    usrCreateList,
    globalProductList
}: Props) {

    ////////////////// New Validation /////////////////////
    const initialErrors: FieldErrors = {
        orderType: "", 
        salesType: "",
        locationId: "",
        note: "",
        assignTo: "",
        productCode: "",
        requestedQuantity: ""
    }

    const [fieldErrors, setfieldErrors] = useState<FieldErrors>({ ...initialErrors });

    const validateForm = () => {
        const newErrors: Partial<FieldErrors> = {};
        setfieldErrors(initialErrors);

        if (!orderType) {
            newErrors.orderType = "Order Type is required";
        }

        if (!salesType) {
            newErrors.salesType = "Sales Type is required";
        }

        if (!locationId) {
            newErrors.locationId = "Location Id is required";
        }

        if (note.length > 100) {
            newErrors.note = "Note cannot exceed 100 characters";
        }

        if (!assignTo) {
            newErrors.assignTo = "Assign To is required";
        }

        if (!productCode) {
            newErrors.productCode = "Product Code is required";
        }

        if (requestedQuantity > 999999) {
            newErrors.requestedQuantity = "Quantity cannot exceed 999999";
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
        if(create){
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
    const [orderType, setorderType] = useState<any>("");
    const [salesType, setsalesType] = useState<any>("");
    const [locationId, setlocationId] = useState<any>("");
    const [expectedDate, setexpectedDate] = useState<any>(dayjs(new Date()));
    const [note, setnote] = useState<any>("");
    const [assignTo, setassignTo] = useState<any>("");

    const [productCode, setproductCode] = useState<any>("");
    const [requestedQuantity, setrequestedQuantity] = useState<any>("");

    const [freezeInputs, setfreezeInputs] = useState<boolean>(false);

    const [globalOrderList, setglobalOrderList] = useState<any[]>([]);


    ///////////////////// Inits /////////////////////
    useEffect(() => {
        if (salesOrder) {
            setInputs();
        }
    }, [salesOrder]);




    //////////////////Helpers///////////////
    const clearInputs = () => {
        setorderType("");
        setsalesType("");
        setlocationId("");
        setexpectedDate(dayjs(new Date()));
        setnote("");
        setassignTo("");
        setproductCode("");
        setrequestedQuantity("");
        setfreezeInputs(false);
        setglobalOrderList([]);
    }

    const setInputs = () => {
        if (salesOrder) {
            setorderType(getOrderType(salesOrder.disOrder.orderType));
            setsalesType(getSalesType(salesOrder.disOrder.saleType));
            setlocationId(salesOrder.disOrder.requestedLocationId);
            setexpectedDate(dayjs(salesOrder.disOrder.expectedDate));
            setnote(salesOrder.disOrder.note);
            setassignTo(salesOrder.disOrder.assignedTo);
            setglobalOrderList(salesOrder.disOrderDetailsList.map((detail: any) => ({
                productCode: detail.productCode,
                requestedQuantity: detail.requestedQuantity,
                total: detail.total
            })));
            setfreezeInputs(true);
        }
    }

    const getOrderType = (label: string): string | null => {
        const options = [
            { value: "1", label: "Promotion" },
            { value: "0", label: "Exchange" },
            { value: "2", label: "Sale" }
        ];

        const option = options.find(option => option.label === label);
        return option ? option.value : null;
    };


    const getSalesType = (label: string): string | null => {
        const options = [
            { value: "1", label: "Transfer to Sub location" },
            { value: "0", label: "Transfer to Outlet" }
        ];

        const option = options.find(option => option.label === label);
        return option ? option.value : null;
    };

    const getProductName = (productCode: string) => {
        return globalProductList.find((product: any) => product.productCode === productCode)?.productName;
    }



    ///////////////////// Methods /////////////////////
    const addOrdersToList = async () => {
        if (!validateForm()) {
            return;
        }

        setfreezeInputs(true);

        let tempTotal = 0.00;
        let req: any = {
            tokenString: token,
            productCode: productCode,
            locationId: assignTo
        };

        const res = await retriveStockByProductCode(token, req);
        if (res?.success === true && res.disStockList != null) {
            res.disStockList.forEach((productStock: any) => {
                tempTotal = productStock.SKUPrice * requestedQuantity;
            });
        }
        const disOrdertemp = {
            productCode: productCode,
            requestedQuantity: requestedQuantity,
            total: tempTotal
        };
        setglobalOrderList([...globalOrderList, disOrdertemp])
        setproductCode("");
        setrequestedQuantity("")
        // globalOrderList.push(disOrdertemp);
    }

    const addOrderMain = async () => {
        let tempType = "";
        let sType = "";
        let tempDisOrder: any = {};

        if (salesType == "1") {
            sType = "Transfer to Outlet";
        } else if (salesType == "0") {
            sType = "Transfer to Sub location";
        }

        tempDisOrder.saleType = sType;

        if (orderType == "1") {
            tempType = "Promotion";
        } else if (orderType == "2") {
            tempType = "Sale";
        } else {
            tempType = "Exchange";
        }

        tempDisOrder.orderType = tempType;
        tempDisOrder.note = note;
        tempDisOrder.expectedDate = dayjs(expectedDate).format('YYYY-MM-DD HH:mm:ss');
        tempDisOrder.assignedTo = assignTo;
        tempDisOrder.requestedLocationId = locationId;
        tempDisOrder.storeId = 999;
        tempDisOrder.itineraryId = 1;


        const orderDetails = {
            total: globalOrderList.reduce((acc, item) => acc + item.total, 0),
        };

        const stockRequest = {
            tokenString: token,
            order: tempDisOrder,
            orderDetails: orderDetails,
            orderDetailsList: globalOrderList,
        };

        try {
            const orderResponse = await addOrder(token, stockRequest);
            if (orderResponse.success === true) {
                setAlert({
                    open: true,
                    type: "success",
                    message: "New sales order has been successfully created.",
                });
                setReload(!reload);
                clearInputs();
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: "Creation of new sales order has been failed",
                });
            }
        } catch (error) {
            setAlert({
                open: true,
                type: "error",
                message: "Creation of new sales order has been failed",
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


    //////////////// ERRORS ////////////////////
    // const [errors, setErrors] = useState({
    //     orderType: false, 
    //     salesType: false,
    //     locationId: false,
    //     assignTo: false,
    //     productCode: false,
        
    // });

    // const validateForm = () => {
    //     const newErrors = {
    //         orderType: !orderType, 
    //         salesType: !salesType, 
    //         locationId: !locationId, 
    //         assignTo: !assignTo, 
    //         productCode: !productCode, 
    //     };

    //     setErrors(newErrors);

    //     return !Object.values(newErrors).some(error => error);
    // };


    return (
        <React.Fragment>
            {create && <PrimaryButton onClick={openDialog} label="ADD" icon={<Add />} />}
            {view && <IconButton onClick={openDialog}><Visibility /></IconButton>}
            {edit && <IconButton onClick={openDialog}><Edit /></IconButton>}

            <Dialog open={open} sx={{ backdropFilter: 'blur(3px)' }} maxWidth='md' fullScreen={false} fullWidth={true}>
                <GlobalAlert alert={alert} setAlert={setAlert} />

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        {view && 'View Sales Order'}
                        {create && 'Create Sales Order'}
                        {edit && 'Update Sales Order'}
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

                        <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small" disabled={view || freezeInputs} error={Boolean(fieldErrors.orderType)}>
                                    <InputLabel>Order Type *</InputLabel>
                                    <Select
                                        label="Order Type *"
                                        value={orderType || ""}
                                        onChange={(e) => setorderType(e.target.value)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        <MenuItem value={"1"}>Promotion</MenuItem>
                                        <MenuItem value={"0"}>Exchange</MenuItem>
                                        <MenuItem value={"2"}>Sale</MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.orderType}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small" disabled={view || freezeInputs} error={Boolean(fieldErrors.salesType)}>
                                    <InputLabel>Sales Type *</InputLabel>
                                    <Select
                                        label="Sales Type *"
                                        value={salesType || ""}
                                        onChange={(e) => setsalesType(e.target.value as number)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        <MenuItem value={"1"}>Transfer to Sub location</MenuItem>
                                        <MenuItem value={"0"}>Transfer to Outlet</MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.salesType}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small" disabled={view || freezeInputs} error={Boolean(fieldErrors.locationId)}>
                                    <InputLabel>Shop *</InputLabel>
                                    <Select
                                        label="Shop *"
                                        value={locationId || ""}
                                        onChange={(e) => setlocationId(e.target.value as number)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        {globalSalesPoints?.map((item, index) =>
                                            <MenuItem key={index} value={item.id}>{item.shopName}</MenuItem>
                                        )}


                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.locationId}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <CustomDatePicker
                                    disabled={view || freezeInputs}
                                    label='Issueing Date *'
                                    setvalue={setexpectedDate}
                                    value={expectedDate}
                                    minDate={view ? undefined : dayjs(new Date())}
                                    size={'small'}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    disabled={view || freezeInputs}
                                    value={note || ""}
                                    onChange={(e) => setnote(e.target.value)}
                                    fullWidth
                                    variant='outlined'
                                    label="Special Notes"
                                    size='small'
                                    error={Boolean(fieldErrors.note)}
                                    helperText={fieldErrors.note}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small" disabled={view || freezeInputs} error={Boolean(fieldErrors.assignTo)}>
                                    <InputLabel>Assign To *</InputLabel>
                                    <Select
                                        label="Assign To *"
                                        value={assignTo || ""}
                                        onChange={(e) => setassignTo(e.target.value as number)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        {usrCreateList?.map((item, index) =>
                                            <MenuItem key={index} value={item.id}>{item.fullName}</MenuItem>
                                        )}
                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.assignTo}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                        </Grid2>

                        <Divider sx={{ my: 2 }} />

                        {create && <>
                            <Grid2 container spacing={2} >
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <FormControl fullWidth size="small" disabled={view} error={Boolean(fieldErrors.productCode)}>
                                        <InputLabel>Product Name/Code *</InputLabel>
                                        <Select
                                            label="Product Name/Code *"
                                            value={productCode || ""}
                                            onChange={(e) => setproductCode(e.target.value)}

                                        >
                                            <MenuItem value={""}>Please select an option</MenuItem>
                                            {globalProductList?.map((item, index) =>
                                                <MenuItem key={index} value={item.productCode}>{item.productName} / {item.productCode}</MenuItem>
                                            )}
                                        </Select>
                                        <FormHelperText>
                                            {fieldErrors.productCode}
                                        </FormHelperText>
                                    </FormControl>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 6 }} >
                                    <TextField
                                        disabled={view}
                                        value={requestedQuantity || ""}
                                        onChange={(e) => setrequestedQuantity(Number(e.target.value))}
                                        fullWidth
                                        variant='outlined'
                                        label="Requested Quantity"
                                        size='small'
                                        error={Boolean(fieldErrors.requestedQuantity)}
                                        helperText={fieldErrors.requestedQuantity}
                                    />
                                </Grid2>
                            </Grid2>

                            <Stack sx={{ my: 2 }} width={'100%'} direction={'row'} justifyContent={'center'} spacing={2}>
                                <PrimaryButton
                                    label='Add'
                                    onClick={addOrdersToList}
                                />
                                <PrimaryButton
                                    label='Clear'
                                    onClick={clearInputs}
                                />
                                <PrimaryButton
                                    disabled={globalOrderList.length == 0}
                                    label='Submit Order'
                                    onClick={addOrderMain}
                                />
                            </Stack>

                        </>}


                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell ><strong>Product Code</strong></TableCell>
                                        <TableCell ><strong>Product Name</strong></TableCell>
                                        <TableCell ><strong>Requested Quantity</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {globalOrderList
                                        ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                                        .map((row: any, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{row.productCode}</TableCell>
                                                <TableCell>{getProductName(row.productCode)}</TableCell>
                                                <TableCell>{row.requestedQuantity}</TableCell>

                                            </TableRow>
                                        ))}

                                </TableBody>
                            </Table>
                            <TablePagination
                                component="div"
                                count={globalOrderList?.length || 0}
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
                    </Stack>
                </DialogContent>
            </Dialog>
        </React.Fragment >
    );
}
