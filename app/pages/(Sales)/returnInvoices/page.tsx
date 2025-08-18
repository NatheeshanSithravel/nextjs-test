"use client"
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PageContent from '@/app/(components)/(Page)/PageContent'
import { addProductCategory, addProductRequest, findAllInvoices, findAllOrders, findAllReturnInvoices, findDistributors, findIteneryList, getGINByUser, productCode, retrieveAllProductCategories, retriewAllDistributors, retriewAllProducts, retrivewDistributors, } from '@/app/(services)/SFARestClient';
import { FormControl, Grid2, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { UserRole } from '@/app/(enums)/UserRole';
import { UserStatus } from '@/app/(enums)/UserStatus';
import dayjs from 'dayjs';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import InvoiceDialog from './(components)/CreateInvoiceDialog';
import ViewInvoiceDialog from './(components)/ViewReturnInvoiceDialog';
import ViewReturnInvoiceDialog from './(components)/ViewReturnInvoiceDialog';
import CreateInvoiceDialog from './(components)/CreateInvoiceDialog';
import { getRole, getToken } from '@/app/util/UserDataHandler';
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
    const [grnDtoList, setgrnDtoList] = useState<any[]>([]);


    const [fromdate, setfromdate] = useState<any>(dayjs(new Date()));
    const [todate, settodate] = useState<any>(dayjs(new Date()));
    const [shopID, setshopID] = useState<any>("");
    const [status, setstatus] = useState<any>("");

    const [globalProduct, setglobalProduct] = useState<any[]>([]);
    const [globalSalesPoints, setglobalSalesPoints] = useState<any[]>([]);
    const [usrCreateList, setusrCreateList] = useState<any[]>([]);
    const [globalReturnInvoiceDtoList, setglobalReturnInvoiceDtoList] = useState<any[]>([]);
    const [globalDistributorsList, setglobalDistributorsList] = useState<any[]>([]);
    const [globalProductCatList, setglobalProductCatList] = useState<any[]>([]);

    //////////////////////// Init //////////////////////////




    //////////////////Helpers///////////////


    /////////////////Methods///////////////
    useEffect(() => {
        const init = async () => {

            const iteneryResponse = await findDistributors(token, { tokenString: token })
            if (iteneryResponse.salesPointsList != null) {
                setglobalSalesPoints(iteneryResponse.salesPointsList);
            } else {
                setglobalSalesPoints([]);
            }

            const itineraryResponseDtoDistributor = await retriewAllDistributors(token, { tokenString: token });
            if (itineraryResponseDtoDistributor?.success === true) {
                setglobalDistributorsList(itineraryResponseDtoDistributor?.disPointList)
            } else {
                setglobalDistributorsList([])
            }

            const tempStockResponce = await retrieveAllProductCategories(token, { tokenString: token });
            if (tempStockResponce?.success === true) {
                setglobalProductCatList(tempStockResponce.productCatList)
            } else {
                setglobalProductCatList([])
            }

        }

        if (token) {
            init();
        }
    }, [token, reload]);

    const retriewInvoiceList = async () => {
        const isPaymentDue = status === "0" ? true : status === "1" ? false : null;

        const tempRequest = {
            tokenString: token,
            locationId: shopID,
            startDate: dayjs(fromdate).format("YYYY-MM-DD 00:00:01"),
            endDate: dayjs(todate).format("YYYY-MM-DD 23:59:59"),
            paymentDueInvoices: isPaymentDue,
        };

        const invoiceRetriveResponce = await findAllReturnInvoices(token, tempRequest);

        if (invoiceRetriveResponce?.success === true) {
            setglobalReturnInvoiceDtoList(invoiceRetriveResponce.returnInvoiceDtoList);
        } else {
            setglobalReturnInvoiceDtoList([]);
            setAlert({
                open: true,
                type: "error",
                message: "No data available for the given period.",
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


    return (
        <PageContent title="Return Invoice" action={
            <CreateInvoiceDialog
                reload={reload}
                setReload={setReload}
            />}>
            <GlobalAlert alert={alert} setAlert={setAlert} />
            <Grid2 container width={'100%'} spacing={2} sx={{ alignItems: 'center' }} mb={2}>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <CustomDatePicker
                        label='From Date'
                        setvalue={setfromdate}
                        size={'small'}
                        value={fromdate}
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <CustomDatePicker
                        label='To Date'
                        setvalue={settodate}
                        size={'small'}
                        value={todate}
                    />
                </Grid2>
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
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Return Invoice Status</InputLabel>
                        <Select
                            label="Return Invoice Status"
                            value={status}
                            onChange={(e) => { setstatus(e.target.value); }}

                        >
                            <MenuItem value={"0"}>Closed return invoices</MenuItem>
                            <MenuItem value={"1"}>Open return invoices</MenuItem>

                        </Select>
                    </FormControl>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <Stack width={"100%"}>
                        <PrimaryButton
                            label='Search'
                            onClick={retriewInvoiceList}
                        />
                    </Stack>
                </Grid2>
            </Grid2>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell ><strong>Return Invoice ID</strong></TableCell>
                            <TableCell ><strong>Customer ID</strong></TableCell>
                            <TableCell ><strong>Store ID</strong></TableCell>
                            <TableCell ><strong>Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {globalReturnInvoiceDtoList
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.returnInvoice.returnInvoiceId}</TableCell>
                                    <TableCell>{row.returnInvoice.customerId}</TableCell>
                                    <TableCell>{row.returnInvoice.storeId}</TableCell>
                                    <TableCell>
                                        <ViewReturnInvoiceDialog selectedRtnInvoice={row} />
                                    </TableCell>
                                </TableRow>
                            ))}

                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={globalReturnInvoiceDtoList?.length || 0}
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
