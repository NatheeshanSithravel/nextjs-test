import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, Grid2, IconButton, Input, InputLabel, MenuItem, Select, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, ToggleButton } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addInvoice, addNewGRN, addOrder, getBatchByProductCode, retrieveAllDiscountsByProductCode, retriewAllSellableProductsForStock, retriveStockByProductCode, selectFreeIssueByProduct } from '@/app/(services)/SFARestClient';
import dayjs from 'dayjs';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';

interface Props {
    productList: any[];
    selectedOrder: any,
    globalSalesPoints: any[];
    usrCreateList: any[];
}


export default function ViewOrderDialog({
    productList,
    selectedOrder,
    usrCreateList,
    globalSalesPoints
}: Props) {




    ///////////////////// Dialog Controls /////////////////////
    const [open, setopen] = useState(false);

    const closeDialog = () => {
        setopen(false)
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

    /////////////////// Helper //////////////////
    const getProductName = (productCode: any) => {
        return productList.find((product: any) => product.productCode === productCode)?.productName;
    }

    const getShopName = (shopId:any) => {
        return globalSalesPoints.find((shop: any) => shop.id == shopId)?.shopName;
    }

    const getName = (userId:any) => {
        return usrCreateList.find((user: any) => user.id == userId)?.fullName
       
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
            <IconButton onClick={openDialog}><Visibility /></IconButton>

            <Dialog open={open} sx={{ backdropFilter: 'blur(3px)' }} maxWidth='lg' >

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        Sales Order No - {selectedOrder?.disOrder.id}
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
                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={labelStyle}>Sales Order ID :</InputLabel>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={valueStyle}>{selectedOrder.disOrder.id}</InputLabel>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={labelStyle}>Order Type :</InputLabel>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={valueStyle}>{selectedOrder.disOrder.orderType}</InputLabel>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={labelStyle}>Order State :</InputLabel>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={valueStyle}>{selectedOrder.disOrder.orderState}</InputLabel>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={labelStyle}>Sale Type :</InputLabel>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={valueStyle}>{selectedOrder.disOrder.saleType}</InputLabel>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={labelStyle}>Requested By :</InputLabel>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={valueStyle}>{selectedOrder.disOrder.requestedBy}</InputLabel>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={labelStyle}>Requested Shop :</InputLabel>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={valueStyle}>{getShopName(selectedOrder.disOrder.requestedLocationId)}</InputLabel>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={labelStyle}>Requested Date :</InputLabel>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={valueStyle}>{dayjs(selectedOrder.disOrder.requestedDate).format("YYYY-MM-DD")}</InputLabel>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={labelStyle}>Assign To :</InputLabel>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={valueStyle}>{getName(selectedOrder.disOrder.assignedTo) } {selectedOrder.disOrder.assignedTo}</InputLabel>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={labelStyle}>Expected Date :</InputLabel>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={valueStyle}>{dayjs(selectedOrder.disOrder.expectedDate).format("YYYY-MM-DD")}</InputLabel>
                            </Grid2>
                        </Grid2>
                        <Divider sx={{ my: 2 }} />
                        <TableContainer sx={{ my: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell ><strong>Product Code</strong></TableCell>
                                        <TableCell ><strong>Product Name</strong></TableCell>
                                        <TableCell ><strong>Order ID</strong></TableCell>
                                        <TableCell ><strong>Request Quantity</strong></TableCell>
                                        <TableCell ><strong>Received Quantity</strong></TableCell>
                                        <TableCell ><strong>Order State</strong></TableCell>
                                        {/* <TableCell ><strong>Total</strong></TableCell> */}
                                        <TableCell ><strong>Delivery Status</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedOrder.disOrderDetailsList
                                        ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                                        .map((row: any, index: any) => (
                                            <TableRow key={index}>
                                                <TableCell>{row.productCode}</TableCell>
                                                <TableCell>{getProductName(row.productCode)}</TableCell>
                                                <TableCell>{row.orderId}</TableCell>
                                                <TableCell>{row.requestedQuantity}</TableCell>
                                                <TableCell>{row.receivedQuantity}</TableCell>
                                                <TableCell>{row.state}</TableCell>
                                                {/* <TableCell>{row.total}</TableCell> */}
                                                <TableCell>{row.deliveryStatus}</TableCell>
                                            </TableRow>
                                        ))}

                                </TableBody>
                            </Table>
                            <TablePagination
                                component="div"
                                count={selectedOrder.disOrderDetailsList?.length || 0}
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


const labelStyle: CSSObject = {
    fontWeight: 'bold',
    whiteSpace: 'normal',
    wordWrap: 'break-word'
}

const valueStyle: CSSObject = { whiteSpace: 'normal', wordWrap: 'break-word' }