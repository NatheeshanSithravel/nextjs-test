"use client"
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';
import PageContent from '@/app/(components)/(Page)/PageContent'
import { UserRole } from '@/app/(enums)/UserRole';
import { addProductCategory, addProductRequest, getBatchByProductCode, productCode, retrieveAllProductCategories, retrieveAllStoksForTheStore, retriewAllDistributors, } from '@/app/(services)/SFARestClient';
import { getRole, getToken } from '@/app/util/UserDataHandler';
import { FormControl, Grid2, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material'
import { redirect } from 'next/navigation';
import React, { useEffect, useLayoutEffect, useState } from 'react'


export default function ViewStock() {
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
            if (!(role == UserRole.COOP_ADMIN ||
                role == UserRole.MANAGER ||
                role == UserRole.COORDINATOR ||
                role == UserRole.SALES_REP ||
                role == UserRole.DEALER)) {
                redirect('/pages/dashboard')
            }
        }
    }, [role]);

    //////////////////////////////////////////////////

    ///////////////////// Attributes ///////////////////////
    const [selectedShop, setselectedShop] = useState<any>("");
    const [globalDistributorsList, setglobalDistributorsList] = useState<any[]>([]);
    const [globalStockList, setglobalStockList] = useState<any[]>([]);

    //////////////////////// Init //////////////////////////
    useEffect(() => {

        const init = async () => {
            const res = await retriewAllDistributors(token, { tokenString: token })

            if (res?.success === true) {
                setglobalDistributorsList(res.disPointList)
            } else {
                setglobalDistributorsList([]);
            }
        };

        if (token) {
            init();
        }
    }, [token, reload]);



    //////////////////Helpers///////////////


    /////////////////Methods///////////////
    const loadSelectedStore = async () => {
        setglobalStockList([]);

        const req = {
            tokenString: token,
            storeId: selectedShop
        }

        const res = await retrieveAllStoksForTheStore(token, req);

        if (res.success === true) {
            setglobalStockList(res.disStockList)
        } else {
            setglobalStockList([])
        }
    }

    useEffect(() => {
        if (selectedShop != "") {
            loadSelectedStore();
        }
    }, [selectedShop]);

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
        <PageContent title="View Stocks">
            <GlobalAlert alert={alert} setAlert={setAlert} />
            <Grid2 container width={'100%'}>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Shop Name *</InputLabel>
                        <Select
                            label="Shop Name *"
                            value={selectedShop || ""}
                            onChange={(e) => setselectedShop(e.target.value)}

                        >
                            <MenuItem value={""}>Please select an option</MenuItem>
                            {globalDistributorsList?.map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.storeName} - {item.dealerCode}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid2>
            </Grid2>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell ><strong>Product Code</strong></TableCell>
                            <TableCell ><strong>Product Name</strong></TableCell>
                            <TableCell><strong>Batch ID</strong></TableCell>
                            <TableCell ><strong>Manufactured Date</strong></TableCell>
                            <TableCell><strong>Expiry Date</strong></TableCell>
                            <TableCell ><strong>Quantity</strong></TableCell>
                            <TableCell ><strong>Wholesale Price</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {globalStockList
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.productCode}</TableCell>
                                    <TableCell>{row.productName}</TableCell>
                                    <TableCell>{row.batchId}</TableCell>
                                    <TableCell>{row.manufactureDate}</TableCell>
                                    <TableCell>{row.expiaryDate}</TableCell>
                                    <TableCell>{row.availableQuantity}</TableCell>
                                    <TableCell>{row.SKUPrice}</TableCell>
                                </TableRow>
                            ))}

                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={globalStockList?.length || 0}
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
