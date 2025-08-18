"use client"
import PageContent from '@/app/(components)/(Page)/PageContent'
import { Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { finAllRootPlans, findAllDisPointsNew, findShopCategoryByCompanyId, getAllShops, retrivewDistributors } from '@/app/(services)/SFARestClient';
import ShopDialog from './(components)/ShopDialog';
import { getRole, getToken } from '@/app/util/UserDataHandler';
import { UserRole } from '@/app/(enums)/UserRole';
import { redirect } from 'next/navigation';


export default function ShopDetailsPage() {

    const [reload, setReload] = useState<boolean>(false);

    const [shopList, setshopList] = useState<any[]>([]);;
    const [filteredList, setfilteredList] = useState<any[]>([]);
    const [shopCategoryList, setshopCategoryList] = useState<any[]>([]);
    const [globalRootPlan, setglobalRootPlan] = useState<any[]>([]);



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
                role == UserRole.SALES_REP ||
                role == UserRole.DEALER
            )) {
                redirect('/pages/dashboard')
            }
        }
    }, [role]);

    useEffect(() => {
        const init = async () => {
            let res = await getAllShops(token, { tokenString: token })
            if (res.success === true) {
                setshopList(res.salesPointsList)
                setfilteredList(res.salesPointsList)
            } else {
                setshopList([])
                setfilteredList([])
            }

            let rootPlanRes = await finAllRootPlans(token, { tokenString: token });
            if (rootPlanRes.success === true) {
                setglobalRootPlan(rootPlanRes.rootPlans)
            } else {
                setglobalRootPlan([])
            }
        }
        init();
    }, [token, reload]);


    ///////////////////// API CALLS /////////////////////






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
        <PageContent title='Shop Details'
            action={
                (role == UserRole.COOP_ADMIN ||
                    role == UserRole.MANAGER ||
                    role == UserRole.COORDINATOR ||
                    role == UserRole.SALES_REP) &&
                <ShopDialog create={true} globalRootPlan={globalRootPlan} reload={reload} setReload={setReload} />}
        >

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Address</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>District</strong></TableCell>
                            <TableCell><strong>BRC code</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredList
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.shopName}</TableCell>
                                    <TableCell>{row.addressLine1}</TableCell>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell>{row.district}</TableCell>
                                    <TableCell>{row.brcCode}</TableCell>
                                    <TableCell align="center">
                                        <Stack direction={'row'} justifyContent={'center'} spacing={2}>
                                            <ShopDialog globalRootPlan={globalRootPlan} view={true} shop={row} reload={reload} setReload={setReload} />

                                            {(role == UserRole.COOP_ADMIN ||
                                                role == UserRole.MANAGER ||
                                                role == UserRole.COORDINATOR ||
                                                role == UserRole.SALES_REP) &&
                                                <ShopDialog globalRootPlan={globalRootPlan} edit={true} shop={row} reload={reload} setReload={setReload} />
                                            }
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}

                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={filteredList?.length || 0}
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
