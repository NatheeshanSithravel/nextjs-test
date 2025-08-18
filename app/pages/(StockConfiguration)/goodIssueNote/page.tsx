"use client"
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';
import PageContent from '@/app/(components)/(Page)/PageContent'
import { addProductCategory, addProductRequest, getGINByUser, productCode, retrieveAllProductCategories, retriewAllDistributors, } from '@/app/(services)/SFARestClient';
import { FormControl, Grid2, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import GINDialog from './(components)/GINDialog';
import { getRole, getToken } from '@/app/util/UserDataHandler';
import { UserRole } from '@/app/(enums)/UserRole';
import { redirect } from 'next/navigation';


export default function Product() {
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
                role == UserRole.COORDINATOR)) {
                redirect('/pages/dashboard')
            }
        }
    }, [role]);

    //////////////////////////////////////////////////

    ///////////////////// Attributes ///////////////////////
    const [globalProductCatList, setglobalProductCatList] = useState<any[]>([]);
    const [productList, setproductList] = useState<any[]>([]);
    const [globalDistributorsList, setglobalDistributorsList] = useState<any[]>([]);
    const [grnDtoList, setgrnDtoList] = useState<any[]>([]);
    const [status, setstatus] = useState<string>("Pending");

    //////////////////////// Init //////////////////////////
    useEffect(() => {

        const init = async () => {
            const res = await productCode(token, { tokenString: token });
            if (res.success === true) {
                setproductList(res.disProductList)
            } else {
                setproductList([])
            }


            // Get Categories
            const productRes = await retrieveAllProductCategories(token, { tokenString: token });
            if (productRes.success === true) {
                setglobalProductCatList(productRes.productCatList)
            } else {
                setglobalProductCatList([])
            }

            //Get Dealers
            const dealerRes = await retriewAllDistributors(token, { tokenString: token });
            if (dealerRes.success === true) {
                setglobalDistributorsList(dealerRes.disPointList)
            } else {
                setglobalDistributorsList([])
            }

            findIssueNotesByStatus();
        };

        if (token) {
            init();
        }
    }, [token, reload]);

    const findIssueNotesByStatus = async () => {
        // Get notes by status
        const noteRes = await getGINByUser(token, { tokenString: token, status: status });
        if (noteRes.success === true) {
            setgrnDtoList(noteRes.grnDtoList)
        } else {
            setgrnDtoList([])
        }
    }

    useEffect(() => {
        if (token && status) {
            findIssueNotesByStatus();
        }
    }, [status]);



    //////////////////Helpers///////////////


    /////////////////Methods///////////////



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
        <PageContent title="Good Issue Note" action={<GINDialog
            reload={reload}
            setReload={setReload}
            globalProductCatList={globalProductCatList}
            create={true}
            globalDistributorsList={globalDistributorsList}
            globalProductList={productList}


        />}>
            <GlobalAlert alert={alert} setAlert={setAlert} />
            <Grid2 container width={'100%'} spacing={2} sx={{ alignItems: 'center' }} mb={2}>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                            label="Status"
                            value={status}
                            onChange={(e) => { setstatus(e.target.value); }}

                        >
                            <MenuItem value={"Approved"}>Approved</MenuItem>
                            <MenuItem value={"Pending"}>Pending</MenuItem>

                        </Select>
                    </FormControl>
                </Grid2>
            </Grid2>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell ><strong>Invoice Number</strong></TableCell>
                            <TableCell ><strong>Dealer</strong></TableCell>
                            <TableCell ><strong>Created By</strong></TableCell>
                            <TableCell ><strong>Created At</strong></TableCell>
                            {status == "Approved" && <TableCell ><strong>Received At</strong></TableCell>}
                            <TableCell ><strong>Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {grnDtoList
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.disGrn.invoiceNumber}</TableCell>
                                    <TableCell>{row.disGrn.dealerName}</TableCell>
                                    <TableCell>{row.disGrn.userName}</TableCell>
                                    <TableCell>{row.disGrn.addedAt}</TableCell>
                                    {status == "Approved" && <TableCell>{row.disGrn.receivedAt}</TableCell>}
                                    <TableCell>
                                        <GINDialog
                                            reload={reload}
                                            setReload={setReload}
                                            globalProductCatList={globalProductCatList}
                                            view={true}
                                            globalDistributorsList={globalDistributorsList}
                                            globalProductList={productList}
                                            disGrn={row.disGrn}


                                        />
                                    </TableCell>
                                </TableRow>
                            ))}

                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={grnDtoList?.length || 0}
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
