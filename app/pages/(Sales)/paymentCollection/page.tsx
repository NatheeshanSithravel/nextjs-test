"use client"
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PageContent from '@/app/(components)/(Page)/PageContent'
import { findDistributors, findPaymentDueInvoices } from '@/app/(services)/SFARestClient';
import { FormControl, Grid2, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import PaymentCollectionDialog from './(components)/PaymentCollectionDialog';
import { getRole, getToken } from '@/app/util/UserDataHandler';
import { UserRole } from '@/app/(enums)/UserRole';
import { redirect } from 'next/navigation';



export default function Page() {
    //////////////////// Alert ////////////////////////
    const [alert, setAlert] = useState<AlertProp>({
        open: false,
        type: "success",
        message: "",
    });

    const [reload, setReload] = useState<boolean>(false);
    //// init /////
    const [token, settoken] = useState<any>(null);
    const [role, setrole] = useState<any>(null);

    useEffect(() => {
        const getData = async () => {
            settoken(await getToken());
            setrole(await getRole());
        };
        getData();
    }, []);

    useEffect(() => {
        if (role != null) {
            if (!(
                role == UserRole.COOP_ADMIN ||
                role == UserRole.MANAGER ||
                role == UserRole.COORDINATOR ||
                role == UserRole.SALES_REP)) {
                redirect('/pages/dashboard')
            }
        }
    }, [role]);

    //////////////////////////////////////////////////

    ///////////////////// Attributes ///////////////////////
    const [shopID, setshopID] = useState<any>("");
    const [globalSalesPoints, setglobalSalesPoints] = useState<any[]>([]);
    const [globalPaymentHandle, setglobalPaymentHandle] = useState<any[]>([]);
    const [paymentDueInvoices, setpaymentDueInvoices] = useState<any[]>([]);


    //////////////////////// Init //////////////////////////
    const init = async () => {
        const iteneryResponse = await findDistributors(token, { tokenString: token })
        if (iteneryResponse.salesPointsList != null) {
            setglobalSalesPoints(iteneryResponse.salesPointsList);
        } else {
            setglobalSalesPoints([]);
        }

    }

    useEffect(() => {
        if (token) {
            init();
        }
    }, [token, reload]);

    useEffect(() => {
        if (shopID != "") {
            loadPaymentDueInvoices();
        }
    }, [reload]);




    //////////////////Helpers///////////////


    /////////////////Methods///////////////
    const loadPaymentDueInvoices = async () => {
        setglobalPaymentHandle([]);

        const tempRequest = {
            tokenString: token,
            locationId: shopID,
            source: "Web"
        };

        const tempStockResp = await findPaymentDueInvoices(token, tempRequest);

        if (tempStockResp?.success) {
            const paymentDueInvoices = tempStockResp.invoiceList;
            const tempGlobalPaymentHandle = paymentDueInvoices.map((tempInvoice: any) => {
                if (tempInvoice.invoiceId != null) {
                    return {
                        invoiceId: tempInvoice.invoiceId,
                        totalAmount: tempInvoice.totalAmount,
                        remainingBalance: tempInvoice.dueAmount,
                        todaysCollection: 0.0,
                        nextPaymentDate: new Date(),
                        comments: "Enter Comments"
                    };
                } else {
                    console.log("Hit null");
                    return null;
                }
            }).filter((item: any) => item !== null);

            setglobalPaymentHandle(tempGlobalPaymentHandle);
        } else {
            setpaymentDueInvoices(tempStockResp.invoiceList);
        }

        globalPaymentHandle.forEach((tempHnd: any) => {
            console.log(`invoice no ${tempHnd.invoiceId} Total ${tempHnd.totalAmount}`);
            console.log(`Due Amt ${tempHnd.remainingBalance} Todays coll ${tempHnd.todaysCollection}`);
            console.log(`date ${tempHnd.nextPaymentDate} Comments ${tempHnd.comments}`);
        });
    }

    useEffect(() => {
        if (shopID != "") {
            loadPaymentDueInvoices();
        }
    }, [shopID]);


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
        <PageContent title="Payment Collection">
            <GlobalAlert alert={alert} setAlert={setAlert} />
            <Grid2 container width={'100%'} spacing={2} sx={{ alignItems: 'center' }} mb={2}>

                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Shop Name</InputLabel>
                        <Select
                            label="Shop Name"
                            value={shopID || ""}
                            onChange={(e) => { setshopID(e.target.value); }}

                        >
                            <MenuItem value={""}>Please select an option</MenuItem>
                            {globalSalesPoints?.map((item, index) =>
                                <MenuItem key={index} value={item.id}>{item.ownerName}</MenuItem>
                            )}


                        </Select>
                    </FormControl>
                </Grid2>

            </Grid2>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell ><strong>Invoice No</strong></TableCell>
                            <TableCell ><strong>Total Amount</strong></TableCell>
                            <TableCell ><strong>Remaining Balance</strong></TableCell>
                            <TableCell ><strong>Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {globalPaymentHandle
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.invoiceId}</TableCell>
                                    <TableCell>{row.totalAmount}</TableCell>
                                    <TableCell>{row.remainingBalance}</TableCell>
                                    <TableCell>
                                        <PaymentCollectionDialog selectedInvoice={row} reload={reload} setReload={setReload} />
                                    </TableCell>
                                </TableRow>
                            ))}

                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={globalPaymentHandle?.length || 0}
                    page={tablePage}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />
            </TableContainer>
        </PageContent>
    )
}
