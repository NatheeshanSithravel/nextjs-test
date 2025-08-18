"use client"
import PageContent from '@/app/(components)/(Page)/PageContent'
import { getRoleName, getRoleValue, UserRole } from '@/app/(enums)/UserRole';
import { viewUser } from '@/app/(services)/UserManagementService';
import { Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import UserDialog from './(components)/UserDialog';
import DeleteUserDialog from './(components)/DeleteUserDialog';
import { findAllAreaHirachy, getUmBranches, retriewUserRoles } from '@/app/(services)/SFARestClient';
import { getCompanyID, getRole, getToken } from '@/app/util/UserDataHandler';
import { redirect } from 'next/navigation';

export default function UserPage() {

    const [reload, setReload] = useState<boolean>(false);


    const [status, setstatus] = useState<any>(1);
    const [usersList, setusersList] = useState<any[]>([]);

    const [roleMasterList, setroleMasterList] = useState<any[]>([]);
    const [umBranchesList, setumBranchesList] = useState<any[]>([]);
    const [globalHierarchyList, setglobalHierarchyList] = useState<any[]>([]);

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
            if (!(role == UserRole.SUPER_ADMIN || role == UserRole.COOP_ADMIN)) {
                redirect('/pages/dashboard')
            }
        }
    }, [role]);


    //// init /////
    useEffect(() => {
        const init = async () => {
            if (token && role) {
                let roleResponse: any[] = await retriewUserRoles(token);
                if (roleResponse) {
                    let temp = roleResponse.filter(i => i.roleID > role)
                    setroleMasterList(temp);
                } else {
                    setroleMasterList([]);
                }


                let branchRes: any = await getUmBranches(token, companyId);
                setumBranchesList(branchRes?.success == true ? branchRes.branchesList : []);

                let hierarchyRes: any = await findAllAreaHirachy({ tokenString: token })
                // setglobalHierarchyList(hierarchyRes?.success == true ? hierarchyRes.areaHierarchyList : [])
                if(hierarchyRes?.success == true && hierarchyRes.areaHierarchyList.length > 0){
                    let temp: any[] = [];
                    for (let i of hierarchyRes.areaHierarchyList) {
                        if (i.id == 1 && role == UserRole.SUPER_ADMIN) {
                            temp.push(i)
                        } else if(i.id != 1){
                            temp.push(i)
                        }
                    }
                    setglobalHierarchyList(temp)
                } else {
                    setglobalHierarchyList([])
                }
                
            }
        }

        init();

    }, [token, role]);


    useEffect(() => {
        getAllUsersByStatus()
    }, [token, status, reload, role, companyId]);


    ///////////////////// API CALLS /////////////////////
    const getAllUsersByStatus = async () => {
        if (companyId != null && token != null) {
            let data: any[] = await viewUser(companyId, token, status);
            if (data != null) {
                setusersList(data)
            } else {
                setusersList([])
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
        <PageContent title='Manage Users' action={<UserDialog create={true} reload={reload} setReload={setReload} roleMasterList={roleMasterList} globalHierarchyList={globalHierarchyList} umBranchesList={umBranchesList} />}>
            <Stack width={'100%'} display={'flex'} flexDirection={'row'}>
                <FormControl size="small" >
                    <InputLabel>Status</InputLabel>
                    <Select
                        label="Status"
                        value={status}
                        variant="outlined"
                        onChange={(e) => setstatus(e.target.value)}
                    >
                        <MenuItem value={1}>ACTIVE</MenuItem>
                        <MenuItem value={0}>INACTIVE</MenuItem>
                        <MenuItem value={2}>DELETED</MenuItem>

                    </Select>
                </FormControl>
            </Stack>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Full Name</strong></TableCell>
                            <TableCell><strong>Mobile No</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Calling Name</strong></TableCell>
                            <TableCell><strong>Branch Code</strong></TableCell>
                            <TableCell><strong>Level Id</strong></TableCell>
                            <TableCell><strong>Line Manager</strong></TableCell>
                            <TableCell><strong>User Role</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {usersList.filter(user => role==UserRole.SUPER_ADMIN || user.id !== 6 )
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.fullName}</TableCell>
                                    <TableCell>{row.mobileNo}</TableCell>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell>{row.callingName}</TableCell>
                                    <TableCell>{row.branchCode}</TableCell>
                                    <TableCell>{row.levelId}</TableCell>
                                    <TableCell>{row.lineManager}</TableCell>
                                    <TableCell>{getRoleName(Number(row.userRole))}</TableCell>
                                    <TableCell align="center">
                                        <Stack direction={'row'} justifyContent={'center'} spacing={2}>
                                            <UserDialog roleMasterList={roleMasterList} globalHierarchyList={globalHierarchyList} umBranchesList={umBranchesList} view={true} user={row} reload={reload} setReload={setReload} />
                                            <UserDialog roleMasterList={roleMasterList} globalHierarchyList={globalHierarchyList} umBranchesList={umBranchesList} edit={true} user={row} reload={reload} setReload={setReload} />
                                            <DeleteUserDialog user={row} reload={reload} setReload={setReload} />
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}

                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={usersList?.length || 0}
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
