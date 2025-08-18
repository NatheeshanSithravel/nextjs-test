"use client"
import PageContent from '@/app/(components)/(Page)/PageContent'
import { getRoleName, getRoleValue, UserRole } from '@/app/(enums)/UserRole';
import { viewUser } from '@/app/(services)/UserManagementService';
import { Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { findAllDisPointsNew, retrivewDistributors } from '@/app/(services)/SFARestClient';
import { UserStatus } from '@/app/(enums)/UserStatus';
import StoreDialog from './(components)/StoreDialog';
import { getCompanyID, getRole, getToken } from '@/app/util/UserDataHandler';
import { redirect } from 'next/navigation';

export default function DealerStorePage() {

    const [reload, setReload] = useState<boolean>(false);



    const [storesList, setstoresList] = useState<any[]>([]);
    const [filteredList, setfilteredList] = useState<any[]>([]);
    const [dealerList, setdealerList] = useState<any[]>([]);


    //// init /////
    const [token, settoken] = useState<any>(null);
    const [companyId, setcompanyId] = useState<any>(null);
    const [role, setrole] = useState<any>(null);

    useEffect(() => {
        const getData = async () => {
            settoken(await getToken());
            setcompanyId(await getCompanyID());
            setrole(await getRole());
        };
        getData();
    }, []);

    useEffect(() => {
        if (role != null) {
            if (role != UserRole.COOP_ADMIN) {
                redirect('/pages/dashboard')
            }
        }
    }, [role]);


    //// init /////

    useEffect(() => {
        findAllStores()
        findAllDealers()
    }, [token, reload, companyId]);


    ///////////////////// API CALLS /////////////////////
    const findAllStores = async () => {
        if (companyId != null && token != null) {
            let res: any = await findAllDisPointsNew(token, { tokenString: token });
            if (res?.success) {
                setstoresList(res.disPointList)
                setfilteredList(res.disPointList)
            } else {
                setstoresList([])
                setfilteredList([])
            }
        }
    }

    const findAllDealers = async () => {
        const req: any = {
            userRole: UserRole.DEALER,
            uStatus: UserStatus.ACTIVE
        }

        const res: any = await retrivewDistributors(token, req);

        if (res?.state == 0) {
            setdealerList(res.responseObject)
        } else {
            setdealerList([])
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
        <PageContent title='Dealer Store Details' action={<StoreDialog dealerList={dealerList} create={true} reload={reload} setReload={setReload} />}>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Location</strong></TableCell>
                            <TableCell><strong>Category</strong></TableCell>
                            <TableCell><strong>Dealer</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredList
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.storeName}</TableCell>
                                    <TableCell>{row.storeLocation}</TableCell>
                                    <TableCell>{row.storeCategory}</TableCell>
                                    <TableCell>{row.dealerName}</TableCell>
                                    <TableCell align="center">
                                        <Stack direction={'row'} justifyContent={'center'} spacing={2}>
                                            <StoreDialog dealerList={dealerList} view={true} store={row} reload={reload} setReload={setReload} />
                                            <StoreDialog dealerList={dealerList} edit={true} store={row} reload={reload} setReload={setReload} />
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
