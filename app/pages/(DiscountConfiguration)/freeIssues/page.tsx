"use client"
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PageContent from '@/app/(components)/(Page)/PageContent'
import { productCode, retrieveAllProductCategories, selectAllDiscountByPro, selectFreeIssue, } from '@/app/(services)/SFARestClient';
import { FormControl, Grid2, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import FreeIssueDialog from './(components)/FreeIssueDialog';
import dayjs from 'dayjs';
import DeleteFreeIssueDialog from './(components)/DeleteFreeIssueDialog';
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
                role == UserRole.DEALER ||
                role == UserRole.SALES_REP)) {
                redirect('/pages/dashboard')
            }
        }
    }, [role]);

    // useLayoutEffect(() => {
    //     if (typeof window !== "undefined") {
    //         settoken(sessionStorage.getItem("token"))
    //         setcompanyId(sessionStorage.getItem("token")?.split(":")[4])
    //     }
    // }, []);

    //////////////////////////////////////////////////

    ///////////////////// Attributes ///////////////////////
    const [productList, setproductList] = useState<any[]>([]);
    const [pcode, setpcode] = useState<any>("");
    const [freeIssueList, setfreeIssueList] = useState<any[]>([]);
    const [globalProductCatList, setglobalProductCatList] = useState<any[]>([]);

    //////////////////////// Init //////////////////////////
    useEffect(() => {
        const init = async () => {
            const productRes = await retrieveAllProductCategories(token, { tokenString: token });
            if (productRes.success === true) {
                setglobalProductCatList(productRes.productCatList)
            } else {
                setglobalProductCatList([])
            }

            const res = await productCode(token, { tokenString: token });
            if (res.success === true) {
                setproductList(res.disProductList)
            } else {
                setproductList([])
            }
        };

        if (token) {
            init();
        }
    }, [token, reload]);



    //////////////////Helpers///////////////


    /////////////////Methods///////////////
    const selectFreeIssueHandler = async () => {
        const req = {
            tokenString: token,
            productCode: pcode
        }

        const res = await selectFreeIssue(token, req);

        if (res?.success) {
            setfreeIssueList(res.freeIssueList);
        } else {
            setfreeIssueList([]);
        }
    }

    useEffect(() => {
        if (pcode != "") {
            selectFreeIssueHandler();
        }
    }, [reload, pcode]);

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
        <PageContent title="Free Issues" action={(role == UserRole.COOP_ADMIN || role == UserRole.COORDINATOR) && <FreeIssueDialog
            reload={reload}
            setReload={setReload}
            create={true}
            globalProductList={productList}
            globalProductCatList={globalProductCatList}
        />}>
            <GlobalAlert alert={alert} setAlert={setAlert} />
            <Grid2 container width={'100%'}>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Product *</InputLabel>
                        <Select
                            label="Product *"
                            value={pcode || ""}
                            onChange={(e) => setpcode(e.target.value)}

                        >
                            <MenuItem value={""}>Please select an option</MenuItem>
                            {productList?.map((item) => (
                                <MenuItem key={item.productId} value={item.productCode}>
                                    {item.productName}
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
                            <TableCell ><strong>Free Issue Product Code</strong></TableCell>
                            <TableCell><strong>Offer Name</strong></TableCell>
                            <TableCell ><strong>Effective From</strong></TableCell>
                            <TableCell><strong>Effective To</strong></TableCell>
                            {(role == UserRole.COOP_ADMIN || role == UserRole.COORDINATOR) && <TableCell ><strong>Action</strong></TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {freeIssueList
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.productCode}</TableCell>
                                    <TableCell>{row.freeIssueProductCode}</TableCell>
                                    <TableCell>{row.freeIssueName}</TableCell>
                                    <TableCell>{dayjs(row.effectiveFrom).format('YYYY-MM-DD')}</TableCell>
                                    <TableCell>{dayjs(row.effectiveTo).format('YYYY-MM-DD')}</TableCell>
                                    {(role == UserRole.COOP_ADMIN || role == UserRole.COORDINATOR) && <TableCell>
                                        <Stack direction={'row'} spacing={1}>
                                            <FreeIssueDialog
                                                reload={reload}
                                                setReload={setReload}
                                                view={true}
                                                globalProductList={productList}
                                                globalProductCatList={globalProductCatList}
                                                freeIssue={row}
                                            />
                                            <FreeIssueDialog
                                                reload={reload}
                                                setReload={setReload}
                                                edit={true}
                                                globalProductList={productList}
                                                globalProductCatList={globalProductCatList}
                                                freeIssue={row}
                                            />
                                            <DeleteFreeIssueDialog
                                                reload={reload}
                                                setReload={setReload}
                                                freeIssue={row}
                                            />
                                        </Stack>
                                    </TableCell>}
                                </TableRow>
                            ))}

                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={freeIssueList?.length || 0}
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
