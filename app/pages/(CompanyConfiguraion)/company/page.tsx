"use client"
import PageContent from '@/app/(components)/(Page)/PageContent'
import { getRoleName, getRoleValue, UserRole } from '@/app/(enums)/UserRole';
import { viewUser } from '@/app/(services)/UserManagementService';
import { Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { findAllDisPointsNew, retriewCompanyObjList, retrivewDistributors } from '@/app/(services)/SFARestClient';
import { UserStatus } from '@/app/(enums)/UserStatus';
import CompanyDialog from './(components)/CompanyDialog';
import DeleteCompanyDialog from './(components)/DeleteCompanyDialog';
import { getCompanyID, getRole, getToken } from '@/app/util/UserDataHandler';
import { redirect } from 'next/navigation';

export default function CompanyPage() {

    const [reload, setReload] = useState<boolean>(false);




    const [storesList, setstoresList] = useState<any[]>([]);
    const [filteredList, setfilteredList] = useState<any[]>([]);



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
        if(role != null){
            if(!(role == UserRole.SUPER_ADMIN || role == UserRole.COOP_ADMIN)){
                redirect('/pages/dashboard')
            }
        }
    }, [role]);

    useEffect(() => {
        findAllCompanies()
    }, [token,reload,companyId]);


    ///////////////////// API CALLS /////////////////////
    const findAllCompanies = async () => {
        if (companyId != null && token != null) {
            let res:any = await retriewCompanyObjList(token, {});
            if (res?.state === 0) {
                setstoresList(res.responseObject)
                setfilteredList(res.responseObject)
            } else {
                setstoresList([])
                setfilteredList([])
            }
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
        <PageContent title='Company Details' action={ role == UserRole.SUPER_ADMIN && <CompanyDialog create={true} reload={reload} setReload={setReload} />}>
            
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>City</strong></TableCell>
                            <TableCell><strong>Manager</strong></TableCell>
                            <TableCell><strong>Branch</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredList
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any) => (
                                <TableRow key={row.companyId}>
                                    <TableCell>{row.companyId}</TableCell>
                                    <TableCell>{row.companyName}</TableCell>
                                    <TableCell>{row.city}</TableCell>
                                    <TableCell>{row.accountManager}</TableCell>
                                    <TableCell>{row.brcCode}</TableCell>
                                    <TableCell align="center">
                                        <Stack direction={'row'} justifyContent={'center'} spacing={2}>
                                            <CompanyDialog view={true} company={row} reload={reload} setReload={setReload} />
                                            <CompanyDialog  edit={true} company={row} reload={reload} setReload={setReload} />
                                            {/* <DeleteCompanyDialog reload={reload} setReload={setReload} company={row} /> */}
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
