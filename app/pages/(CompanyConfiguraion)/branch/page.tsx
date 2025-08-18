"use client"
import PageContent from '@/app/(components)/(Page)/PageContent'
import React, { useEffect, useState } from 'react'
import BranchDialog from './(components)/BranchDialog'
import { Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import { getCompanyID, getRole, getToken } from '@/app/util/UserDataHandler';
import { getUmBranches } from '@/app/(services)/SFARestClient';
import { UserRole } from '@/app/(enums)/UserRole';
import { redirect } from 'next/navigation';

export default function BranchPage() {
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
    if (role != null) {
      if (!(role == UserRole.SUPER_ADMIN || role == UserRole.COOP_ADMIN)) {
        redirect('/pages/dashboard')
      }
    }
  }, [role]);

  useEffect(() => {
    findAllBranch()
  }, [token, reload, companyId]);


  ///////////////////// API CALLS /////////////////////
  const findAllBranch = async () => {
    if (companyId != null && token != null) {

      let branchRes: any = await getUmBranches(token, companyId);
      setfilteredList(branchRes?.success == true ? branchRes.branchesList : []);

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
    <PageContent title='Branches' action={
      <BranchDialog
        create={true}
        reload={reload}
        setReload={setReload}
      />
    }>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Branch Code</strong></TableCell>
              <TableCell><strong>Branch Name</strong></TableCell>
              <TableCell><strong>City</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredList
              ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
              .map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell>{row.branchCode}</TableCell>
                  <TableCell>{row.branchName}</TableCell>
                  <TableCell>{row.city}</TableCell>
                  <TableCell align="center">
                    <Stack direction={'row'} justifyContent={'center'} spacing={2}>
                      <BranchDialog view={true} branch={row} reload={reload} setReload={setReload} />
                      <BranchDialog edit={true} branch={row} reload={reload} setReload={setReload} />
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
