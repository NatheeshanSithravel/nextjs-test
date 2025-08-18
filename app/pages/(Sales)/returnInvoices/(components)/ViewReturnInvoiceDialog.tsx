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
    selectedRtnInvoice: any,
}


export default function ViewReturnInvoiceDialog({
    selectedRtnInvoice
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
                    Return Invoice NO - {selectedRtnInvoice?.returnInvoice.returnInvoiceId}
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
                                <InputLabel sx={labelStyle}>Return Invoice ID:</InputLabel>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={valueStyle}>{selectedRtnInvoice.returnInvoice.returnInvoiceId}</InputLabel>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={labelStyle}>Customer ID :</InputLabel>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={valueStyle}>{selectedRtnInvoice.returnInvoice.customerId}</InputLabel>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={labelStyle}>Store ID :</InputLabel>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={valueStyle}>{selectedRtnInvoice.returnInvoice.storeId}</InputLabel>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={labelStyle}>Created Date :</InputLabel>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                                <InputLabel sx={valueStyle}>{dayjs(selectedRtnInvoice.returnInvoice.createdAt).format("YYYY-MM-DD")}</InputLabel>
                            </Grid2>

                            
                        </Grid2>
                        <Divider sx={{my:2}} />
                        <TableContainer sx={{my:2}}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell ><strong>Product Code</strong></TableCell>
                                        <TableCell ><strong>Stock ID</strong></TableCell>
                                        <TableCell ><strong>Return Type</strong></TableCell>
                                        <TableCell ><strong>Return Credit</strong></TableCell>
                                        <TableCell ><strong>Return Quantity</strong></TableCell>
                                        <TableCell ><strong>Payment Method</strong></TableCell>
                                        <TableCell ><strong>Product Return Approval</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedRtnInvoice.returnInvoiceDetailsList
                                        ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                                        .map((row: any, index: any) => (
                                            <TableRow key={index}>
                                                <TableCell>{row.productCode}</TableCell>
                                                <TableCell>{row.stockId}</TableCell>
                                                <TableCell>{row.returnType}</TableCell>
                                                <TableCell>{row.returnCredit}</TableCell>
                                                <TableCell>{row.returnQuantity}</TableCell>
                                                <TableCell>{row.returnPaymentMethod}</TableCell>
                                                <TableCell>{row.productReturnApproval}</TableCell>
                                            </TableRow>
                                        ))}

                                </TableBody>
                            </Table>
                            <TablePagination
                                component="div"
                                count={selectedRtnInvoice.returnInvoiceDetailsList?.length || 0}
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